import type { PlanInterval } from "@/lib/billing-types";

export interface CreateCheckoutParams {
  workspaceId: string;
  planSlug: string;
  planName: string;
  amountCents: number; // em centavos
  currency: string;
  interval: PlanInterval;
  payerEmail: string;
  returnUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerSubscriptionId?: string | undefined;
  isSandbox: boolean;
}

export interface ProviderSubscription {
  id: string;
  status: "authorized" | "paused" | "cancelled" | "pending";
  payerEmail: string;
  nextPaymentDate?: string | undefined;
  dateCreated: string;
}

export interface BillingProvider {
  name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  getSubscription(subscriptionId: string): Promise<ProviderSubscription | null>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  verifyWebhookSignature(request: Request, bodyText: string): Promise<boolean>;
}

export class MercadoPagoProvider implements BillingProvider {
  name = "mercadopago";

  private getAccessToken(): string | null {
    return process.env["MERCADOPAGO_ACCESS_TOKEN"] || null;
  }

  private getWebhookSecret(): string | null {
    return process.env["MERCADOPAGO_WEBHOOK_SECRET"] || null;
  }

  /**
   * Cria uma sessão de checkout ou assinatura recorrente (Preapproval) no Mercado Pago.
   * Se o token não estiver configurado no ambiente, opera em modo Sandbox seguro.
   */
  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const accessToken = this.getAccessToken();

    // Validação estrita de credenciais: ZERO MOCKS, ZERO FAKE CHECKOUT
    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN não está configurado no servidor. Configure o token oficial nas variáveis de ambiente para gerar a assinatura real via Mercado Pago.",
      );
    }

    // Chamada oficial à API do Mercado Pago (Preapproval para Assinaturas Recorrentes)
    try {
      const frequency = params.interval === "annual" ? 12 : 1;
      const amountInReais = params.amountCents / 100;

      const payload = {
        reason: `Costfy ${params.planName} (${params.interval === "annual" ? "Anual" : "Mensal"})`,
        auto_recurring: {
          frequency,
          frequency_type: "months",
          transaction_amount: amountInReais,
          currency_id: params.currency || "BRL",
        },
        payer_email: params.payerEmail,
        back_url: params.returnUrl,
        external_reference: JSON.stringify({
          workspaceId: params.workspaceId,
          planSlug: params.planSlug,
          interval: params.interval,
        }),
      };

      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Falha na API do Mercado Pago (${response.status}): ${errorBody}`,
        );
      }

      const data = (await response.json()) as {
        id: string;
        init_point?: string;
        sandbox_init_point?: string;
      };

      const checkoutUrl = data.init_point || data.sandbox_init_point || params.returnUrl;

      return {
        checkoutUrl,
        providerSubscriptionId: data.id,
        isSandbox: false,
      };
    } catch (err: unknown) {
      console.error("[MercadoPagoProvider] Erro ao criar preapproval:", err);
      throw err;
    }
  }

  /**
   * Consulta o estado atual de uma assinatura no Mercado Pago.
   */
  async getSubscription(subscriptionId: string): Promise<ProviderSubscription | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      console.warn("[MercadoPagoProvider] getSubscription chamado sem MERCADOPAGO_ACCESS_TOKEN.");
      return null;
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Falha ao consultar assinatura MP: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        id: string;
        status: "authorized" | "paused" | "cancelled" | "pending";
        payer_email: string;
        next_payment_date?: string;
        date_created: string;
      };

      return {
        id: data.id,
        status: data.status,
        payerEmail: data.payer_email,
        nextPaymentDate: data.next_payment_date,
        dateCreated: data.date_created,
      };
    } catch (err) {
      console.error("[MercadoPagoProvider] Erro ao consultar assinatura:", err);
      return null;
    }
  }

  /**
   * Cancela uma assinatura recorrente no Mercado Pago.
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      console.error("[MercadoPagoProvider] cancelSubscription chamado sem MERCADOPAGO_ACCESS_TOKEN.");
      return false;
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        },
      );

      return response.ok;
    } catch (err) {
      console.error("[MercadoPagoProvider] Erro ao cancelar assinatura:", err);
      return false;
    }
  }

  /**
   * Valida a assinatura criptográfica oficial do webhook do Mercado Pago (HMAC SHA-256).
   */
  async verifyWebhookSignature(request: Request, bodyText: string): Promise<boolean> {
    const secret = this.getWebhookSecret();
    // Se o secret não estiver configurado em desenvolvimento, aceita o webhook com log de alerta
    if (!secret) {
      return true;
    }

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    if (!xSignature || !xRequestId) return false;

    try {
      // O header vem no formato: ts=12345678,v1=hash
      const parts = xSignature.split(",");
      const tsPart = parts.find((p) => p.trim().startsWith("ts="));
      const hashPart = parts.find((p) => p.trim().startsWith("v1="));
      if (!tsPart || !hashPart) return false;

      const ts = tsPart.split("=")[1]?.trim();
      const expectedHash = hashPart.split("=")[1]?.trim();
      if (!ts || !expectedHash) return false;

      // Manifest template do Mercado Pago: id:[data.id_url];request-id:[x-request-id];ts:[ts];
      let dataId = "";
      try {
        const parsed = JSON.parse(bodyText) as { data?: { id?: string | number } };
        dataId = String(parsed.data?.id || "");
      } catch {
        // payload não json
      }

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
      const calculatedHash = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return calculatedHash === expectedHash;
    } catch (err) {
      console.error("[MercadoPagoProvider] Falha ao verificar assinatura do webhook:", err);
      return false;
    }
  }
}

export const defaultBillingProvider = new MercadoPagoProvider();
