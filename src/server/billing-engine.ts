import { getServerSupabaseClient } from "./server-supabase";
import type {
  Plan,
  PlanInterval,
  Subscription,
  SubscriptionInvoice,
  SubscriptionStatus,
  WorkspaceBillingStatus,
} from "@/lib/billing-types";

export const CANONICAL_PLANS: Record<string, Plan> = {
  starter: {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "starter",
    name: "Starter",
    description: "Para quem está organizando a operação e consolidando métricas.",
    monthly_price: 5990,
    annual_price: 57500, // R$ 575,00/ano
    currency: "BRL",
    is_public: true,
    is_active: true,
    display_order: 1,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-03T00:00:00Z",
  },
  growth: {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "growth",
    name: "Growth",
    description: "Para operações que escalam tráfego pago e necessitam de DRE e atribuição completa.",
    monthly_price: 14990,
    annual_price: 143900, // R$ 1.439,00/ano
    currency: "BRL",
    is_public: true,
    is_active: true,
    display_order: 2,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-03T00:00:00Z",
  },
  scale: {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "scale",
    name: "Scale",
    description: "Para múltiplos negócios e times corporativos com automações de alto volume.",
    monthly_price: 29990,
    annual_price: 287900, // R$ 2.879,00/ano
    currency: "BRL",
    is_public: true,
    is_active: true,
    display_order: 3,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-03T00:00:00Z",
  },
  enterprise: {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "enterprise",
    name: "Enterprise",
    description: "Soluções sob medida para grandes marcas, agências e ecossistemas complexos.",
    monthly_price: 0,
    annual_price: 0,
    currency: "BRL",
    is_public: true,
    is_active: true,
    display_order: 4,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-03T00:00:00Z",
  },
};

