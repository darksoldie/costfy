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
    const { data: existingEvent } = await db
      .from("billing_webhook_events")
      .select("id, processed")
      .eq("provider", "mercadopago")
      .eq("external_event_id", eventId)
      .maybeSingle();

    if (existingEvent && existingEvent.processed) {
      return new Response(
        JSON.stringify({ message: "Evento já processado anteriormente (idempotência garantida)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Registrar o evento antes de processar
    if (!existingEvent) {
      await db.from("billing_webhook_events").insert({
        provider: "mercadopago",
        external_event_id: eventId,
        event_type: eventType,
        payload,
        processed: false,
      });
    }

    // 4. Processar evento de acordo com a tipagem oficial do Mercado Pago
    // Cenário A: Evento de Pagamento (Criado, Atualizado, Aprovado, Recusado)
    if (
      eventType.includes("payment") ||
      payload["action"] === "payment.created" ||
      payload["action"] === "payment.updated"
    ) {
      const paymentData = (payload["data"] as Record<string, any> | undefined) || payload;
      const status = paymentData["status"];

      const externalReference = paymentData["external_reference"];
      let refParsed: { workspaceId?: string; planSlug?: string; interval?: PlanInterval } = {};

      try {
        if (typeof externalReference === "string" && externalReference.startsWith("{")) {
          refParsed = JSON.parse(externalReference);
        }
      } catch {
        // não json
      }

      const workspaceId = refParsed.workspaceId || paymentData["metadata"]?.workspace_id;
      const planSlug = refParsed.planSlug || paymentData["metadata"]?.plan_slug || "growth";
      const interval = refParsed.interval || "monthly";
      const amountCents = Math.round(Number(paymentData["transaction_amount"] || 149.9) * 100);

      if (workspaceId) {
        if (status === "approved") {
          await BillingEngine.handlePaymentSuccess({
            workspaceId,
            planSlug,
            interval,
            amountCents,
            providerPaymentId: String(paymentData["id"] || eventId),
            payerEmail: paymentData["payer"]?.email,
          });
        } else if (status === "rejected" || status === "cancelled") {
          await BillingEngine.handlePaymentFailure({
            workspaceId,
            subscriptionId: String(paymentData["id"] || eventId),
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
      const status = preapprovalData["status"];
      const externalReference = preapprovalData["external_reference"];
      let refParsed: { workspaceId?: string; planSlug?: string; interval?: PlanInterval } = {};

      try {
        if (typeof externalReference === "string" && externalReference.startsWith("{")) {
          refParsed = JSON.parse(externalReference);
        }
      } catch {
        // não json
      }

      const workspaceId = refParsed.workspaceId || preapprovalData["metadata"]?.workspace_id;
      const planSlug = refParsed.planSlug || preapprovalData["metadata"]?.plan_slug || "growth";
      const interval = refParsed.interval || (preapprovalData["auto_recurring"]?.frequency === 12 ? "annual" : "monthly");
      const amountCents = Math.round(
        Number(preapprovalData["auto_recurring"]?.transaction_amount || 149.9) * 100,
      );

      if (workspaceId) {
        if (status === "authorized") {
          await BillingEngine.handlePaymentSuccess({
            workspaceId,
            planSlug,
            interval,
            amountCents,
            providerSubscriptionId: String(preapprovalData["id"] || eventId),
            payerEmail: preapprovalData["payer_email"],
          });
        } else if (status === "cancelled") {
          await BillingEngine.cancelSubscription(workspaceId);
        }
      }
    }

    // 5. Marcar evento como processado para garantir idempotência estrita
    await db
      .from("billing_webhook_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("provider", "mercadopago")
      .eq("external_event_id", eventId);

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
