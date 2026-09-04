import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  LineChart,
  PieChart,
  Plug,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Workflow,
  FileSpreadsheet,
} from "lucide-react";

import { AppShellActions } from "@/components/app/app-shell";
import { useWorkspace } from "@/components/app/workspace-context";
import { CostfyMark } from "@/components/brand/costfy-mark";
import { MetricsEngine } from "@/lib/metrics-engine";
import {
  buttonClass,
  inputClass,
  tableCellNumericClass,
  tableHeaderCellClass,
  tableHeaderNumericClass,
} from "@/lib/ui";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { exportToCSV } from "@/features/reports/reports-export";
import {
  useDashboardData,
  type DashboardTimeframe,
} from "./dashboard.queries";

const TIMEFRAME_BUTTONS: { id: DashboardTimeframe; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "7d", label: "7 Dias" },
  { id: "14d", label: "14 Dias" },
  { id: "30d", label: "30 Dias" },
  { id: "this_month", label: "Este Mês" },
  { id: "90d", label: "90 Dias" },
];

export function DashboardView() {
  const { active, loading, error } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;
  const baseCurrency = active?.workspace.base_currency ?? "BRL";

  const [timeframe, setTimeframe] = useState<DashboardTimeframe>("30d");

  // Gráfico: toggles clicáveis das curvas no estilo UTMify
  const [showRevenueLine, setShowRevenueLine] = useState(true);
  const [showSpendLine, setShowSpendLine] = useState(true);
  const [showProfitLine, setShowProfitLine] = useState(true);

  // Tabela Central no estilo UTMify: abas e filtros
  const [activeTableTab, setActiveTableTab] = useState<"campaigns" | "channels" | "products" | "live_orders">(
    "campaigns",
  );
  const [tableSearch, setTableSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const {
    orders,
    allOrders,
    campaigns,
    products,
    financials,
    traffic,
    insights,
    visibleProposals,
    healthScore,
    hasData,
    averageTicket,
    revenueGrowth,
    dailySeries,
    campaignsPerformance,
    channelsPerformance,
    productsPerformance,
    executedActions,
    handleApproveProposal,
    handleDismissProposal,
  } = useDashboardData(workspaceId, timeframe);

  // Curvas dinâmicas do gráfico geradas a partir de dailySeries real
  const chartData = useMemo(() => {
    const hasPoints = dailySeries.some((d) => d.revenue > 0 || d.spend > 0 || d.profit > 0);
    const maxVal = Math.max(
      ...dailySeries.map((d) => Math.max(d.revenue, d.spend, d.profit, 0)),
      100,
    );

    const len = dailySeries.length;
    const pts = dailySeries.map((d, i) => {
      const x = len > 1 ? (i / (len - 1)) * 1000 : 500;
      const yRev = 220 - (d.revenue / maxVal) * 180;
      const ySpend = 220 - (d.spend / maxVal) * 180;
      const yProfit = 220 - (Math.max(0, d.profit) / maxVal) * 180;
      return { x, yRev, ySpend, yProfit, revenue: d.revenue, spend: d.spend, profit: d.profit };
    });

    const revPath = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.yRev.toFixed(1)}`).join(" ");
    const revArea = `${revPath} L 1000,220 L 0,220 Z`;

    const profitPath = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.yProfit.toFixed(1)}`).join(" ");
    const profitArea = `${profitPath} L 1000,220 L 0,220 Z`;

    const spendPath = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.ySpend.toFixed(1)}`).join(" ");

    return { hasPoints, maxVal, revPath, revArea, profitPath, profitArea, spendPath, pts };
  }, [dailySeries]);

  // Filtragem da tabela central
  const filteredCampaigns = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    return campaignsPerformance.filter((c) => {
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [campaignsPerformance, tableSearch, platformFilter]);

  const filteredChannels = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    return channelsPerformance.filter((ch) => !q || ch.channel.toLowerCase().includes(q));
  }, [channelsPerformance, tableSearch]);

  const filteredProducts = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    return productsPerformance.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)),
    );
  }, [productsPerformance, tableSearch]);

  const filteredLiveOrders = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    return orders.filter((o) => {
      if (!q) return true;
      return (
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.customer_id && o.customer_id.toLowerCase().includes(q)) ||
        (o.utm_source && o.utm_source.toLowerCase().includes(q)) ||
        (o.utm_campaign && o.utm_campaign.toLowerCase().includes(q))
      );
    });
  }, [orders, tableSearch]);

  // Exportação CSV da tabela ativa
  function handleExportTableCSV() {
    if (activeTableTab === "campaigns") {
      const headers = [
        "Campanha",
        "Plataforma",
        "Investimento (BRL)",
        "Vendas",
        "Receita Faturada (BRL)",
        "CPA (BRL)",
        "Ticket Médio (BRL)",
        "ROAS",
        "Lucro Líquido (BRL)",
        "Margem (%)",
      ];
      const rows = filteredCampaigns.map((c) => [
        c.name,
        c.platform,
        c.spend.toFixed(2),
        c.conversions,
        c.revenue.toFixed(2),
        c.cpa.toFixed(2),
        c.ticket.toFixed(2),
        c.roas.toFixed(2),
        c.profit.toFixed(2),
        `${c.marginPercent.toFixed(1)}%`,
      ]);
      exportToCSV(`utmify_campanhas_${timeframe}`, headers, rows);
    } else if (activeTableTab === "channels") {
      const headers = ["Canal / Origem", "Investimento", "Vendas", "Receita", "CPA", "ROAS", "Lucro", "Margem"];
      const rows = filteredChannels.map((ch) => [
        ch.channel,
        ch.spend.toFixed(2),
        ch.orders,
        ch.revenue.toFixed(2),
        ch.cpa.toFixed(2),
        ch.roas.toFixed(2),
        ch.profit.toFixed(2),
        `${ch.marginPercent.toFixed(1)}%`,
      ]);
      exportToCSV(`utmify_origens_${timeframe}`, headers, rows);
    } else if (activeTableTab === "products") {
      const headers = ["Produto", "SKU", "Unidades", "Faturamento", "Preço Médio", "CMV", "Lucro", "Margem"];
      const rows = filteredProducts.map((p) => [
        p.name,
        p.sku,
        p.unitsSold,
        p.revenue.toFixed(2),
        p.averagePrice.toFixed(2),
        p.cogs.toFixed(2),
        p.profit.toFixed(2),
        `${p.marginPercent.toFixed(1)}%`,
      ]);
      exportToCSV(`utmify_produtos_${timeframe}`, headers, rows);
    } else {
      const headers = ["Pedido #", "Status", "Gateway", "UTM Source", "UTM Campaign", "Valor", "Data"];
      const rows = filteredLiveOrders.map((o) => [
        o.order_number || o.id.slice(0, 8),
        o.status,
        o.payment_gateway || "Direto",
        o.utm_source || "Orgânico",
        o.utm_campaign || "—",
        o.total_amount.toFixed(2),
        o.ordered_at,
      ]);
      exportToCSV(`utmify_pedidos_${timeframe}`, headers, rows);
    }
  }

  return (
    <>
      <AppShellActions>
        <div className="flex items-center gap-2">
          <Link to="/marketing" className={buttonClass("outline", "sm", "gap-1.5")}>
            <LineChart className="size-3.5" />
            <span className="hidden sm:inline">Gerenciar</span> Mídia
          </Link>
          <Link to="/integrations" className={buttonClass("primary", "sm", "gap-1.5")}>
            <Plug className="size-3.5" />
            <span>Conectar dados</span>
          </Link>
        </div>
      </AppShellActions>

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
          {/* BARRA SUPERIOR DE CONTROLE EXECUTIVO (ESTILO UTMIFY) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-3.5">
            {/* Filtros rápidos de data em Pills horizontais no estilo UTMify */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {TIMEFRAME_BUTTONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeframe(t.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors whitespace-nowrap",
                    timeframe === t.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Badges de Status em Tempo Real */}
            <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Ativo
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Workspace: <strong className="text-foreground">{active.workspace.name}</strong>
              </span>
              <span>•</span>
              <span className="font-mono text-foreground font-semibold">{baseCurrency}</span>
            </div>
          </div>

          {/* FAIXA DE KPIS DE ALTA DENSIDADE NO ESTILO UTMIFY (6 CARDS PRINCIPAIS) */}
          <section
            aria-label="Indicadores Chave de Performance"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {/* Card 1: Faturamento Total */}
            {/* Card 1: Faturamento Bruto */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Faturamento
                </span>
                <DollarSign className="size-3.5 text-primary" />
              </div>
              <div className="text-[19px] font-bold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber
                  value={financials.grossRevenue}
                  format={(val) => MetricsEngine.formatCurrency(val, baseCurrency)}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                {revenueGrowth !== null ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-semibold",
                      revenueGrowth >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {revenueGrowth >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {revenueGrowth >= 0 ? "+" : ""}
                    {revenueGrowth.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-muted-foreground">Consolidado</span>
                )}
                <span className="text-muted-foreground font-medium">{orders.length} pedidos</span>
              </div>
            </div>

            {/* Card 2: Lucro Líquido Real (DRE) */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Lucro Real
                </span>
                <Activity className="size-3.5 text-success" />
              </div>
              <div
                className={cn(
                  "text-[19px] font-bold tracking-tight tabular-nums",
                  financials.trueProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                )}
              >
                <AnimatedNumber
                  value={financials.trueProfit}
                  format={(val) => MetricsEngine.formatCurrency(val, baseCurrency)}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-500/20">
                <span
                  className={cn(
                    "font-semibold rounded px-1 text-[10px]",
                    financials.realMarginPercent >= 20
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {financials.realMarginPercent >= 0 ? "+" : ""}
                  {MetricsEngine.formatPercent(financials.realMarginPercent)} margem
                </span>
                <span className="text-muted-foreground text-[10.5px]">Após custos</span>
              </div>
            </div>

            {/* Card 3: Investimento em Tráfego */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Gasto com Ads
                </span>
                <LineChart className="size-3.5 text-destructive" />
              </div>
              <div className="text-[19px] font-bold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber
                  value={financials.adSpend}
                  format={(val) => MetricsEngine.formatCurrency(val, baseCurrency)}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                <span className="text-muted-foreground">
                  CPC:{" "}
                  <strong className="text-foreground">
                    {traffic.cpc > 0 ? MetricsEngine.formatCurrency(traffic.cpc, baseCurrency) : "—"}
                  </strong>
                </span>
                <span className="text-muted-foreground">{campaigns.length} ativas</span>
              </div>
            </div>

            {/* Card 4: ROAS Consolidado */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  ROAS Geral
                </span>
                <TrendingUp className="size-3.5 text-primary" />
              </div>
              <div className="text-[19px] font-bold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber
                  value={traffic.roas}
                  format={(val) => (val > 0 ? `${val.toFixed(2)}x` : "—")}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.2 font-semibold text-[10px]",
                    traffic.roas >= 2
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : traffic.roas >= 1
                        ? "bg-secondary text-foreground"
                        : "bg-destructive/10 text-destructive",
                  )}
                >
                  {traffic.roas >= 2 ? "Alta Eficiência" : traffic.roas >= 1 ? "Equilibrado" : "Atenção"}
                </span>
                <span className="text-muted-foreground">Retorno</span>
              </div>
            </div>

            {/* Card 5: CPA Médio */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  CPA Médio
                </span>
                <Workflow className="size-3.5 text-muted-foreground" />
              </div>
              <div className="text-[19px] font-bold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber
                  value={traffic.cpa}
                  format={(val) => (val > 0 ? MetricsEngine.formatCurrency(val, baseCurrency) : "—")}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Custo p/ venda</span>
                <span className="text-muted-foreground font-medium">{orders.length} conv.</span>
              </div>
            </div>

            {/* Card 6: Ticket Médio */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs hover:border-border-strong transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Ticket Médio
                </span>
                <Boxes className="size-3.5 text-muted-foreground" />
              </div>
              <div className="text-[19px] font-bold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber
                  value={averageTicket}
                  format={(val) => MetricsEngine.formatCurrency(val, baseCurrency)}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Média p/ pedido</span>
                <span className="text-muted-foreground font-medium">{products.length} skus</span>
              </div>
            </div>
          </section>

          {/* GRÁFICO INTERATIVO DE DESEMPENHO NO ESTILO UTMIFY (COM TOGGLES DE LINHA) */}
          <section className="editorial-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h3 className="type-h3 text-foreground flex items-center gap-2">
                  <LineChart className="size-4 text-primary" />
                  Evolução Temporal de Receita, Investimento e Lucro
                </h3>
                <p className="type-body-sm text-muted-foreground mt-0.5">
                  Clique nas legendas para isolar ou sobrepor métricas no gráfico.
                </p>
              </div>

              {/* Toggles Interativos de Curvas (Estilo UTMify) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevenueLine(!showRevenueLine)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium border transition-colors",
                    showRevenueLine
                      ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                      : "border-border bg-secondary/50 text-muted-foreground opacity-60",
                  )}
                >
                  <span className="size-2 rounded-full bg-primary" />
                  Receita Bruta
                </button>

                <button
                  type="button"
                  onClick={() => setShowSpendLine(!showSpendLine)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium border transition-colors",
                    showSpendLine
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                      : "border-border bg-secondary/50 text-muted-foreground opacity-60",
                  )}
                >
                  <span className="size-2 rounded-full bg-rose-500" />
                  Gasto Ads
                </button>

                <button
                  type="button"
                  onClick={() => setShowProfitLine(!showProfitLine)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium border transition-colors",
                    showProfitLine
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "border-border bg-secondary/50 text-muted-foreground opacity-60",
                  )}
                >
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Lucro Líquido
                </button>
              </div>
            </div>

            {/* SVG Line Chart Financeiro (Sem gradientes, linhas nítidas enterprise) */}
            <div className={cn("w-full relative pt-1 transition-all duration-300", chartData.hasPoints ? "h-60" : "h-36")}>
              {chartData.hasPoints ? (
                <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="1000" y2="40" stroke="var(--border)" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="0" y1="100" x2="1000" y2="100" stroke="var(--border)" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="0" y1="160" x2="1000" y2="160" stroke="var(--border)" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="0" y1="220" x2="1000" y2="220" stroke="var(--border)" opacity="0.8" />

                  {/* Receita Bruta (Azul Costfy) */}
                  {showRevenueLine && (
                    <path d={chartData.revPath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                  )}

                  {/* Lucro Líquido Real (Verde) */}
                  {showProfitLine && (
                    <path d={chartData.profitPath} fill="none" stroke="var(--color-success)" strokeWidth="2.5" />
                  )}

                  {/* Gasto em Mídia (Vermelho Discreto Tracejado) */}
                  {showSpendLine && (
                    <path d={chartData.spendPath} fill="none" stroke="var(--color-destructive)" strokeWidth="2" strokeDasharray="5 5" />
                  )}
                </svg>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-[13.5px] font-semibold text-foreground">Sem movimentação neste período</p>
                  <p className="text-[12px] text-muted-foreground mt-1 max-w-md">
                    Conecte suas fontes de vendas e mídia para visualizar a evolução automaticamente.
                  </p>
                </div>
              )}
            </div>

            {/* Time axis labels */}
            <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
              <span>{dailySeries[0]?.label || "Início"}</span>
              <span>{dailySeries[Math.floor(dailySeries.length / 2)]?.label || "Meio"}</span>
              <span>{dailySeries[dailySeries.length - 1]?.label || "Hoje (Tempo Real)"}</span>
            </div>
          </section>

          {/* UNIT ECONOMICS WATERFALL (DECOMPOSIÇÃO FINANCEIRA DO FATURAMENTO) */}
          <section className="editorial-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-primary" />
                <h3 className="text-[13.5px] font-semibold text-foreground">Decomposição Real do Faturamento</h3>
                <span className="text-[11.5px] text-muted-foreground">(Unit Economics de Cada R$ 100 Faturados)</span>
              </div>
              <Link
                to="/finance"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
              >
                DRE Completa <ArrowRight className="size-3" />
              </Link>
            </div>

            {/* Barra de decomposição visual (Neutros p/ Custos, Verde/Vermelho semântico p/ Lucro) */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              {financials.grossRevenue > 0 ? (
                <>
                  <div
                    style={{ width: `${Math.min(100, (financials.cogs / financials.grossRevenue) * 100)}%` }}
                    className="bg-muted-foreground/70 transition-all"
                    title={`CMV: ${MetricsEngine.formatCurrency(financials.cogs, baseCurrency)}`}
                  />
                  <div
                    style={{
                      width: `${Math.min(100, (financials.gatewayFees / financials.grossRevenue) * 100)}%`,
                    }}
                    className="bg-muted-foreground/50 transition-all"
                    title={`Taxas: ${MetricsEngine.formatCurrency(financials.gatewayFees, baseCurrency)}`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (financials.taxes / financials.grossRevenue) * 100)}%` }}
                    className="bg-muted-foreground/40 transition-all"
                    title={`Impostos: ${MetricsEngine.formatCurrency(financials.taxes, baseCurrency)}`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (financials.adSpend / financials.grossRevenue) * 100)}%` }}
                    className="bg-destructive/70 transition-all"
                    title={`Mídia: ${MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (financials.fixedCosts / financials.grossRevenue) * 100)}%` }}
                    className="bg-muted-foreground/30 transition-all"
                    title={`Fixos: ${MetricsEngine.formatCurrency(financials.fixedCosts, baseCurrency)}`}
                  />
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, (financials.trueProfit / financials.grossRevenue) * 100))}%`,
                    }}
                    className={cn(
                      "transition-all",
                      financials.trueProfit >= 0 ? "bg-emerald-500" : "bg-destructive",
                    )}
                    title={`Lucro Real: ${MetricsEngine.formatCurrency(financials.trueProfit, baseCurrency)}`}
                  />
                </>
              ) : (
                <div className="w-full bg-border" />
              )}
            </div>

            {/* Legenda estruturada: Custos Neutros vs Lucro Real */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[12px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/70 shrink-0" />
                <span>CMV: {MetricsEngine.formatCurrency(financials.cogs, baseCurrency)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/50 shrink-0" />
                <span>Taxas: {MetricsEngine.formatCurrency(financials.gatewayFees, baseCurrency)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                <span>Impostos: {MetricsEngine.formatCurrency(financials.taxes, baseCurrency)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-destructive/70 shrink-0" />
                <span>Mídia: {MetricsEngine.formatCurrency(financials.adSpend, baseCurrency)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <span>Fixos: {MetricsEngine.formatCurrency(financials.fixedCosts, baseCurrency)}</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 font-semibold",
                  financials.trueProfit >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    financials.trueProfit >= 0 ? "bg-emerald-500" : "bg-destructive",
                  )}
                />
                <span>Lucro: {MetricsEngine.formatCurrency(financials.trueProfit, baseCurrency)}</span>
              </div>
            </div>
          </section>

          {/* A GRANDE TABELA CENTRAL DE PERFORMANCE DE TRÁFEGO (O CORAÇÃO DA UTMIFY) */}
          <section className="editorial-card overflow-hidden">
            {/* Header da Tabela com Abas e Ferramentas no estilo UTMify */}
            <div className="flex flex-col gap-3 border-b border-border bg-surface/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Abas da Tabela */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(
                    [
                      { id: "campaigns", label: "Campanhas (UTM Campaign)", icon: LineChart },
                      { id: "channels", label: "Origens (UTM Source)", icon: PieChart },
                      { id: "products", label: "Produtos & SKUs", icon: Boxes },
                      { id: "live_orders", label: "Vendas Recentes (Live Feed)", icon: Activity },
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTableTab(tab.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors whitespace-nowrap",
                          activeTableTab === tab.id
                            ? "bg-secondary text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Botão de Exportação CSV */}
                <button
                  type="button"
                  onClick={handleExportTableCSV}
                  className={buttonClass("outline", "sm", "gap-1.5 text-[12px]")}
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Exportar</span> CSV
                </button>
              </div>

              {/* Linha de Filtros: Busca e Plataforma */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="search"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder={
                      activeTableTab === "campaigns"
                        ? "Buscar campanha de tráfego..."
                        : activeTableTab === "channels"
                          ? "Buscar canal ou origem UTM..."
                          : activeTableTab === "products"
                            ? "Buscar produto ou SKU..."
                            : "Buscar pedido, cliente ou UTM..."
                    }
                    className={cn(inputClass, "pl-8 text-[12.5px] h-8")}
                  />
                </div>

                {activeTableTab === "campaigns" && (
                  <div className="flex items-center gap-1 text-[11.5px]">
                    <span className="text-muted-foreground mr-1">Plataforma:</span>
                    {(
                      [
                        { id: "all", label: "Todas" },
                        { id: "meta_ads", label: "Meta Ads" },
                        { id: "google_ads", label: "Google Ads" },
                        { id: "tiktok_ads", label: "TikTok Ads" },
                      ] as const
                    ).map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => setPlatformFilter(plat.id)}
                        className={cn(
                          "rounded px-2 py-1 transition-colors",
                          platformFilter === plat.id
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {plat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CONTEÚDO DA TABELA: ABA 1 — CAMPANHAS (UTMIFY CORE) */}
            {activeTableTab === "campaigns" && (
              <div className="overflow-x-auto">
                {filteredCampaigns.length === 0 ? (
                  <div className="p-8 text-center text-[13px] text-muted-foreground">
                    Nenhuma campanha encontrada com os filtros selecionados.
                  </div>
                ) : (
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5 w-12 text-center">Status</th>
                        <th className={tableHeaderCellClass}>Campanha</th>
                        <th className={tableHeaderCellClass}>Plataforma</th>
                        <th className={tableHeaderNumericClass}>Investimento</th>
                        <th className={tableHeaderNumericClass}>Vendas</th>
                        <th className={tableHeaderNumericClass}>Receita</th>
                        <th className={tableHeaderNumericClass}>CPA</th>
                        <th className={tableHeaderNumericClass}>Ticket Médio</th>
                        <th className={tableHeaderNumericClass}>ROAS</th>
                        <th className={tableHeaderNumericClass}>Lucro Líquido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredCampaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={cn(
                                "inline-block size-2 rounded-full",
                                c.status === "active" ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-neutral-400",
                              )}
                              title={c.status === "active" ? "Campanha Ativa" : "Pausada"}
                            />
                          </td>
                          <td className="px-4 py-2.5 font-medium text-foreground max-w-[220px] truncate">
                            {c.name}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase",
                                c.platform === "meta_ads"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : c.platform === "google_ads"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : c.platform === "tiktok_ads"
                                      ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                                      : "bg-secondary text-muted-foreground",
                              )}
                            >
                              {c.platform.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className={tableCellNumericClass}>
                            {MetricsEngine.formatCurrency(c.spend, baseCurrency)}
                          </td>
                          <td className={tableCellNumericClass}>{c.conversions}</td>
                          <td className={tableCellNumericClass}>
                            {MetricsEngine.formatCurrency(c.revenue, baseCurrency)}
                          </td>
                          <td className={tableCellNumericClass}>
                            {c.cpa > 0 ? MetricsEngine.formatCurrency(c.cpa, baseCurrency) : "—"}
                          </td>
                          <td className={tableCellNumericClass}>
                            {c.ticket > 0 ? MetricsEngine.formatCurrency(c.ticket, baseCurrency) : "—"}
                          </td>
                          <td className={tableCellNumericClass}>
                            <span
                              className={cn(
                                "inline-block rounded px-1.5 py-0.5 font-bold text-[11px]",
                                c.roas >= 2
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : c.roas >= 1
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                              )}
                            >
                              {c.roas > 0 ? `${c.roas.toFixed(2)}x` : "—"}
                            </span>
                          </td>
                          <td
                            className={cn(
                              tableCellNumericClass,
                              c.profit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-destructive font-bold",
                            )}
                          >
                            {MetricsEngine.formatCurrency(c.profit, baseCurrency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Linha Consolidada no estilo UTMify */}
                    <tfoot className="border-t-2 border-border bg-secondary/40 font-bold text-foreground text-[12.5px]">
                      <tr>
                        <td className="px-4 py-2.5 text-center" colSpan={3}>
                          TOTAL CONSOLIDADO ({filteredCampaigns.length} campanhas)
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(
                            filteredCampaigns.reduce((acc, c) => acc + c.spend, 0),
                            baseCurrency,
                          )}
                        </td>
                        <td className={tableCellNumericClass}>
                          {filteredCampaigns.reduce((acc, c) => acc + c.conversions, 0)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(
                            filteredCampaigns.reduce((acc, c) => acc + c.revenue, 0),
                            baseCurrency,
                          )}
                        </td>
                        <td className={tableCellNumericClass}>
                          {traffic.cpa > 0 ? MetricsEngine.formatCurrency(traffic.cpa, baseCurrency) : "—"}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(averageTicket, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            financials.trueProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                          )}
                        >
                          {MetricsEngine.formatCurrency(
                            filteredCampaigns.reduce((acc, c) => acc + c.profit, 0),
                            baseCurrency,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}

            {/* CONTEÚDO DA TABELA: ABA 2 — CANAIS / ORIGENS */}
            {activeTableTab === "channels" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className={tableHeaderCellClass}>Canal de Aquisição / Origem</th>
                      <th className={tableHeaderNumericClass}>Investimento</th>
                      <th className={tableHeaderNumericClass}>Vendas</th>
                      <th className={tableHeaderNumericClass}>Receita</th>
                      <th className={tableHeaderNumericClass}>CPA</th>
                      <th className={tableHeaderNumericClass}>Ticket Médio</th>
                      <th className={tableHeaderNumericClass}>ROAS</th>
                      <th className={tableHeaderNumericClass}>Lucro Real</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredChannels.map((ch) => (
                      <tr key={ch.channel} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground">{ch.channel}</td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(ch.spend, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>{ch.orders}</td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(ch.revenue, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {ch.cpa > 0 ? MetricsEngine.formatCurrency(ch.cpa, baseCurrency) : "—"}
                        </td>
                        <td className={tableCellNumericClass}>
                          {ch.ticket > 0 ? MetricsEngine.formatCurrency(ch.ticket, baseCurrency) : "—"}
                        </td>
                        <td className={tableCellNumericClass}>
                          <span
                            className={cn(
                              "font-bold",
                              ch.roas >= 2
                                ? "text-emerald-600 dark:text-emerald-400"
                                : ch.roas >= 1
                                  ? "text-foreground"
                                  : "text-destructive",
                            )}
                          >
                            {ch.roas > 0 ? `${ch.roas.toFixed(2)}x` : "—"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            ch.profit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-destructive",
                          )}
                        >
                          {MetricsEngine.formatCurrency(ch.profit, baseCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONTEÚDO DA TABELA: ABA 3 — PRODUTOS & SKUS */}
            {activeTableTab === "products" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className={tableHeaderCellClass}>Produto</th>
                      <th className={tableHeaderCellClass}>SKU</th>
                      <th className={tableHeaderNumericClass}>Unid. Vendidas</th>
                      <th className={tableHeaderNumericClass}>Faturamento</th>
                      <th className={tableHeaderNumericClass}>Preço Médio</th>
                      <th className={tableHeaderNumericClass}>CMV Total</th>
                      <th className={tableHeaderNumericClass}>Margem Contribuição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground max-w-[200px] truncate">{p.name}</td>
                        <td className="px-4 py-2.5 font-mono text-[11.5px] text-muted-foreground">{p.sku}</td>
                        <td className={tableCellNumericClass}>{p.unitsSold}</td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(p.revenue, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(p.averagePrice, baseCurrency)}
                        </td>
                        <td className={cn(tableCellNumericClass, "text-destructive")}>
                          {MetricsEngine.formatCurrency(p.cogs, baseCurrency)}
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            p.profit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-destructive",
                          )}
                        >
                          {MetricsEngine.formatCurrency(p.profit, baseCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONTEÚDO DA TABELA: ABA 4 — VENDAS EM TEMPO REAL (LIVE FEED) */}
            {activeTableTab === "live_orders" && (
              <div className="overflow-x-auto">
                {filteredLiveOrders.length === 0 ? (
                  <div className="p-8 text-center text-[13px] text-muted-foreground">
                    Nenhum pedido encontrado.
                  </div>
                ) : (
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className={tableHeaderCellClass}>Pedido #</th>
                        <th className={tableHeaderCellClass}>Status</th>
                        <th className={tableHeaderCellClass}>Gateway</th>
                        <th className={tableHeaderCellClass}>Origem (UTM Source)</th>
                        <th className={tableHeaderCellClass}>Campanha</th>
                        <th className={tableHeaderNumericClass}>Valor Total</th>
                        <th className={tableHeaderNumericClass}>Data / Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredLiveOrders.slice(0, 15).map((ord) => (
                        <tr key={ord.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-[12px] font-semibold text-foreground">
                            {ord.order_number || ord.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium border",
                                ord.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/30",
                              )}
                            >
                              {ord.status === "paid" ? "Aprovado" : ord.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground capitalize">
                            {ord.payment_gateway || "Direto"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11.5px] text-foreground">
                            {ord.utm_source || "Orgânico / Direto"}
                          </td>
                          <td className="px-4 py-2.5 text-[12px] text-muted-foreground max-w-[180px] truncate">
                            {ord.utm_campaign || "—"}
                          </td>
                          <td className={cn(tableCellNumericClass, "font-bold text-foreground")}>
                            {MetricsEngine.formatCurrency(ord.total_amount, ord.currency || baseCurrency)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground text-[11.5px]">
                            {new Date(ord.ordered_at).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>

          {/* FAIXA DO COSTFY BRAIN (EXECUTIVE OPERATING COCKPIT INTELLIGENCE) */}
          <section
            aria-label="Costfy Brain Diagnostics"
            className="editorial-card p-4.5 bg-surface/40 space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <CostfyMark size={20} className="text-primary shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground">Costfy Brain Intelligence</span>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.2 text-[10.5px] font-semibold tabular-nums",
                        healthScore >= 80
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      Health Score: {healthScore}/100
                    </span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    {insights.length > 0
                      ? `${insights.length} ponto(s) operacional(is) analisado(s) com sugestão de ação imediata.`
                      : "Operação operando dentro dos parâmetros ideais de margem e tráfego."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {visibleProposals[0] && (
                  <button
                    type="button"
                    onClick={() => handleApproveProposal(visibleProposals[0]!)}
                    className={buttonClass("primary", "sm", "text-[12px] h-7 px-3")}
                  >
                    <ShieldCheck className="size-3.5" />
                    Aprovar: {visibleProposals[0]!.title}
                  </button>
                )}
                <Link to="/brain" className={buttonClass("outline", "sm", "text-[12px] h-7 px-3")}>
                  Abrir Brain Hub <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Diagnósticos estruturados: O QUE aconteceu · POR QUE aconteceu · O QUE fazer */}
            {insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {insights.slice(0, 2).map((ins) => (
                  <div
                    key={ins.id}
                    className="rounded-lg border border-border/80 bg-card p-3 space-y-1.5 text-[12px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate pr-2">{ins.title}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.2 text-[10px] font-medium shrink-0",
                          ins.severity === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : ins.severity === "warning"
                              ? "bg-warning/10 text-warning"
                              : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {ins.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                      {ins.description}
                    </p>
                    {ins.recommendation && (
                      <div className="pt-1 border-t border-border/50 text-[11px] text-foreground font-medium flex items-center gap-1.5">
                        <span className="text-primary font-semibold">O que fazer:</span>
                        <span className="truncate">{ins.recommendation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </>
  );
}

function EmptyWorkspaceState() {
  return (
    <div className="editorial-card p-10 text-center bg-surface/40 max-w-xl mx-auto my-8">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-border bg-card">
        <Boxes className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-[16px] font-semibold text-foreground">Nenhum workspace selecionado</h2>
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
