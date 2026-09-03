import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  RefreshCw,
  XCircle,
  FileText,
  Users,
  LineChart,
  Boxes,
  Layers,
} from "lucide-react";

import { useWorkspace } from "@/components/app/workspace-context";
import { CostfyMark } from "@/components/brand/costfy-mark";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type {
  Plan,
  PlanInterval,
  Subscription,
  SubscriptionInvoice,
  WorkspaceUsageStats,
  WorkspaceBillingStatus,
} from "@/lib/billing-types";

interface BillingData {
  plan: Plan;
  isTrial: boolean;
  workspaceStatus: WorkspaceBillingStatus;
  subscription: Subscription | null;
  invoices: SubscriptionInvoice[];
  usage: WorkspaceUsageStats;
}

export function BillingManager() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Intervalo selecionado no modal de planos: 'monthly' ou 'annual'
  const [selectedInterval, setSelectedInterval] = useState<PlanInterval>("monthly");
  const [showPlansModal, setShowPlansModal] = useState(false);

  async function fetchBillingData() {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/subscription?workspace_id=${encodeURIComponent(workspaceId)}`);
      if (!res.ok) {
        throw new Error("Falha ao carregar dados de faturamento.");
      }
      const json = await res.json();
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

  // Verificar se retornou do checkout com sandbox_checkout=1 ou status=approved
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("sandbox") === "true" || urlParams.get("status") === "approved") {
      setSuccessMessage("Pagamento confirmado com sucesso no Mercado Pago! Sua assinatura está ativa.");
      // Limpa os parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchBillingData();
    }
  }, []);

  async function handleCheckout(planSlug: string, interval: PlanInterval) {
    if (!workspaceId) return;
    setCheckoutLoading(planSlug);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          planSlug,
          interval,
          email: active?.workspace.created_by ? undefined : "operacoes@costfy.com.br",
          returnUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Erro ao iniciar checkout.");
      }

      const checkout = await res.json();
      if (checkout.checkoutUrl) {
        // Redireciona para o checkout do Mercado Pago (ou sandbox)
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
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!res.ok) throw new Error("Erro ao cancelar assinatura.");
      setSuccessMessage("Assinatura cancelada com sucesso. Seu acesso continuará ativo até o término do período.");
      fetchBillingData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha no cancelamento.");
    } finally {
      setCancelLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="editorial-card p-8 text-center space-y-3">
        <RefreshCw className="size-6 animate-spin mx-auto text-primary" />
        <p className="text-[13px] text-muted-foreground">Carregando dados da assinatura e limites operacionais...</p>
      </div>
    );
  }

  const isReadOnly = data?.workspaceStatus === "read_only";
  const isTrial = data?.isTrial ?? false;
  const plan = data?.plan;
  const subscription = data?.subscription;
  const usage = data?.usage;

  const trialEnds = active?.workspace.trial_ends_at ? new Date(active.workspace.trial_ends_at) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="space-y-6">
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

      {/* Banner de Read-Only se o Trial/Assinatura expirou */}
      {isReadOnly && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold text-[14.5px]">
            <AlertTriangle className="size-5" />
            <span>Seu período de acesso terminou — Workspace em Modo Somente Leitura</span>
          </div>
          <p className="text-[12.5px] text-destructive/90 max-w-2xl leading-relaxed">
            As criações de campanhas, automações e ações do Brain foram bloqueadas no servidor. Seus dados continuam totalmente preservados e seguros. Para reativar as operações imediatamente, escolha um plano abaixo.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleCheckout("growth", "monthly")}
              className={buttonClass("primary", "md", "gap-1.5 shadow-sm")}
            >
              <Zap className="size-4" />
              <span>Reativar Costfy no Plano Growth</span>
            </button>
          </div>
        </div>
      )}

      {/* CARD 1: Plano Atual e Status */}
      <section className="editorial-card p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <CostfyMark size={20} className="text-primary" />
              <h2 className="text-[16px] font-semibold text-foreground">
                Plano Atual: {plan?.name || "Starter"}
              </h2>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                  subscription?.status === "active"
                    ? "border-success/30 bg-success/10 text-success"
                    : isTrial
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                {subscription?.status === "active"
                  ? "Assinatura Ativa (Mercado Pago)"
                  : isTrial
                    ? `Período de Testes (${daysLeft} dias restantes)`
                    : "Plano Expirado"}
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              {isTrial
                ? "Você está utilizando o período gratuito de 14 dias com acesso ao conjunto completo do produto."
                : `Cobrança recorrente via Mercado Pago (${subscription?.billing_interval === "annual" ? "Anual" : "Mensal"}).`}
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
              {subscription?.billing_interval === "annual" ? "Faturamento anual com desconto" : "Faturamento mensal"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">Próxima Renovação</span>
            <p className="mt-1.5 text-[15px] font-semibold text-foreground tabular-nums">
              {subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
                : trialEnds
                  ? trialEnds.toLocaleDateString("pt-BR")
                  : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {subscription?.cancel_at_period_end ? "Cancelamento agendado" : "Renovação automática"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">Gateway Oficial</span>
            <div className="mt-1.5 flex items-center gap-1.5 font-semibold text-foreground">
              <CreditCard className="size-4 text-primary" />
              <span>Mercado Pago</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Cartão de Crédito e Pix</p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-4">
            <span className="type-label-subtle">Ações de Conta</span>
            <div className="mt-2">
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
                <span className="text-[12px] text-muted-foreground">Sem cancelamento pendente</span>
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
        <div className="editorial-card p-6 border-primary/30 space-y-6 bg-gradient-to-b from-card to-secondary/20">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="type-h2 text-foreground">Escolha o plano ideal para sua operação</h3>
              <p className="text-[13px] text-muted-foreground mt-1">
                Transparência total: faça upgrade ou downgrade a qualquer momento via Mercado Pago.
              </p>
            </div>
            {/* Toggle Mensal / Anual */}
            <div className="inline-flex rounded-lg border border-border bg-surface p-1 text-[12px]">
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
                  "rounded-md px-3 py-1 font-medium transition-colors flex items-center gap-1",
                  selectedInterval === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>Anual</span>
                <span className="rounded bg-success/20 px-1 py-0.2 text-[10px] text-success font-bold">~16% OFF</span>
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
                    {selectedInterval === "annual" ? "R$ 599" : "R$ 59,90"}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedInterval === "annual" ? "/ano" : "/mês"}
                  </span>
                </div>
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
                {checkoutLoading === "starter" ? "Conectando..." : "Assinar Starter"}
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
                    {selectedInterval === "annual" ? "R$ 1.499" : "R$ 149,90"}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedInterval === "annual" ? "/ano" : "/mês"}
                  </span>
                </div>
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
                    {selectedInterval === "annual" ? "R$ 2.999" : "R$ 299,90"}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedInterval === "annual" ? "/ano" : "/mês"}
                  </span>
                </div>
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
                {checkoutLoading === "scale" ? "Conectando..." : "Assinar Scale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
