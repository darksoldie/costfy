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
  Workflow,
  Zap,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkle,
  FileSpreadsheet,
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
import { buttonClass, badgeClass, tableCellClass, tableCellNumericClass, tableHeaderCellClass, tableHeaderNumericClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Cockpit Executivo — Costfy" },
      {
        name: "description",
        content:
          "Centro operacional do seu negócio digital: lucro líquido real, ROAS, CPA e inteligência contextual.",
      },
      { property: "og:title", content: "Cockpit Executivo — Costfy" },
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
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d" | "90d">("30d");

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
      title={active ? active.workspace.name : "Cockpit Executivo"}
      description="Visão executiva em tempo real: faturamento, investimento em mídia, margem líquida e lucro real."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/marketing" className={buttonClass("outline", "sm", "gap-1.5")}>
            <LineChart className="size-3.5" />
            <span className="hidden sm:inline">Campanhas</span>
          </Link>
          <Link to="/integrations" className={buttonClass("primary", "sm", "gap-1.5")}>
            <Plug className="size-3.5" />
            <span>Conectar dados</span>
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
        <div className="space-y-6 animate-fade">
          {/* Sub-Header Operacional estilo macOS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                <CostfyMark size={13} className="text-primary shrink-0" />
                <span>Operating System Ativo</span>
              </span>
              <span className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted-foreground uppercase">
                {active.workspace.business_type}
              </span>
              <span className="text-[11px] text-subtle-foreground hidden sm:inline">•</span>
              <span className="text-[12px] text-muted-foreground hidden sm:inline">
                Moeda: <strong className="text-foreground">{baseCurrency}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-success" />
              <span>Sincronização em tempo real</span>
            </div>
          </div>

          {/* GRID 1: Faixa de Cards Executivos (SectionCards no estilo shadcn) */}
          <section
            aria-label="Indicadores Chave de Performance"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Card 1: Receita Bruta */}
            <div className="rounded-xl border border-border/80 bg-gradient-to-t from-primary/5 to-card p-5 shadow-xs transition-all hover:border-border-strong space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">Receita Bruta</span>
                <div className="p-2 rounded-lg bg-secondary text-primary">
                  <DollarSign className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {hasData
                    ? MetricsEngine.formatCurrency(financials.grossRevenue, baseCurrency)
                    : MetricsEngine.formatCurrency(0, baseCurrency)}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px] border-t border-border/60 pt-2.5">
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <TrendingUp className="size-3.5" /> +14.2%
                </span>
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-foreground">{orders.length}</strong> {orders.length === 1 ? "pedido" : "pedidos"}
                </span>
              </div>
            </div>

            {/* Card 2: Lucro Líquido Real */}
            <div className="rounded-xl border border-border/80 bg-gradient-to-t from-success/10 to-card p-5 shadow-xs transition-all hover:border-border-strong space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-muted-foreground">Lucro Líquido Real</span>
                  <span className="rounded bg-primary-soft px-1 text-[9px] font-bold text-primary uppercase">DRE</span>
                </div>
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <Activity className="size-4" />
                </div>
              </div>
              <div>
                <div className={cn(
                  "text-2xl font-bold tracking-tight tabular-nums",
                  financials.trueProfit >= 0 ? "text-success" : "text-destructive"
                )}>
                  {hasData
                    ? MetricsEngine.formatCurrency(financials.trueProfit, baseCurrency)
                    : MetricsEngine.formatCurrency(0, baseCurrency)}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px] border-t border-border/60 pt-2.5">
                <span className={cn(
                  "inline-flex items-center gap-1 font-semibold rounded px-1.5 py-0.2 border",
                  financials.realMarginPercent >= 20
                    ? "bg-success/10 text-success border-success/20"
                    : financials.realMarginPercent >= 0
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                )}>
                  {financials.realMarginPercent >= 0 ? "+" : ""}{MetricsEngine.formatPercent(financials.realMarginPercent)} margem
                </span>
                <span className="text-muted-foreground">Após custos & mídia</span>
              </div>
            </div>

            {/* Card 3: Investimento em Tráfego */}
            <div className="rounded-xl border border-border/80 bg-gradient-to-t from-primary/5 to-card p-5 shadow-xs transition-all hover:border-border-strong space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">Investimento em Mídia</span>
                <div className="p-2 rounded-lg bg-secondary text-primary">
                  <LineChart className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {hasData
                    ? MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)
                    : MetricsEngine.formatCurrency(0, baseCurrency)}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px] border-t border-border/60 pt-2.5">
                <span className="text-muted-foreground">
                  CPC: <strong className="text-foreground">{traffic.cpc > 0 ? MetricsEngine.formatCurrency(traffic.cpc, baseCurrency) : "—"}</strong>
                </span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{campaigns.length}</strong> campanhas
                </span>
              </div>
            </div>

            {/* Card 4: ROAS Consolidado */}
            <div className="rounded-xl border border-border/80 bg-gradient-to-t from-primary/5 to-card p-5 shadow-xs transition-all hover:border-border-strong space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">ROAS Consolidado</span>
                <div className="p-2 rounded-lg bg-secondary text-primary">
                  <TrendingUp className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px] border-t border-border/60 pt-2.5">
                <span className="text-muted-foreground">
                  CPA: <strong className="text-foreground">{traffic.cpa > 0 ? MetricsEngine.formatCurrency(traffic.cpa, baseCurrency) : "—"}</strong>
                </span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 font-medium text-[10.5px]",
                  traffic.roas >= 2 ? "text-success bg-success/10" : "text-muted-foreground bg-secondary"
                )}>
                  {traffic.roas >= 2 ? "Alta Eficiência" : "Estável"}
                </span>
              </div>
            </div>
          </section>

          {/* INTERACTIVE PERFORMANCE AREA CHART (Inspirado em chart-area-interactive.tsx) */}
          <section className="editorial-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <h3 className="type-h3 text-foreground flex items-center gap-2">
                  <LineChart className="size-4 text-primary" />
                  Evolução Diária de Faturamento, Custos e Lucro Real
                </h3>
                <p className="type-body-sm text-muted-foreground mt-0.5">
                  Visualização consolidada de receita bruta versus deduções e margem líquida.
                </p>
              </div>

              {/* Timeframe Selector Buttons */}
              <div className="inline-flex rounded-lg border border-border bg-surface p-1 text-[12px]">
                {(["7d", "14d", "30d", "90d"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={cn(
                      "rounded-md px-3 py-1 font-medium transition-colors uppercase",
                      timeframe === t
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Area Chart Graphic */}
            <div className="relative pt-2">
              <div className="flex items-center gap-6 text-[12px] mb-3 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-primary" />
                  Receita Bruta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500" />
                  Investimento em Mídia
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  Lucro Líquido Real
                </span>
              </div>

              {/* SVG Curve Chart */}
              <div className="h-64 w-full relative">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="1000" y2="40" stroke="var(--border)" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="0" y1="100" x2="1000" y2="100" stroke="var(--border)" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="0" y1="160" x2="1000" y2="160" stroke="var(--border)" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="0" y1="220" x2="1000" y2="220" stroke="var(--border)" opacity="0.8" />

                  {/* Revenue Area */}
                  <path
                    d="M 0,220 C 150,120 300,160 450,90 C 600,60 750,110 1000,50 L 1000,220 Z"
                    fill="url(#revenueGradient)"
                  />
                  <path
                    d="M 0,220 C 150,120 300,160 450,90 C 600,60 750,110 1000,50"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                  />

                  {/* Profit Area */}
                  <path
                    d="M 0,220 C 150,170 300,190 450,140 C 600,110 750,150 1000,100 L 1000,220 Z"
                    fill="url(#profitGradient)"
                  />
                  <path
                    d="M 0,220 C 150,170 300,190 450,140 C 600,110 750,150 1000,100"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />

                  {/* Ad Spend Curve */}
                  <path
                    d="M 0,220 C 150,180 300,185 450,165 C 600,150 750,175 1000,145"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                </svg>
              </div>

              {/* Time axis labels */}
              <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                <span>Início ({timeframe})</span>
                <span>Meio do período</span>
                <span>Hoje (Tempo Real)</span>
              </div>
            </div>
          </section>

          {/* GRID 2: Decomposição Econômica do Faturamento (Unit Economics Waterfall Bar) */}
          <section className="editorial-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h3 className="type-h3 text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-primary" />
                  Decomposição Real do Faturamento (Unit Economics)
                </h3>
                <p className="type-body-sm text-muted-foreground mt-0.5">
                  Para onde vai cada real faturado na operação antes de virar lucro de bolso.
                </p>
              </div>
              <Link to="/finance" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline">
                DRE Detalhada <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Visual Waterfall Bar */}
            <div className="space-y-2">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
                {financials.grossRevenue > 0 ? (
                  <>
                    <div
                      style={{ width: `${Math.min(100, (financials.cogs / financials.grossRevenue) * 100)}%` }}
                      className="bg-amber-500/80 transition-all"
                      title={`CMV: ${MetricsEngine.formatCurrency(financials.cogs, baseCurrency)}`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (financials.gatewayFees / financials.grossRevenue) * 100)}%` }}
                      className="bg-sky-500/80 transition-all"
                      title={`Taxas: ${MetricsEngine.formatCurrency(financials.gatewayFees, baseCurrency)}`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (financials.taxes / financials.grossRevenue) * 100)}%` }}
                      className="bg-purple-500/80 transition-all"
                      title={`Impostos: ${MetricsEngine.formatCurrency(financials.taxes, baseCurrency)}`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (financials.adSpend / financials.grossRevenue) * 100)}%` }}
                      className="bg-rose-500/80 transition-all"
                      title={`Mídia: ${MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (financials.fixedCosts / financials.grossRevenue) * 100)}%` }}
                      className="bg-slate-500/80 transition-all"
                      title={`Fixos: ${MetricsEngine.formatCurrency(financials.fixedCosts, baseCurrency)}`}
                    />
                    <div
                      style={{ width: `${Math.max(0, Math.min(100, (financials.trueProfit / financials.grossRevenue) * 100))}%` }}
                      className="bg-emerald-500 transition-all"
                      title={`Lucro Real: ${MetricsEngine.formatCurrency(financials.trueProfit, baseCurrency)}`}
                    />
                  </>
                ) : (
                  <div className="w-full bg-border" />
                )}
              </div>

              {/* Breakdown Legend Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                <div className="rounded-md border border-border/70 bg-surface/50 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span>CMV (Produtos)</span>
                  </div>
                  <p className="mt-1 font-semibold text-[13px] text-foreground tabular-nums">
                    {MetricsEngine.formatCurrency(financials.cogs, baseCurrency)}
                  </p>
                </div>

                <div className="rounded-md border border-border/70 bg-surface/50 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-sky-500" />
                    <span>Taxas Checkout</span>
                  </div>
                  <p className="mt-1 font-semibold text-[13px] text-foreground tabular-nums">
                    {MetricsEngine.formatCurrency(financials.gatewayFees, baseCurrency)}
                  </p>
                </div>

                <div className="rounded-md border border-border/70 bg-surface/50 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-purple-500" />
                    <span>Impostos (NF)</span>
                  </div>
                  <p className="mt-1 font-semibold text-[13px] text-foreground tabular-nums">
                    {MetricsEngine.formatCurrency(financials.taxes, baseCurrency)}
                  </p>
                </div>

                <div className="rounded-md border border-border/70 bg-surface/50 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span>Mídia Paga (Ads)</span>
                  </div>
                  <p className="mt-1 font-semibold text-[13px] text-foreground tabular-nums">
                    {MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}
                  </p>
                </div>

                <div className="rounded-md border border-border/70 bg-surface/50 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-slate-500" />
                    <span>Custos Fixos</span>
                  </div>
                  <p className="mt-1 font-semibold text-[13px] text-foreground tabular-nums">
                    {MetricsEngine.formatCurrency(financials.fixedCosts, baseCurrency)}
                  </p>
                </div>

                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Lucro de Bolso</span>
                  </div>
                  <p className="mt-1 font-semibold text-[13px] text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {MetricsEngine.formatCurrency(financials.trueProfit, baseCurrency)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* GRID 3: Costfy Brain Live Operations & Domínios (7 cols / 5 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Bloco Costfy Brain & Propostas de Ação (7 colunas) */}
            <section
              aria-label="Costfy Brain Intelligence"
              className="editorial-card flex flex-col justify-between p-5 lg:col-span-7 space-y-5"
            >
              <div className="space-y-4">
                {/* Header Brain com Health Score */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <CostfyMark size={22} className="text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[14.5px] font-semibold text-foreground">
                          Costfy Brain
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <span className="size-1 rounded-full bg-primary animate-pulse" />
                          Cockpit Heurístico
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground">
                        Diagnóstico contínuo dos números com propostas operacionais
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-[11.5px] font-semibold tabular-nums",
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
                  <p className="type-label-subtle">Diagnósticos Recentes do Workspace</p>
                  <div className="space-y-2">
                    {insights.slice(0, 2).map((ins) => (
                      <div
                        key={ins.id}
                        className="rounded-lg border border-border/80 bg-surface/60 p-3 text-[13px] transition-colors hover:border-border"
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
                    {insights.length === 0 && (
                      <p className="text-[12.5px] text-muted-foreground italic py-2">
                        Nenhuma anomalia detectada. Operação calibrada dentro das margens ideais.
                      </p>
                    )}
                  </div>
                </div>

                {/* Propostas de Ação com Guardrails */}
                {visibleProposals.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-border/60">
                    <p className="type-label-subtle">
                      Recomendações com Execução em 1 Clique (Guardrails Ativos)
                    </p>
                    <div className="space-y-2.5">
                      {visibleProposals.slice(0, 2).map((prop) => {
                        const isExecuted = executedActions[prop.id];
                        return (
                          <div
                            key={prop.id}
                            className={cn(
                              "rounded-lg border p-3.5 transition-colors",
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
                                <span className="text-[11.5px] font-medium text-primary block">
                                  Impacto estimado: {prop.preview?.impact}
                                </span>
                              </div>

                              {!isExecuted && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDismissProposal(prop.id)}
                                    className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground text-[11px]"
                                  >
                                    Ignorar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveProposal(prop)}
                                    className={buttonClass("primary", "sm", "text-[12px] h-7 px-3")}
                                  >
                                    Aprovar ação
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

              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-[11.5px] text-muted-foreground">
                <span>Guardrails e limites operacionais ativos</span>
                <Link to="/brain" className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                  Abrir Brain Hub <ArrowRight className="size-3" />
                </Link>
              </div>
            </section>

            {/* Bloco Operação & Domínios (5 colunas) */}
            <section
              aria-label="Operações do Negócio"
              className="editorial-card flex flex-col justify-between p-5 lg:col-span-5 space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h2 className="text-[14.5px] font-semibold text-foreground">Domínios do Sistema</h2>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      Cockpits operacionais por área de negócio
                    </p>
                  </div>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10.5px] font-mono text-muted-foreground">
                    4 Módulos
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-[13px]">
                  <Link
                    to="/marketing"
                    className="group flex items-center justify-between rounded-lg border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-2 bg-primary/10 text-primary">
                        <LineChart className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Mídia & Campanhas
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {campaigns.length} campanhas • Spend {MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/sales"
                    className="group flex items-center justify-between rounded-lg border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-2 bg-primary/10 text-primary">
                        <Boxes className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Vendas & Catálogo
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {orders.length} pedidos • {products.length} produtos cadastrados
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/finance"
                    className="group flex items-center justify-between rounded-lg border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-2 bg-primary/10 text-primary">
                        <DollarSign className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Financeiro & DRE Gerencial
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          Margem de {MetricsEngine.formatPercent(financials.realMarginPercent)} após deduções
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/tracking"
                    className="group flex items-center justify-between rounded-lg border border-border/80 bg-surface/50 p-3 hover:border-border hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded p-2 bg-primary/10 text-primary">
                        <Workflow className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Tracking & Atribuição
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Pixel First-party & repositório de links UTM
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Status de Conexão Rápida */}
              <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted-foreground">Hotmart, Kiwify, Stripe & Meta</span>
                <Link
                  to="/integrations"
                  className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plug className="size-3" /> Gerenciar integrações
                </Link>
              </div>
            </section>
          </div>

          {/* GRID 4: Tabela de Pedidos e Transações Recentes (Spreadsheet-like Table Card) */}
          <section className="editorial-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface/50">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-primary" />
                <h3 className="type-h3 text-foreground">Pedidos e Vendas Recentes</h3>
                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                  {orders.length} total
                </span>
              </div>
              <Link to="/sales" className="text-[12px] font-medium text-primary hover:underline inline-flex items-center gap-1">
                Ver todos os pedidos <ArrowRight className="size-3" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-[13.5px] font-medium text-foreground">Nenhum pedido recebido ainda</p>
                <p className="text-[12px] text-muted-foreground max-w-md mx-auto">
                  Configure os webhooks em <strong>Integrações</strong> ou lance um pedido manual em <strong>Vendas</strong> para alimentar as métricas do cockpit.
                </p>
                <div className="pt-2">
                  <Link to="/sales" className={buttonClass("outline", "sm", "gap-1")}>
                    <Plus className="size-3.5" /> Lançar pedido manual
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className={tableHeaderCellClass}>Pedido #</th>
                      <th className={tableHeaderCellClass}>Status</th>
                      <th className={tableHeaderCellClass}>Gateway / Origem</th>
                      <th className={tableHeaderCellClass}>UTM Source</th>
                      <th className={tableHeaderNumericClass}>Valor Total</th>
                      <th className={tableHeaderNumericClass}>Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground font-mono text-[12px]">
                          {ord.order_number || ord.id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium border",
                              ord.status === "paid"
                                ? "bg-success/10 text-success border-success/30"
                                : "bg-warning/10 text-warning border-warning/30",
                            )}
                          >
                            {ord.status === "paid" ? "Aprovado" : ord.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground capitalize">
                          {ord.payment_gateway || "Direto"}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11.5px] text-muted-foreground">
                          {ord.utm_source || "Orgânico / Direto"}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(ord.total_amount, ord.currency || baseCurrency)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground text-[12px]">
                          {new Date(ord.ordered_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}

function EmptyWorkspaceState() {
  return (
    <div className="editorial-card p-10 text-center bg-surface/40 max-w-xl mx-auto my-8">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-border bg-card">
        <Boxes className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-[16px] font-semibold text-foreground">
        Nenhum workspace selecionado
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground leading-relaxed">
        Selecione um workspace existente no menu lateral ou inicialize seu primeiro ambiente operacional.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link to="/onboarding" className={buttonClass("primary", "md", "gap-1.5")}>
          <Plus className="size-4" />
          <span>Configurar workspace</span>
        </Link>
      </div>
    </div>
  );
}
