import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

export type WebhookProvider = "hotmart" | "kiwify" | "stripe" | "shopify";

export interface NormalizedWebhookOrder {
  externalId: string;
  orderNumber: string;
  status: "pending" | "paid" | "canceled" | "refunded" | "failed";
  financialStatus: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  productTitle: string;
  productSku?: string | null;
  productPrice?: number;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

export interface HotmartWebhookPayload {
  data?: {
    purchase?: {
      transaction?: string;
      status?: string;
      price?: { value?: number; currency_code?: string };
      payment?: { type?: string };
    };
    buyer?: {
      email?: string;
      name?: string;
      checkout_phone?: string;
    };
    product?: {
      id?: string | number;
      name?: string;
    };
    tracking?: {
      source?: string;
      campaign?: string;
    };
    price?: number | { value?: number; currency_code?: string };
    transaction?: string;
    source?: string;
  };
  purchase?: {
    transaction?: string;
    status?: string;
    price?: { value?: number; currency_code?: string };
    payment?: { type?: string };
  };
  buyer?: {
    email?: string;
    name?: string;
    checkout_phone?: string;
  };
  product?: {
    id?: string | number;
    name?: string;
  };
  tracking?: {
    source?: string;
    campaign?: string;
  };
  price?: number | { value?: number; currency_code?: string };
  transaction?: string;
  source?: string;
}

export interface KiwifyWebhookPayload {
  order?: {
    order_id?: string;
    order_status?: string;
    order_amount?: number | string;
    order_value?: number | string;
    currency?: string;
    payment_method?: string;
  };
  order_id?: string;
  order_status?: string;
  order_amount?: number | string;
  order_value?: number | string;
  currency?: string;
  payment_method?: string;
  Customer?: {
    email?: string;
    full_name?: string;
    name?: string;
    mobile?: string;
  };
  customer?: {
    email?: string;
    full_name?: string;
    name?: string;
    mobile?: string;
  };
  Product?: {
    product_name?: string;
    product_id?: string;
  };
  product?: {
    product_name?: string;
    product_id?: string;
  };
  TrackingParameters?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

export interface StripeWebhookPayload {
  type?: string;
  data?: {
    object?: {
      id?: string;
      payment_intent?: string;
      amount_total?: number;
      amount?: number;
      status?: string;
      currency?: string;
      payment_method_types?: string[];
      customer_details?: {
        email?: string;
        name?: string;
        phone?: string;
      };
      customer_email?: string;
      description?: string;
      metadata?: {
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        [key: string]: string | undefined;
      };
    };
  };
}

export class WebhookEngine {
  /**
   * Processa o webhook normalizado com garantia estrita de idempotência e auditoria.
   */
  static async processOrder(
    workspaceId: string,
    provider: WebhookProvider,
    normalized: NormalizedWebhookOrder,
    rawPayload: Json,
  ): Promise<{ success: boolean; orderId: string; isNew: boolean }> {
    // 1. Verificar idempotência por external_id no workspace
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("workspace_id", workspaceId)
      .eq("external_id", normalized.externalId)
      .maybeSingle();

    if (existingOrder) {
      // Pedido já registrado — atualizar status de forma idempotente se houve alteração (ex: reembolso/cancelamento)
      if (existingOrder.status !== normalized.status) {
        await supabaseAdmin
          .from("orders")
          .update({
            status: normalized.status,
            financial_status: normalized.financialStatus,
            synced_at: new Date().toISOString(),
          })
          .eq("id", existingOrder.id);

        await supabaseAdmin.from("audit_logs").insert({
          workspace_id: workspaceId,
          actor_type: "integration",
          action: `order_status_updated:${provider}`,
          target_type: "order",
          target_id: existingOrder.id,
          reason: `Webhook ${provider}: transição de ${existingOrder.status} para ${normalized.status}`,
          result: "success",
          old_value: { status: existingOrder.status },
          new_value: { status: normalized.status },
        });
      }

      await WebhookEngine.syncIntegrationRecord(workspaceId, provider);

      return { success: true, orderId: existingOrder.id, isNew: false };
    }

    // 2. Localizar ou criar cliente
    let customerId: string | null = null;
    if (normalized.customerEmail) {
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select("id, total_orders, total_spent")
        .eq("workspace_id", workspaceId)
        .eq("email", normalized.customerEmail.toLowerCase().trim())
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await supabaseAdmin
          .from("customers")
          .update({
            total_orders: existingCustomer.total_orders + 1,
            total_spent: Number(existingCustomer.total_spent) + normalized.totalAmount,
            last_order_at: new Date().toISOString(),
          })
          .eq("id", existingCustomer.id);
      } else {
        const nameParts = (normalized.customerName || "").trim().split(" ");
        const firstName = nameParts[0] || "Cliente";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data: newCustomer } = await supabaseAdmin
          .from("customers")
          .insert({
            workspace_id: workspaceId,
            email: normalized.customerEmail.toLowerCase().trim(),
            first_name: firstName,
            last_name: lastName,
            phone: normalized.customerPhone || null,
            total_orders: 1,
            total_spent: normalized.totalAmount,
            currency: normalized.currency,
            first_order_at: new Date().toISOString(),
            last_order_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        customerId = newCustomer?.id ?? null;
      }
    }

    // 3. Localizar ou criar produto
    let productId: string | null = null;
    if (normalized.productTitle) {
      const { data: existingProduct } = await supabaseAdmin
        .from("products")
        .select("id, cost_price")
        .eq("workspace_id", workspaceId)
        .eq("title", normalized.productTitle)
        .maybeSingle();

      if (existingProduct) {
        productId = existingProduct.id;
      } else {
        const { data: newProduct } = await supabaseAdmin
          .from("products")
          .insert({
            workspace_id: workspaceId,
            title: normalized.productTitle,
            sku: normalized.productSku || null,
            price: normalized.productPrice || normalized.totalAmount,
            cost_price: 0,
            currency: normalized.currency,
            status: "active",
          })
          .select("id")
          .single();

        productId = newProduct?.id ?? null;
      }
    }

    // 4. Inserir pedido
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        workspace_id: workspaceId,
        customer_id: customerId,
        external_id: normalized.externalId,
        order_number: normalized.orderNumber,
        status: normalized.status,
        financial_status: normalized.financialStatus,
        total_amount: normalized.totalAmount,
        total_base_currency: normalized.totalAmount,
        currency: normalized.currency,
        exchange_rate: 1.0,
        payment_method: normalized.paymentMethod,
        payment_gateway: normalized.paymentGateway,
        utm_source: normalized.utmSource || null,
        utm_medium: normalized.utmMedium || null,
        utm_campaign: normalized.utmCampaign || null,
        utm_content: normalized.utmContent || null,
        utm_term: normalized.utmTerm || null,
        ordered_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        metadata: { provider, raw: rawPayload },
      })
      .select("id")
      .single();

