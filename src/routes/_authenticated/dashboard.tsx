import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  LineChart,
  Plug,
  Plus,
  TrendingUp,
  Zap,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { CostfyMark } from "@/components/brand/costfy-mark";
import {
  ordersQuery,
  campaignsQuery,
  productsQuery,
  fixedCostsQuery,
  orderItemsQuery,
  gatewayFeesQuery,
  taxesQuery,
  adMetricsDailyQuery,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { BrainEngine } from "@/lib/brain-engine";
import { ActionEngine } from "@/lib/action-engine";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Costfy" },
      {
        name: "description",
        content:
          "Centro operacional do seu negócio digital: lucro líquido real, ROAS, CPA e inteligência contextual.",
      },
      { property: "og:title", content: "Visão geral — Costfy" },
      {
        property: "og:description",
        content: "O Intelligent Operating System do seu negócio digital.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <DashboardPage />
    </WorkspaceProvider>
  ),
});

function DashboardPage() {
  const { active, loading, error } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [] } = useQuery(productsQuery(workspaceId));
  const { data: fixedCosts = [] } = useQuery(fixedCostsQuery(workspaceId));
  const { data: orderItems = [] } = useQuery(orderItemsQuery(workspaceId));
  const { data: gatewayFees = [] } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: taxes = [] } = useQuery(taxesQuery(workspaceId));
  const { data: adMetrics = [] } = useQuery(adMetricsDailyQuery(workspaceId));

  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});
  const [dismissedActions, setDismissedActions] = useState<Record<string, boolean>>({});

  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const financials = MetricsEngine.calculateWorkspaceFinancials({
    orders,
    campaigns,
    fixedCosts,
    orderItems,
    gatewayFees,
    taxes,
    adMetricsDaily: adMetrics,
  });

  const totalImpressions = adMetrics.reduce((acc, m) => acc + (m.impressions || 0), 0);
  const totalClicks = adMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);

  const traffic = MetricsEngine.calculateTraffic({
    impressions: totalImpressions,
    clicks: totalClicks,
    spend: financials.adSpend,
    conversions: orders.length,
    revenue: grossRevenue,
  });

  const { insights, proposals, healthScore } = BrainEngine.analyzeWorkspace({
    campaigns,
    products,
    orders,
    financials,
    traffic,
  });

  const hasData = orders.length > 0 || campaigns.length > 0;
  const baseCurrency = active?.workspace.base_currency ?? "BRL";
  const averageTicket = orders.length > 0 ? grossRevenue / orders.length : 0;

  async function handleApproveProposal(proposal: (typeof proposals)[0]) {
    if (!active) return;
    try {
      const res = await ActionEngine.executeApprovedAction({
        workspaceId: active.workspace.id,
        proposal,
      });
      if (res.success) {
        setExecutedActions((prev) => ({ ...prev, [proposal.id]: true }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao executar ação recomendada.";
      alert(message);
    }
  }

  function handleDismissProposal(proposalId: string) {
    setDismissedActions((prev) => ({ ...prev, [proposalId]: true }));
  }

  const visibleProposals = proposals.filter((p) => !dismissedActions[p.id]);

  return (
    <AppShell
      title={active ? active.workspace.name : "Visão geral"}
      description="Centro de comando operacional: dados unificados de tráfego, vendas e margem líquida real."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/marketing" className={buttonClass("outline", "sm")}>
            Campanhas
          </Link>
          <Link to="/integrations" className={buttonClass("primary", "sm")}>
            Conectar dados
          </Link>
        </div>
      }
    >
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
        >
          Não foi possível carregar o workspace: {error.message}
        </p>
      )}

      {!loading && !active && <EmptyWorkspaceState />}

      {active && (
        <div className="space-y-6">
          {/* Executive Overview Header Strip — Editorial Terminal Style */}
          <section
            aria-label="Visão Executiva de Métricas"
            className="editorial-card overflow-hidden"
          >
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
              {/* Receita Bruta */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="type-label-subtle">Receita Bruta</span>
                  <DollarSign className="size-3.5 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="mt-2.5">
                  <p className="type-metric-hero text-foreground">
                    {hasData
                      ? MetricsEngine.formatCurrency(financials.grossRevenue, baseCurrency)
                      : "—"}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                  <span className="tabular-nums font-medium text-foreground">{orders.length}</span>
                  <span>{orders.length === 1 ? "pedido" : "pedidos"}</span>
                  {orders.length > 0 && (
                    <>
                      <span className="text-border-strong">•</span>
                      <span>
                        Ticket: {MetricsEngine.formatCurrency(averageTicket, baseCurrency)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Investimento em Mídia */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="type-label-subtle">Investimento em Mídia</span>
                  <LineChart className="size-3.5 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="mt-2.5">
                  <p className="type-metric-hero text-foreground">
                    {hasData ? MetricsEngine.formatCurrency(financials.adSpend, baseCurrency) : "—"}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                  <span className="tabular-nums font-medium text-foreground">
                    {campaigns.length}
                  </span>
                  <span>{campaigns.length === 1 ? "campanha ativa" : "campanhas ativas"}</span>
                  {traffic.cpc > 0 && (
                    <>
                      <span className="text-border-strong">•</span>
                      <span>CPC: {MetricsEngine.formatCurrency(traffic.cpc, baseCurrency)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Lucro Líquido Real */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="type-label-subtle">Lucro Líquido Real</span>
                  <Activity className="size-3.5 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <p
                    className={cn(
                      "type-metric-hero",
                      hasData
                        ? financials.trueProfit >= 0
                          ? "text-success"
                          : "text-destructive"
                        : "text-foreground",
                    )}
                  >
                    {hasData
                      ? MetricsEngine.formatCurrency(financials.trueProfit, baseCurrency)
                      : "—"}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11.5px]">
                  {hasData ? (
                    <>
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums border",
                          financials.realMarginPercent >= 20
                            ? "bg-success/10 text-success border-success/25"
                            : financials.realMarginPercent >= 0
                              ? "bg-warning/10 text-warning border-warning/25"
                              : "bg-destructive/10 text-destructive border-destructive/25",
                        )}
                      >
                        {financials.realMarginPercent >= 0 ? "+" : ""}
                        {MetricsEngine.formatPercent(financials.realMarginPercent)}
                      </span>
                      <span className="text-muted-foreground">margem líquida</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Receita − Custos − Taxas − Mídia</span>
                  )}
                </div>
              </div>

              {/* ROAS & Eficiência */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="type-label-subtle">ROAS Global</span>
                  <TrendingUp className="size-3.5 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="mt-2.5">
                  <p className="type-metric-hero text-foreground">
                    {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                  {traffic.cpa > 0 ? (
                    <>
                      <span>CPA médio:</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {MetricsEngine.formatCurrency(traffic.cpa, baseCurrency)}
                      </span>
                    </>
                  ) : (
                    <span>Retorno sobre gastos em anúncios</span>
                  )}
                </div>
              </div>
            </div>

            {/* DRE Econômica Resumida (Unit Economics Breakdown Bar) */}
            {hasData && grossRevenue > 0 && (
              <div className="hairline-t bg-secondary/25 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                      Decomposição do Faturamento
                    </span>
                    <span className="hidden sm:inline text-subtle-foreground">|</span>
                    <span className="hidden sm:inline">
                      CMV:{" "}
                      <strong className="text-foreground">
                        {MetricsEngine.formatCurrency(financials.cogs, baseCurrency)}
                      </strong>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      Taxas:{" "}
                      <strong className="text-foreground">
                        {MetricsEngine.formatCurrency(financials.gatewayFees, baseCurrency)}
                      </strong>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      Impostos:{" "}
                      <strong className="text-foreground">
                        {MetricsEngine.formatCurrency(financials.taxes, baseCurrency)}
                      </strong>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      Mídia:{" "}
                      <strong className="text-foreground">
                        {MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}
                      </strong>
                    </span>
                  </div>
                  <Link
                    to="/finance"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Ver DRE completa <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Grid Principal: Costfy Brain + Operações */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Bloco Costfy Brain & Propostas (7 colunas) */}
            <section
              aria-label="Costfy Brain Intelligence"
              className="editorial-card flex flex-col justify-between p-5 lg:col-span-7"
            >
              <div className="space-y-4">
                {/* Brain Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CostfyMark size={20} className="text-accent" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[14.5px] font-semibold text-foreground">
                          Costfy Brain
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent">
                          <span className="size-1 rounded-full bg-accent animate-pulse" />
                          Operacional Ativo
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground">
                        Diagnóstico contínuo e recomendações acionáveis
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px] font-semibold tabular-nums",
                        healthScore >= 80
                          ? "border-success/30 bg-success/10 text-success"
                          : healthScore >= 50
                            ? "border-warning/30 bg-warning/10 text-warning"
                            : "border-destructive/30 bg-destructive/10 text-destructive",
                      )}
                    >
                      Health Score: {healthScore}/100
                    </span>
                  </div>
                </div>

                {/* Brain Insights Recentes */}
                <div className="space-y-2.5">
                  <p className="type-label-subtle">Diagnósticos em Tempo Real</p>
                  <div className="space-y-2">
                    {insights.slice(0, 2).map((ins) => (
                      <div
                        key={ins.id}
                        className="rounded-md border border-border/80 bg-surface/70 p-3 text-[13px] transition-colors hover:border-border"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground">{ins.title}</p>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                              ins.severity === "critical"
                                ? "bg-destructive/10 text-destructive"
                                : ins.severity === "warning"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-primary-soft text-primary",
                            )}
                          >
                            {ins.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                          {ins.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Propostas de Ação (Aprovação com 1 clique) */}
                {visibleProposals.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <p className="type-label-subtle">
                      Ações Recomendadas (Piloto com Aprovação Humana)
                    </p>
                    <div className="space-y-2.5">
                      {visibleProposals.slice(0, 2).map((prop) => {
                        const isExecuted = executedActions[prop.id];
                        return (
                          <div
                            key={prop.id}
                            className={cn(
                              "rounded-md border p-3.5 transition-colors",
                              isExecuted
                                ? "border-success/30 bg-success/5"
                                : "border-border bg-surface",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-[13px] font-semibold text-foreground">
                                    {prop.title}
                                  </p>
                                  {isExecuted && (
                                    <span className="inline-flex items-center gap-1 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                                      <CheckCircle2 className="size-3" /> Executada
                                    </span>
                                  )}
                                </div>
                                <p className="text-[12px] text-muted-foreground">
                                  {prop.description}
                                </p>
                                <span className={cn("text-[11.5px] font-medium text-accent")}>
                                  Impacto estimado: {prop.preview?.impact}
                                </span>
                              </div>

                              {!isExecuted && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDismissProposal(prop.id)}
                                    className="rounded px-2 py-1 text-[11.5px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                  >
                                    Dispensar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveProposal(prop)}
                                    className={cn(
                                      buttonClass("primary", "sm"),
                                      "h-7 px-2.5 text-[11.5px] shadow-none",
                                    )}
                                  >
                                    Aprovar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Brain Footer Navigation */}
              <div className="hairline-t mt-5 pt-3.5 flex items-center justify-between">
                <span className="text-[11.5px] text-muted-foreground">
                  Pressione{" "}
                  <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘B
                  </kbd>{" "}
                  para o Quick Brain
                </span>
                <Link
                  to="/brain"
                  className={cn(buttonClass("secondary", "sm"), "h-7 gap-1.5 text-[12px]")}
                >
                  <span>Abrir Brain Hub</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </section>

            {/* Bloco Operação & Domínios (5 colunas) */}
            <section
              aria-label="Operações do Negócio"
              className="editorial-card flex flex-col justify-between p-5 lg:col-span-5"
            >
              <div>
                <h2 className="text-[14.5px] font-semibold text-foreground">Operação do Negócio</h2>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Acessos diretos e status operacional por área
                </p>

                <div className="mt-4 space-y-2 text-[13px]">
                  <Link
                    to="/marketing"
                    className="group flex items-center justify-between rounded-md border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-1.5 bg-primary/10 text-primary">
                        <LineChart className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Mídia & Campanhas
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {campaigns.length} campanhas • Spend{" "}
                          {MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/sales"
                    className="group flex items-center justify-between rounded-md border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-1.5 bg-primary/10 text-primary">
                        <Boxes className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Vendas & Catálogo
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {orders.length} pedidos • {products.length} produtos
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/finance"
                    className="group flex items-center justify-between rounded-md border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-1.5 bg-primary/10 text-primary">
                        <DollarSign className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Financeiro & DRE Real
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Margem líquida {MetricsEngine.formatPercent(financials.realMarginPercent)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/tracking"
                    className="group flex items-center justify-between rounded-md border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-1.5 bg-primary/10 text-primary">
                        <Zap className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Tracking & Gerador de UTMs
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Links rastreados e atribuição first-party
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Status de Conexão Rápida */}
              <div className="hairline-t mt-4 pt-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted-foreground">Integrações de dados</span>
                <Link
                  to="/integrations"
                  className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plug className="size-3" /> Gerenciar integrações
                </Link>
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function EmptyWorkspaceState() {
  return (
    <div className="editorial-card p-10 text-center bg-surface/40">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-border bg-card">
        <Boxes className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-[16px] font-semibold text-foreground">
        Nenhum workspace selecionado
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground leading-relaxed">
        Selecione um workspace existente no menu lateral ou crie um novo para gerenciar seu negócio
        digital.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link to="/onboarding" className={buttonClass("primary", "md", "gap-1.5")}>
          <Plus className="size-4" />
          <span>Criar workspace</span>
        </Link>
      </div>
    </div>
  );
}
