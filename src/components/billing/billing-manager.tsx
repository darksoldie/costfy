import { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  Layers,
  Users,
  LineChart,
  Boxes,
  HelpCircle,
} from "lucide-react";

import { useWorkspace } from "@/components/app/workspace-context";
import { CostfyMark } from "@/components/brand/costfy-mark";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Plan, PlanInterval, Subscription, WorkspaceUsageStats } from "@/lib/billing-types";
import { resolveBillingState } from "@/lib/billing-state";

interface BillingApiResponse {
  plan: Plan;
  isTrial: boolean;
  workspaceStatus: string;
  subscription: Subscription | null;
  invoices: Array<{
    id: string;
    provider_invoice_id?: string | null;
    amount: number;
    status: string;
    paid_at?: string | null;
  }>;
  usage: WorkspaceUsageStats;
}

export function BillingManager() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const [data, setData] = useState<BillingApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Intervalo selecionado no modal de planos: 'monthly' ou 'annual'
  const [selectedInterval, setSelectedInterval] = useState<PlanInterval>("monthly");
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);

  async function fetchBillingData() {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = {
        "x-costfy-workspace-id": workspaceId,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/billing/subscription?workspace_id=${encodeURIComponent(workspaceId)}`, {
        headers,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Falha ao sincronizar dados de faturamento com o servidor.");
      }

      const json = (await res.json()) as BillingApiResponse;
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar faturamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBillingData();
  }, [workspaceId]);

  // Verificar se retornou do checkout com status de aprovado ou com intenção de plano (?plan=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("status") === "approved") {
      setSuccessMessage("Retorno do checkout recebido! Sincronizando confirmação do Mercado Pago com o servidor...");
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchBillingData();
    }

    const planParam = urlParams.get("plan");
    const intervalParam = urlParams.get("interval");
    if (intervalParam === "annual" || intervalParam === "monthly") {
      setSelectedInterval(intervalParam);
    }
    if (planParam && ["starter", "growth", "scale"].includes(planParam.toLowerCase())) {
      setHighlightedPlan(planParam.toLowerCase());
      setShowPlansModal(true);
    }
  }, []);

  async function handleCheckout(planSlug: string, interval: PlanInterval) {
    if (!workspaceId) return;
    setCheckoutLoading(planSlug);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspaceId,
          planSlug,
          interval,
          email: active?.workspace.created_by ? undefined : "contato@costfy.com.br",
          returnUrl: `${window.location.origin}/billing`,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Erro ao iniciar checkout.");
      }

      const checkout = await res.json();
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao processar checkout.");
      setCheckoutLoading(null);
    }
  }

  async function handleCancelSubscription() {
    if (!workspaceId) return;
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? O acesso será mantido até o final do período vigente.")) {
      return;
    }

    setCancelLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers,
        body: JSON.stringify({ workspaceId }),
      });

      if (!res.ok) throw new Error("Erro ao cancelar assinatura.");
      setSuccessMessage("Assinatura cancelada com sucesso. Seu acesso continuará ativo até o término do ciclo atual.");
      fetchBillingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha no cancelamento.");
    } finally {
      setCancelLoading(false);
    }
  }

  // 1. ESTADO DE CARREGAMENTO
  if (loading && !data) {
    return (
      <div className="editorial-card p-10 text-center space-y-3 animate-fade">
        <RefreshCw className="size-6 animate-spin mx-auto text-primary" />
        <p className="text-[13.5px] font-medium text-foreground">Carregando dados de faturamento...</p>
        <p className="text-[12px] text-muted-foreground">Sincronizando plano oficial, limites e faturas do workspace.</p>
      </div>
    );
  }

  // 2. ESTADO DE ERRO EXPLÍCITO (Erro de carregamento ≠ Assinatura expirada)
  if (error && !data) {
    return (
      <div className="space-y-6 animate-fade">
        <div className="editorial-card p-6 sm:p-8 space-y-4 border-destructive/30 bg-destructive/[0.02]">
          <div className="flex items-start gap-3.5">
            <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-[15px] font-semibold text-foreground">
                Falha ao carregar dados de faturamento
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Não foi possível sincronizar o estado da assinatura no momento. Isso é uma instabilidade temporária na consulta e <strong>não significa que sua conta expirou</strong>. Todos os dados operacionais do workspace continuam preservados e seguros.
              </p>
              <p className="text-[11.5px] font-mono text-destructive/90 bg-destructive/5 p-2 rounded border border-destructive/20 mt-2">
                {error}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => fetchBillingData()}
              className={buttonClass("primary", "sm", "gap-1.5")}
            >
              <RefreshCw className="size-3.5" />
              <span>Tentar novamente</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={buttonClass("outline", "sm")}
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. RESOLUÇÃO RIGOROSA DO ESTADO DE BILLING
  const billingInfo = resolveBillingState({
    workspaceStatus: data?.workspaceStatus ?? active?.workspace.status,
    trialEndsAt: active?.workspace.trial_ends_at,
    subscription: data?.subscription,
  });

  const isReadOnly = billingInfo.state === "READ_ONLY";
  const plan = data?.plan;
  const subscription = data?.subscription;
  const usage = data?.usage;

  const trialEnds = active?.workspace.trial_ends_at ? new Date(active.workspace.trial_ends_at) : null;

  return (
    <div className="space-y-6 animate-fade">
      {/* Mensagens de Feedback */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-[13px] font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Banner de Read-Only se o Trial ou Assinatura realmente encerrou */}
      {isReadOnly && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold text-[14.5px]">
            <AlertTriangle className="size-5" />
            <span>Período de teste encerrado — Workspace em Modo Somente Leitura</span>
          </div>
          <p className="text-[12.5px] text-destructive/90 max-w-2xl leading-relaxed">
            As criações de campanhas, automações e ações do Brain foram pausadas no servidor para preservação da base de dados. Para reativar as operações imediatamente, escolha um plano abaixo.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleCheckout("growth", "monthly")}
              className={buttonClass("primary", "md", "gap-1.5 shadow-sm")}
            >
              <Zap className="size-4" />
              <span>Ativar Costfy no Plano Growth</span>
            </button>
          </div>
        </div>
      )}

      {/* CARD 1: Plano Atual e Estado Real */}
      <section className="editorial-card p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <CostfyMark size={20} className="text-primary" />
              <h2 className="text-[16px] font-semibold text-foreground">
                Plano Atual: {plan?.name || "Starter"}
              </h2>

              {/* Badge de Estado Real Padronizado */}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    billingInfo.badgeTone === "active" && "border-success/30 bg-success/10 text-success",
                    billingInfo.badgeTone === "trial" && "border-primary/30 bg-primary/10 text-primary",
                    billingInfo.badgeTone === "warning" && "border-warning/30 bg-warning/10 text-warning",
                    billingInfo.badgeTone === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive",
                    billingInfo.badgeTone === "neutral" && "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {billingInfo.badgeLabel}
                </span>

                {billingInfo.state === "TRIAL" && (
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10.5px] font-medium text-primary">
                    {billingInfo.daysRemaining} {billingInfo.daysRemaining === 1 ? "dia restante" : "dias restantes"}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[12.5px] text-muted-foreground mt-1">
              {billingInfo.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPlansModal(!showPlansModal)}
              className={buttonClass("primary", "sm", "gap-1")}
            >
              <ArrowUpRight className="size-3.5" />
              <span>{subscription?.status === "active" ? "Mudar de Plano" : "Escolher Plano Oficial"}</span>
            </button>
          </div>
        </div>

        {/* Detalhes de Faturamento */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-[13px]">
          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">Valor da Assinatura</span>
            <p className="mt-1.5 text-[16px] font-bold text-foreground tabular-nums">
              {plan ? `R$ ${(plan.monthly_price / 100).toFixed(2).replace(".", ",")}/mês` : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {subscription?.billing_interval === "annual" ? "Faturamento anual (20% OFF)" : "Faturamento mensal"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">
              {billingInfo.state === "TRIAL" ? "Término do Teste" : "Próxima Renovação"}
            </span>
            <p className="mt-1.5 text-[15px] font-semibold text-foreground tabular-nums">
              {subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
                : trialEnds
                  ? trialEnds.toLocaleDateString("pt-BR")
                  : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {billingInfo.state === "TRIAL"
                ? "Teste de 14 dias sem cartão"
                : subscription?.cancel_at_period_end
                  ? "Cancelamento agendado"
                  : "Renovação automática"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">Gateway Oficial</span>
            <div className="mt-1.5 flex items-center gap-1.5 font-semibold text-foreground">
              <CreditCard className="size-4 text-primary" />
              <span>Mercado Pago</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Criptografia e segurança bancária
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">Ações da Conta</span>
            <div className="mt-1.5">
              {subscription?.status === "active" && !subscription.cancel_at_period_end ? (
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={handleCancelSubscription}
                  className="text-[12px] font-medium text-destructive hover:underline"
                >
                  {cancelLoading ? "Processando..." : "Cancelar assinatura"}
                </button>
              ) : (
                <span className="text-[12px] text-muted-foreground">
                  {billingInfo.state === "TRIAL" ? "Sem compromisso" : "Regular"}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CARD 2: Limites Operacionais do Plano (Usage Engine) */}
      {usage && (
        <section className="editorial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="type-h3 text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Consumo e Limites Operacionais do Plano
              </h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Monitoramento em tempo real do uso de cotas do seu workspace.
              </p>
            </div>
            <span className="text-[11.5px] font-mono text-muted-foreground">
              Motor: UsageEngine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Membros */}
            <div className="rounded-lg border border-border/80 bg-surface/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" /> Membros do Time
                </span>
                <span className="tabular-nums font-semibold text-foreground">
                  {usage.members.current} / {usage.members.unlimited ? "Ilimitado" : usage.members.limit}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  style={{ width: `${usage.members.percentage}%` }}
                  className="h-full bg-primary transition-all"
                />
              </div>
            </div>

            {/* Campanhas */}
            <div className="rounded-lg border border-border/80 bg-surface/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <LineChart className="size-3.5 text-primary" /> Campanhas
                </span>
                <span className="tabular-nums font-semibold text-foreground">
                  {usage.campaigns.current} / {usage.campaigns.unlimited ? "Ilimitado" : usage.campaigns.limit}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  style={{ width: `${usage.campaigns.percentage}%` }}
                  className="h-full bg-primary transition-all"
                />
              </div>
            </div>

            {/* Integrações */}
            <div className="rounded-lg border border-border/80 bg-surface/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Boxes className="size-3.5 text-primary" /> Integrações
                </span>
                <span className="tabular-nums font-semibold text-foreground">
                  {usage.integrations.current} / {usage.integrations.unlimited ? "Ilimitado" : usage.integrations.limit}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  style={{ width: `${usage.integrations.percentage}%` }}
                  className="h-full bg-primary transition-all"
                />
              </div>
            </div>

            {/* Automações */}
            <div className="rounded-lg border border-border/80 bg-surface/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" /> Regras de Automação
                </span>
                <span className="tabular-nums font-semibold text-foreground">
                  {usage.automations.current} / {usage.automations.unlimited ? "Ilimitado" : usage.automations.limit}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  style={{ width: `${usage.automations.percentage}%` }}
                  className="h-full bg-primary transition-all"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CARD 3: Histórico de Faturas & Pagamentos */}
      <section className="editorial-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface/50">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h3 className="type-h3 text-foreground">Faturas e Histórico de Pagamentos</h3>
          </div>
          <span className="text-[12px] text-muted-foreground">Processado via Mercado Pago</span>
        </div>

        {(!data?.invoices || data.invoices.length === 0) ? (
          <div className="p-8 text-center text-[13px] text-muted-foreground">
            Nenhuma fatura emitida ainda para este workspace.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Fatura / ID</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-foreground">
                      {inv.provider_invoice_id || inv.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground tabular-nums">
                      R$ {(inv.amount / 100).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium border",
                          inv.status === "paid"
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-warning/10 text-warning border-warning/30",
                        )}
                      >
                        {inv.status === "paid" ? "Pago" : inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      Mercado Pago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL / SEÇÃO DE ESCOLHA DE PLANOS */}
      {showPlansModal && (
        <div className="editorial-card p-6 border-border space-y-6 bg-surface/50">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="type-h2 text-foreground">Escolha o plano ideal para sua operação</h3>
                {highlightedPlan && (
                  <span className="rounded-full bg-primary/10 border border-primary/25 px-2.5 py-0.5 text-[11px] font-semibold text-primary capitalize">
                    {highlightedPlan} pré-selecionado
                  </span>
                )}
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Transparência total: faça upgrade ou downgrade a qualquer momento via Mercado Pago.
              </p>
            </div>
            {/* Toggle Mensal / Anual com 20% OFF real */}
            <div className="inline-flex rounded-lg border border-border bg-card p-1 text-[12px]">
              <button
                type="button"
                onClick={() => setSelectedInterval("monthly")}
                className={cn(
                  "rounded-md px-3 py-1 font-medium transition-colors",
                  selectedInterval === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setSelectedInterval("annual")}
                className={cn(
                  "rounded-md px-3 py-1 font-medium transition-colors flex items-center gap-1.5",
                  selectedInterval === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>Anual</span>
                <span className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] text-success font-bold">20% de economia</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* STARTER */}
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="type-h3 text-foreground">Starter</h4>
                <p className="text-[12px] text-muted-foreground">Organize sua operação e consolide métricas.</p>
                <div className="pt-2">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {selectedInterval === "annual" ? "R$ 575" : "R$ 59,90"}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedInterval === "annual" ? "/ano" : "/mês"}
                  </span>
                </div>
                {selectedInterval === "annual" && (
                  <p className="text-[11px] text-success font-medium">
                    20% de economia (equivalente a R$ 47,91/mês)
                  </p>
                )}
                <ul className="text-[12.5px] space-y-1.5 pt-3 text-muted-foreground border-t border-border">
                  <li>• 1 workspace • 1 membro</li>
                  <li>• 50 campanhas • 5 integrações</li>
                  <li>• DRE Gerencial essencial</li>
                  <li>• Brain com diagnósticos diários</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={Boolean(checkoutLoading)}
                onClick={() => handleCheckout("starter", selectedInterval)}
                className={buttonClass("outline", "md", "w-full")}
              >
                {checkoutLoading === "starter" ? "Conectando ao Mercado Pago..." : "Assinar Starter"}
              </button>
            </div>

            {/* GROWTH (RECOMENDADO) */}
            <div className="rounded-xl border-2 border-primary bg-card p-5 flex flex-col justify-between space-y-4 shadow-[var(--shadow-raised)] relative">
              <div className="absolute -top-3 right-5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                Mais Popular
              </div>
              <div className="space-y-2">
                <h4 className="type-h3 text-foreground">Growth</h4>
                <p className="text-[12px] text-muted-foreground">Para operações que escalam tráfego pago.</p>
                <div className="pt-2">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {selectedInterval === "annual" ? "R$ 1.439" : "R$ 149,90"}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedInterval === "annual" ? "/ano" : "/mês"}
                  </span>
                </div>
                {selectedInterval === "annual" && (
                  <p className="text-[11px] text-success font-medium">
                    20% de economia (equivalente a R$ 119,91/mês)
                  </p>
                )}
                <ul className="text-[12.5px] space-y-1.5 pt-3 text-muted-foreground border-t border-border">
                  <li>• 1 workspace • 3 membros</li>
                  <li>• 250 campanhas • 15 integrações</li>
                  <li>• DRE Completa com CMV por produto</li>
                  <li>• Pixel First-party e atribuição multicanal</li>
                  <li>• Brain Propostas com aprovação em 1 clique</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={Boolean(checkoutLoading)}
                onClick={() => handleCheckout("growth", selectedInterval)}
                className={buttonClass("primary", "md", "w-full")}
              >
                {checkoutLoading === "growth" ? "Conectando ao Mercado Pago..." : "Assinar Growth"}
              </button>
            </div>

            {/* SCALE */}
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="type-h3 text-foreground">Scale</h4>
                <p className="text-[12px] text-muted-foreground">Para múltiplos negócios e times corporativos.</p>
                <div className="pt-2">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {selectedInterval === "annual" ? "R$ 2.879" : "R$ 299,90"}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedInterval === "annual" ? "/ano" : "/mês"}
                  </span>
                </div>
                {selectedInterval === "annual" && (
                  <p className="text-[11px] text-success font-medium">
                    20% de economia (equivalente a R$ 239,91/mês)
                  </p>
                )}
                <ul className="text-[12.5px] space-y-1.5 pt-3 text-muted-foreground border-t border-border">
                  <li>• 3 workspaces • 10 membros</li>
                  <li>• Campanhas ilimitadas</li>
                  <li>• Integrações & automações ilimitadas</li>
                  <li>• Execução automática avançada no Brain</li>
                  <li>• Auditoria corporativa completa</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={Boolean(checkoutLoading)}
                onClick={() => handleCheckout("scale", selectedInterval)}
                className={buttonClass("outline", "md", "w-full")}
              >
                {checkoutLoading === "scale" ? "Conectando ao Mercado Pago..." : "Assinar Scale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