    if (orderError || !newOrder) {
      throw new Error(orderError?.message || "Falha ao gravar pedido");
    }

    // 5. Inserir item do pedido para auditoria de CMV
    await supabaseAdmin.from("order_items").insert({
      workspace_id: workspaceId,
      order_id: newOrder.id,
      product_id: productId,
      title: normalized.productTitle,
      sku: normalized.productSku || null,
      quantity: 1,
      unit_price: normalized.totalAmount,
      total_price: normalized.totalAmount,
      unit_cost: 0,
      total_cost: 0,
      currency: normalized.currency,
    });

    // 6. Registro de Auditoria
    await supabaseAdmin.from("audit_logs").insert({
      workspace_id: workspaceId,
      actor_type: "integration",
      action: `order_created:${provider}`,
      target_type: "order",
      target_id: newOrder.id,
      reason: `Venda processada via webhook ${provider} (${normalized.orderNumber})`,
      result: "success",
      new_value: {
        total: normalized.totalAmount,
        currency: normalized.currency,
        externalId: normalized.externalId,
      },
    });

    // 7. Atualizar status da integração
    await WebhookEngine.syncIntegrationRecord(workspaceId, provider);

    return { success: true, orderId: newOrder.id, isNew: true };
  }

  private static async syncIntegrationRecord(
    workspaceId: string,
    provider: WebhookProvider,
  ): Promise<void> {
    try {
      const { data: existingIntegration } = await supabaseAdmin
        .from("integrations")
        .select("id, record_count")
        .eq("workspace_id", workspaceId)
        .eq("provider", provider)
        .maybeSingle();

      if (existingIntegration) {
        await supabaseAdmin
          .from("integrations")
          .update({
            status: "connected",
            last_synced_at: new Date().toISOString(),
            record_count: Number(existingIntegration.record_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingIntegration.id);
      } else {
        const category = provider === "stripe" ? "Pagamentos" : "Infoprodutos";
        const displayName = provider.charAt(0).toUpperCase() + provider.slice(1);
        await supabaseAdmin.from("integrations").insert({
          workspace_id: workspaceId,
          provider,
          category,
          display_name: displayName,
          status: "connected",
          last_synced_at: new Date().toISOString(),
          record_count: 1,
        });
      }
    } catch (err: unknown) {
      console.warn("[Webhook] Não foi possível atualizar tabela de integrações:", err);
    }
  }

  // =====================================================================
  // ADAPTERS DE NORMALIZAÇÃO DE PAYLOADS
  // =====================================================================

  static parseHotmart(payload: HotmartWebhookPayload | unknown): NormalizedWebhookOrder {
    const p = (payload && typeof payload === "object" ? payload : {}) as HotmartWebhookPayload;
    const data = p.data || p;
    const purchase = data.purchase || {};
    const buyer = data.buyer || {};
    const product = data.product || {};

    const statusMap: Record<string, NormalizedWebhookOrder["status"]> = {
      APPROVED: "paid",
      COMPLETE: "paid",
      REFUNDED: "refunded",
      CHARGEBACK: "canceled",
      CANCELED: "canceled",
      EXPIRED: "failed",
    };

    const statusKey = purchase.status || "";
    const status = statusMap[statusKey] || "pending";
    const rawPrice = purchase.price?.value ?? (typeof data.price === "number" ? data.price : 0);
    const price = Number(rawPrice) || 0;

    return {
      externalId: purchase.transaction || data.transaction || `hot_${Date.now()}`,
      orderNumber: purchase.transaction || `HOT-${Date.now().toString().slice(-6)}`,
      status,
      financialStatus: purchase.status || "APPROVED",
      totalAmount: price,
      currency: purchase.price?.currency_code || "BRL",
      paymentMethod: purchase.payment?.type || "credit_card",
      paymentGateway: "hotmart",
      customerEmail: buyer.email || null,
      customerName: buyer.name || null,
      customerPhone: buyer.checkout_phone || null,
      productTitle: product.name || "Produto Hotmart",
      productSku: String(product.id || ""),
      productPrice: price,
      utmSource: data.tracking?.source || (typeof data.source === "string" ? data.source : null),
      utmCampaign: data.tracking?.campaign || null,
    };
  }

  static parseKiwify(payload: KiwifyWebhookPayload | unknown): NormalizedWebhookOrder {
    const p = (payload && typeof payload === "object" ? payload : {}) as KiwifyWebhookPayload;
    const order = p.order || p;
    const customer = p.Customer || p.customer || {};
    const product = p.Product || p.product || {};

    const statusMap: Record<string, NormalizedWebhookOrder["status"]> = {
      paid: "paid",
      refunded: "refunded",
      chargedback: "canceled",
      canceled: "canceled",
      waiting_payment: "pending",
    };

    const orderStatus = order.order_status || "";
    const status = statusMap[orderStatus] || "pending";
    const amountVal = order.order_amount ?? order.order_value ?? 0;
    const amount = Number(amountVal) / 100;

    return {
      externalId: order.order_id || `kiwi_${Date.now()}`,
      orderNumber: order.order_id || `KIWI-${Date.now().toString().slice(-6)}`,
      status,
      financialStatus: order.order_status || "paid",
      totalAmount: amount > 0 ? amount : Number(order.order_amount || 0),
      currency: order.currency || "BRL",
      paymentMethod: order.payment_method || "credit_card",
      paymentGateway: "kiwify",
      customerEmail: customer.email || null,
      customerName: customer.full_name || customer.name || null,
      customerPhone: customer.mobile || null,
      productTitle: product.product_name || "Produto Kiwify",
      productSku: product.product_id || null,
      productPrice: amount,
      utmSource: p.TrackingParameters?.utm_source || null,
      utmMedium: p.TrackingParameters?.utm_medium || null,
      utmCampaign: p.TrackingParameters?.utm_campaign || null,
      utmContent: p.TrackingParameters?.utm_content || null,
      utmTerm: p.TrackingParameters?.utm_term || null,
    };
  }

  static parseStripe(event: StripeWebhookPayload | unknown): NormalizedWebhookOrder {
    const ev = (event && typeof event === "object" ? event : {}) as StripeWebhookPayload;
    const object = ev.data?.object || {};
    const isRefund = Boolean(ev.type?.includes("refund") || ev.type?.includes("dispute"));
    const amount = (object.amount_total || object.amount || 0) / 100;

    return {
      externalId: object.id || `stripe_${Date.now()}`,
      orderNumber:
        object.payment_intent || object.id || `STRIPE-${Date.now().toString().slice(-6)}`,
      status: isRefund ? "refunded" : "paid",
      financialStatus: object.status || "succeeded",
      totalAmount: amount,
      currency: (object.currency || "usd").toUpperCase(),
      paymentMethod: object.payment_method_types?.[0] || "card",
      paymentGateway: "stripe",
      customerEmail: object.customer_details?.email || object.customer_email || null,
      customerName: object.customer_details?.name || null,
      customerPhone: object.customer_details?.phone || null,
      productTitle: object.description || "Checkout Stripe",
      productPrice: amount,
      utmSource: object.metadata?.utm_source || null,
      utmMedium: object.metadata?.utm_medium || null,
      utmCampaign: object.metadata?.utm_campaign || null,
    };
  }
}