export const BillingEngine = {
  /**
   * Instancia cliente seguro para o servidor (service_role ou RLS com Bearer token).
   */
  getDb(authHeader?: string | null) {
    return getServerSupabaseClient(authHeader);
  },

  /**
   * Retorna os planos canônicos da plataforma com ordenação oficial.
   */
  getCanonicalPlans(): Plan[] {
    return Object.values(CANONICAL_PLANS).sort((a, b) => a.display_order - b.display_order);
  },

  /**
   * Resolve um plano por slug a partir do banco de dados com fallback para o catálogo canônico oficial.
   * Garante que Starter, Growth, Scale e Enterprise sejam sempre identificáveis.
   */
  async resolvePlan(slug: string, authHeader?: string | null): Promise<Plan | null> {
    if (!slug) return null;
    const normalized = slug.toLowerCase().trim();

    try {
      const db = this.getDb(authHeader);
      const { data: dbPlan } = await db
        .from("plans")
        .select("*")
        .eq("slug", normalized)
        .maybeSingle();

      if (dbPlan) {
        return dbPlan as Plan;
      }
    } catch (err) {
      console.warn("[BillingEngine] Falha ao consultar tabela plans, usando catálogo canônico:", err);
    }

    return CANONICAL_PLANS[normalized] ?? null;
  },

  /**
   * Busca a assinatura ativa ou mais recente de um workspace.
   */
  async getWorkspaceSubscription(workspaceId: string, authHeader?: string | null): Promise<Subscription | null> {
    try {
      const db = this.getDb(authHeader);
      const { data, error } = await db
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if ((error as { code?: string }).code === "PGRST205") {
          const tableMissingError = new Error(
            "Tabela de faturamento ('subscriptions') não encontrada no schema cache do banco de dados remoto (PGRST205). As migrations de Billing precisam ser aplicadas no Supabase.",
          );
          (tableMissingError as any).code = "BILLING_SCHEMA_NOT_FOUND";
          throw tableMissingError;
        }
        console.warn("[BillingEngine] Aviso ao buscar assinatura:", (error as { message?: string }).message || error);
        return null;
      }

      return (data as unknown as Subscription) ?? null;
    } catch (err: any) {
      if (err?.code === "BILLING_SCHEMA_NOT_FOUND") {
        throw err;
      }
      console.warn("[BillingEngine] Falha de conexão ao buscar assinatura:", err);
      return null;
    }
  },

  /**
   * Busca o plano atualmente associado ao workspace.
   * Se não houver assinatura paga, assume o plano Starter em trial.
   */
  async getWorkspacePlan(
    workspaceId: string,
    authHeader?: string | null,
  ): Promise<{ plan: Plan; isTrial: boolean; status: WorkspaceBillingStatus }> {
    try {
      const db = this.getDb(authHeader);
      const { data: workspace } = await db
        .from("workspaces")
        .select("status, trial_ends_at")
        .eq("id", workspaceId)
        .maybeSingle();

      const currentStatus = (workspace?.status as WorkspaceBillingStatus) || "trial";
      const trialEndsAt = workspace?.trial_ends_at ? new Date(workspace.trial_ends_at) : new Date();
      const isTrial = currentStatus === "trial" && trialEndsAt.getTime() > Date.now();

      const subscription = await this.getWorkspaceSubscription(workspaceId, authHeader);

      if (subscription && subscription.plan) {
        return {
          plan: subscription.plan,
          isTrial: false,
          status: currentStatus,
        };
      }

      // Busca o plano starter por default
      const { data: starterPlan, error: starterError } = await db
        .from("plans")
        .select("*")
        .eq("slug", "starter")
        .maybeSingle();

      if (starterError && (starterError as { code?: string }).code === "PGRST205") {
        const tableMissingError = new Error(
          "Tabela de faturamento ('plans') não encontrada no schema cache do banco de dados remoto (PGRST205). As migrations de Billing precisam ser aplicadas no Supabase.",
        );
        (tableMissingError as any).code = "BILLING_SCHEMA_NOT_FOUND";
        throw tableMissingError;
      }

      const defaultPlan: Plan = (starterPlan as Plan) || {
        id: "00000000-0000-0000-0000-000000000001",
        slug: "starter",
        name: "Starter",
        description: "Plano essencial",
        monthly_price: 5990,
        annual_price: 57500, // R$ 575,00/ano com 20% OFF
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
    } catch (err: any) {
      if (err?.code === "BILLING_SCHEMA_NOT_FOUND") {
        throw err;
      }
      console.error("[BillingEngine] Falha ao resolver plano do workspace, retornando default seguro:", err);
      return {
        plan: {
          id: "00000000-0000-0000-0000-000000000001",
          slug: "starter",
          name: "Starter",
          description: "Plano essencial",
          monthly_price: 5990,
          annual_price: 57500,
          currency: "BRL",
          is_public: true,
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        isTrial: true,
        status: "trial",
      };
    }
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
  }, authHeader?: string | null): Promise<{ success: boolean; subscriptionId: string }> {
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
    const db = this.getDb(authHeader);

    // 1. Obter o plano correspondente via catálogo oficial
    const plan = await this.resolvePlan(planSlug, authHeader);
    if (!plan) throw new Error(`Plano "${planSlug}" não encontrado.`);

    const now = new Date();
    const periodEnd = new Date(now);
    if (interval === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    let subscriptionId = providerSubscriptionId || `sub_${Date.now()}`;

    // 2. Upsert do cliente de billing se email fornecido
    if (payerEmail) {
      try {
        await db.from("billing_customers").upsert(
          {
            workspace_id: workspaceId,
            provider: "mercadopago",
            provider_customer_id: payerEmail,
            email: payerEmail,
            updated_at: now.toISOString(),
          },
          { onConflict: "workspace_id, provider" },
        );
      } catch (e) {
        console.warn("[BillingEngine] Não foi possível salvar billing_customer:", e);
      }
    }

    // 3. Criar ou atualizar assinatura
    try {
      const { data: existingSub } = await db
        .from("subscriptions")
        .select("id")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (existingSub) {
        subscriptionId = existingSub.id;
        await db
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
        const { data: newSub, error: insertError } = await db
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

        if (insertError) {
          if ((insertError as { code?: string }).code === "PGRST205") {
            throw new Error(
              "Tabela de faturamento ('subscriptions') não encontrada no banco remoto (PGRST205). Não foi possível persistir a assinatura.",
            );
          }
          console.warn("[BillingEngine] Aviso ao persistir nova assinatura:", insertError);
        } else if (newSub?.id) {
          subscriptionId = newSub.id;
        }
      }
    } catch (e: any) {
      if (e?.message?.includes("PGRST205")) {
        throw e;
      }
      console.warn("[BillingEngine] Falha ao persistir registro em subscriptions:", e);
    }

    // 4. Inserir fatura paga
    try {
      await db.from("subscription_invoices").insert({
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
    } catch (e) {
      console.warn("[BillingEngine] Aviso ao registrar subscription_invoices:", e);
    }

    // 5. Ativar workspace via db
    try {
      await db
        .from("workspaces")
        .update({ status: "active", updated_at: now.toISOString() })
        .eq("id", workspaceId);
    } catch (e) {
      console.error("[BillingEngine] Erro ao atualizar status do workspace:", e);
    }

    // 6. Registrar trilha de auditoria
    await this.logAudit({
      workspaceId,
      action: "payment_succeeded",
      reason: `Pagamento de R$ ${(amountCents / 100).toFixed(2)} confirmado para o plano ${plan.name} (${interval}).`,
      newValue: { plan: plan.slug, interval, amountCents, status: "active" },
    }, authHeader);

    return { success: true, subscriptionId };
  },

  /**
   * Trata falhas de pagamento colocando a assinatura em past_due e aplicando período de tolerância.
   */
  async handlePaymentFailure(params: {
    workspaceId: string;
    subscriptionId: string;
    reason: string;
  }, authHeader?: string | null): Promise<void> {
    const { workspaceId, subscriptionId, reason } = params;
    const db = this.getDb(authHeader);

    await db
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
    }, authHeader);
  },

  /**
   * Cancela a assinatura ao término do período pago.
   */
  async cancelSubscription(workspaceId: string, authHeader?: string | null): Promise<boolean> {
    const now = new Date().toISOString();
    const db = this.getDb(authHeader);

    const { data: sub, error: subError } = await db
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (subError) {
      if ((subError as { code?: string }).code === "PGRST205") {
        throw new Error(
          "Tabela 'subscriptions' indisponível no banco de dados remoto (PGRST205). Não é possível processar cancelamento.",
        );
      }
      console.warn("[BillingEngine] Erro ao buscar assinatura para cancelamento:", subError);
      return false;
    }

    if (!sub) return false;

    await db
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
    }, authHeader);

    return true;
  },

  /**
   * Expira o período de trial colocando o workspace em modo read_only.
   */
  async expireTrial(workspaceId: string, authHeader?: string | null): Promise<void> {
    const now = new Date().toISOString();
    const db = this.getDb(authHeader);

    await db
      .from("workspaces")
      .update({ status: "read_only", updated_at: now })
      .eq("id", workspaceId);

    await this.logAudit({
      workspaceId,
      action: "trial_expired",
      reason: "Período de testes de 14 dias encerrado sem assinatura ativa. Workspace bloqueado em read-only.",
      newValue: { status: "read_only" },
    }, authHeader);
  },

  /**
   * Reativa um workspace após pagamento ou assinatura confirmada.
   */
  async reactivateWorkspace(workspaceId: string, authHeader?: string | null): Promise<void> {
    const now = new Date().toISOString();
    const db = this.getDb(authHeader);

    await db
      .from("workspaces")
      .update({ status: "active", updated_at: now })
      .eq("id", workspaceId);

    await this.logAudit({
      workspaceId,
      action: "workspace_reactivated",
      reason: "Workspace reativado com sucesso.",
      newValue: { status: "active" },
    }, authHeader);
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
  }, authHeader?: string | null): Promise<void> {
    try {
      const db = this.getDb(authHeader);
      await db.from("audit_logs").insert({
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
