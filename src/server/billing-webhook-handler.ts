import { getServerSupabaseClient } from "./server-supabase";
import { defaultBillingProvider } from "./billing-provider";
import { BillingEngine } from "./billing-engine";
import type { PlanInterval } from "@/lib/billing-types";

export async function handleBillingWebhookRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-signature, x-request-id",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const db = getServerSupabaseClient();

  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return new Response(JSON.stringify({ error: "Payload vazio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Validar autenticidade/assinatura do Mercado Pago
    const isValidSignature = await defaultBillingProvider.verifyWebhookSignature(request, bodyText);
    if (!isValidSignature) {
      console.error("[BillingWebhook] Assinatura inválida no webhook do Mercado Pago.");
      return new Response(JSON.stringify({ error: "Assinatura inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "JSON inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Extrair external_event_id
    const payloadData = payload["data"] as Record<string, any> | undefined;
    const eventId = String(
      payload["id"] ||
      payloadData?.["id"] ||
      request.headers.get("x-request-id") ||
      `mp_evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    );

    const eventType = String(payload["type"] || payload["action"] || "unknown");

    // 3. Garantia de Idempotência via banco de dados
    let isAlreadyProcessed = false;
    try {
      const { data: existingEvent } = await db
        .from("billing_webhook_events")
        .select("id, processed")
        .eq("provider", "mercadopago")
        .eq("external_event_id", eventId)
        .maybeSingle();

      if (existingEvent && existingEvent.processed) {
        isAlreadyProcessed = true;
      }

      if (!existingEvent && !isAlreadyProcessed) {
        await db.from("billing_webhook_events").insert({
          provider: "mercadopago",
          external_event_id: eventId,
          event_type: eventType,
          payload,
          processed: false,
        });
      }
    } catch (dbErr) {
      console.warn("[BillingWebhook] Aviso ao registrar billing_webhook_events:", dbErr);
    }

    if (isAlreadyProcessed) {
      return new Response(
        JSON.stringify({ message: "Evento já processado anteriormente (idempotência garantida)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. Processar evento de acordo com a tipagem oficial do Mercado Pago
    // Cenário A: Evento de Pagamento (Criado, Atualizado, Aprovado, Recusado)
    if (
      eventType.includes("payment") ||
      payload["action"] === "payment.created" ||
      payload["action"] === "payment.updated"
    ) {
      const paymentData = (payload["data"] as Record<string, any> | undefined) || payload;
      let status = paymentData["status"];

      const externalReference = paymentData["external_reference"];
      let refParsed: { workspaceId?: string; planSlug?: string; interval?: PlanInterval } = {};

      try {
        if (typeof externalReference === "string" && externalReference.startsWith("{")) {
          refParsed = JSON.parse(externalReference);
        }
      } catch {
        // não json
      }

      let workspaceId = refParsed.workspaceId || paymentData["metadata"]?.workspace_id;
      let planSlug = refParsed.planSlug || paymentData["metadata"]?.plan_slug || "growth";
      let interval = refParsed.interval || "monthly";
      let amountCents = Math.round(Number(paymentData["transaction_amount"] || 149.9) * 100);

      // Se payload veio apenas com ID, consultar API do Mercado Pago
      const paymentId = String(paymentData["id"] || payloadData?.["id"] || "");
      if (paymentId && (!status || !workspaceId)) {
        try {
          const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
          if (accessToken) {
            const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (mpRes.ok) {
              const livePay = await mpRes.json();
              status = status || livePay.status;
              amountCents = Math.round(Number(livePay.transaction_amount || 149.9) * 100);
              if (livePay.external_reference?.startsWith("{")) {
                const parsed = JSON.parse(livePay.external_reference);
                workspaceId = workspaceId || parsed.workspaceId;
                planSlug = planSlug || parsed.planSlug;
                interval = interval || parsed.interval;
              }
            }
          }
        } catch (e) {
          console.warn("[BillingWebhook] Falha ao consultar pagamento na API do MP:", e);
        }
      }

      if (workspaceId) {
        if (status === "approved") {
          await BillingEngine.handlePaymentSuccess({
            workspaceId,
            planSlug,
            interval,
            amountCents,
            providerPaymentId: paymentId || eventId,
            payerEmail: paymentData["payer"]?.email,
          });
        } else if (status === "rejected" || status === "cancelled") {
          await BillingEngine.handlePaymentFailure({
            workspaceId,
            subscriptionId: paymentId || eventId,
            reason: paymentData["status_detail"] || "Pagamento recusado ou cancelado no Mercado Pago",
          });
        }
      }
    }

    // Cenário B: Evento de Assinatura Recorrente (Preapproval)
    if (
      eventType.includes("preapproval") ||
      eventType.includes("subscription") ||
      payload["action"] === "created" ||
      payload["action"] === "updated"
    ) {
      const preapprovalData = (payload["data"] as Record<string, any> | undefined) || payload;
      let status = preapprovalData["status"];
      const externalReference = preapprovalData["external_reference"];
      let refParsed: { workspaceId?: string; planSlug?: string; interval?: PlanInterval } = {};

      try {
        if (typeof externalReference === "string" && externalReference.startsWith("{")) {
          refParsed = JSON.parse(externalReference);
        }
      } catch {
        // não json
      }

      let workspaceId = refParsed.workspaceId || preapprovalData["metadata"]?.workspace_id;
      let planSlug = refParsed.planSlug || preapprovalData["metadata"]?.plan_slug || "growth";
      let interval = refParsed.interval || (preapprovalData["auto_recurring"]?.frequency === 12 ? "annual" : "monthly");
      let amountCents = Math.round(
        Number(preapprovalData["auto_recurring"]?.transaction_amount || 149.9) * 100,
      );

      // Consulta de fallback caso o payload do Mercado Pago envie apenas o id
      const preapprovalId = String(preapprovalData["id"] || payloadData?.["id"] || "");
      if (preapprovalId && (!status || !workspaceId)) {
        try {
          const liveSub = await defaultBillingProvider.getSubscription(preapprovalId);
          if (liveSub) {
            status = status || liveSub.status;
            // Se workspaceId não veio no payload, busca na tabela subscriptions pelo provider_subscription_id
            if (!workspaceId) {
              const { data: localSub } = await db
                .from("subscriptions")
                .select("workspace_id, billing_interval, plan:plans(slug)")
                .eq("provider_subscription_id", preapprovalId)
                .maybeSingle();

              if (localSub) {
                workspaceId = localSub.workspace_id;
                interval = localSub.billing_interval || interval;
                planSlug = (localSub.plan as any)?.slug || planSlug;
              }
            }
          }
        } catch (e) {
          console.warn("[BillingWebhook] Falha ao consultar preapproval na API do MP:", e);
        }
      }

      if (workspaceId) {
        if (status === "authorized") {
          await BillingEngine.handlePaymentSuccess({
            workspaceId,
            planSlug,
            interval,
            amountCents,
            providerSubscriptionId: preapprovalId || eventId,
            payerEmail: preapprovalData["payer_email"],
          });
        } else if (status === "cancelled") {
          await BillingEngine.cancelSubscription(workspaceId);
        }
      }
    }

    // 5. Marcar evento como processado para garantir idempotência estrita
    try {
      await db
        .from("billing_webhook_events")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("provider", "mercadopago")
        .eq("external_event_id", eventId);
    } catch (e) {
      console.warn("[BillingWebhook] Aviso ao atualizar billing_webhook_events:", e);
    }

    return new Response(JSON.stringify({ success: true, processedEventId: eventId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[BillingWebhook] Falha no processamento:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
