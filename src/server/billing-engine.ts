import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  Plan,
  PlanInterval,
  Subscription,
  SubscriptionInvoice,
  SubscriptionStatus,
  WorkspaceBillingStatus,
} from "@/lib/billing-types";

export const BillingEngine = {
  /**
   * Busca a assinatura ativa ou mais recente de um workspace.
   */
  async getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[BillingEngine] Erro ao buscar assinatura:", error);
      return null;
    }

    return (data as unknown as Subscription) ?? null;
  },

  /**
   * Busca o plano atualmente associado ao workspace.
   * Se não houver assinatura paga, assume o plano Starter em trial.
   */
  async getWorkspacePlan(workspaceId: string): Promise<{ plan: Plan; isTrial: boolean; status: WorkspaceBillingStatus }> {
    const { data: workspace } = await supabaseAdmin
      .from("workspaces")
      .select("status, trial_ends_at")
      .eq("id", workspaceId)
      .single();

    const currentStatus = (workspace?.status as WorkspaceBillingStatus) || "trial";
    const trialEndsAt = workspace?.trial_ends_at ? new Date(workspace.trial_ends_at) : new Date();
    const isTrial = currentStatus === "trial" && trialEndsAt.getTime() > Date.now();

    const subscription = await this.getWorkspaceSubscription(workspaceId);

    if (subscription && subscription.plan) {
      return {
        plan: subscription.plan,
        isTrial: false,
        status: currentStatus,
      };
    }

    // Busca o plano starter por default
    const { data: starterPlan } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("slug", "starter")
      .maybeSingle();

    const defaultPlan: Plan = (starterPlan as Plan) || {
      id: "00000000-0000-0000-0000-000000000001",
      slug: "starter",
      name: "Starter",
      description: "Plano essencial",
      monthly_price: 5990,
      annual_price: 59900,
      currency: "BRL",
      is_public: true,
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      plan: defaultPlan,
      isTrial,
      status: currentStatus,
    };
  },

  /**
   * Confirma pagamento bem-sucedido: ativa a assinatura e o workspace.
   */
  async handlePaymentSuccess(params: {
    workspaceId: string;
    planSlug: string;
    interval: PlanInterval;
    amountCents: number;
    providerSubscriptionId?: string;
    providerPaymentId?: string;
    providerInvoiceId?: string;
    payerEmail?: string;
  }): Promise<{ success: boolean; subscriptionId: string }> {
    const {
      workspaceId,
      planSlug,
      interval,
      amountCents,
      providerSubscriptionId,
      providerPaymentId,
      providerInvoiceId,
      payerEmail,
    } = params;

    // 1. Obter o plano correspondente
    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("id, name, slug")
      .eq("slug", planSlug)
      .single();

    if (!plan) throw new Error(`Plano "${planSlug}" não encontrado.`);

    const now = new Date();
    const periodEnd = new Date(now);
    if (interval === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // 2. Upsert do cliente de billing se email fornecido
    if (payerEmail) {
      await supabaseAdmin.from("billing_customers").upsert(
        {
          workspace_id: workspaceId,
          provider: "mercadopago",
          provider_customer_id: payerEmail,
          email: payerEmail,
          updated_at: now.toISOString(),
        },
        { onConflict: "workspace_id, provider" },
      );
    }

    // 3. Criar ou atualizar assinatura
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    let subscriptionId: string;

    if (existingSub) {
      subscriptionId = existingSub.id;
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan_id: plan.id,
          provider: "mercadopago",
          provider_subscription_id: providerSubscriptionId || null,
          status: "active" as SubscriptionStatus,
          billing_interval: interval,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          canceled_at: null,
          updated_at: now.toISOString(),
        })
        .eq("id", subscriptionId);
    } else {
      const { data: newSub, error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          workspace_id: workspaceId,
          plan_id: plan.id,
          provider: "mercadopago",
          provider_subscription_id: providerSubscriptionId || null,
          status: "active" as SubscriptionStatus,
          billing_interval: interval,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      subscriptionId = newSub.id;
    }

    // 4. Inserir fatura paga
    await supabaseAdmin.from("subscription_invoices").insert({
      subscription_id: subscriptionId,
      workspace_id: workspaceId,
      provider_invoice_id: providerInvoiceId || `inv_${Date.now()}`,
      provider_payment_id: providerPaymentId || null,
      status: "paid",
      amount: amountCents,
      currency: "BRL",
      due_at: now.toISOString(),
      paid_at: now.toISOString(),
    });

    // 5. Ativar workspace via supabaseAdmin (bypassa trigger restritivo com autoridade de servidor)
    await supabaseAdmin
      .from("workspaces")
      .update({ status: "active", updated_at: now.toISOString() })
      .eq("id", workspaceId);

    // 6. Registrar trilha de auditoria
    await this.logAudit({
      workspaceId,
      action: "payment_succeeded",
      reason: `Pagamento de R$ ${(amountCents / 100).toFixed(2)} confirmado para o plano ${plan.name} (${interval}).`,
      newValue: { plan: plan.slug, interval, amountCents, status: "active" },
    });

    return { success: true, subscriptionId };
  },

  /**
   * Trata falhas de pagamento colocando a assinatura em past_due e aplicando período de tolerância.
   */
  async handlePaymentFailure(params: {
    workspaceId: string;
    subscriptionId: string;
    reason: string;
  }): Promise<void> {
    const { workspaceId, subscriptionId, reason } = params;

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "past_due" as SubscriptionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    await this.logAudit({
      workspaceId,
      action: "payment_failed",
      reason: `Falha no processamento do pagamento: ${reason}. Workspace em tolerância.`,
      result: "failed",
    });
  },

  /**
   * Cancela a assinatura ao término do período pago.
   */
  async cancelSubscription(workspaceId: string): Promise<boolean> {
    const now = new Date().toISOString();

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!sub) return false;

    await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        canceled_at: now,
        updated_at: now,
      })
      .eq("id", sub.id);

    await this.logAudit({
      workspaceId,
      action: "subscription_canceled",
      reason: "Cancelamento solicitado pelo usuário. Acesso garantido até o fim do período vigente.",
      newValue: { cancel_at_period_end: true, period_end: sub.current_period_end },
    });

    return true;
  },

  /**
   * Expira o período de trial colocando o workspace em modo read_only.
   */
  async expireTrial(workspaceId: string): Promise<void> {
    const now = new Date().toISOString();

    await supabaseAdmin
      .from("workspaces")
      .update({ status: "read_only", updated_at: now })
      .eq("id", workspaceId);

    await this.logAudit({
      workspaceId,
      action: "trial_expired",
      reason: "Período de testes de 14 dias encerrado sem assinatura ativa. Workspace bloqueado em read-only.",
      newValue: { status: "read_only" },
    });
  },

  /**
   * Reativa um workspace após pagamento ou assinatura confirmada.
   */
  async reactivateWorkspace(workspaceId: string): Promise<void> {
    const now = new Date().toISOString();

    await supabaseAdmin
      .from("workspaces")
      .update({ status: "active", updated_at: now })
      .eq("id", workspaceId);

    await this.logAudit({
      workspaceId,
      action: "workspace_reactivated",
      reason: "Workspace reativado com sucesso.",
      newValue: { status: "active" },
    });
  },

  /**
   * Auxiliar de gravação padronizada em audit_logs.
   */
  async logAudit(params: {
    workspaceId: string;
    action: string;
    reason: string;
    oldValue?: Record<string, unknown> | undefined;
    newValue?: Record<string, unknown> | undefined;
    result?: "success" | "failed" | undefined;
  }): Promise<void> {
    try {
      await supabaseAdmin.from("audit_logs").insert({
        workspace_id: params.workspaceId,
        actor_type: "system",
        action: `billing:${params.action}`,
        target_type: "subscription",
        target_id: params.workspaceId,
        old_value: (params.oldValue as unknown as null) ?? null,
        new_value: (params.newValue as unknown as null) ?? null,
        reason: params.reason,
        result: params.result || "success",
      });
    } catch (err) {
      console.error("[BillingEngine] Falha ao registrar log de auditoria:", err);
    }
  },
};
