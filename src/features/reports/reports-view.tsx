import { useState } from "react";
import {
  Printer,
  Download,
  Search,
  LineChart,
  DollarSign,
  TrendingUp,
  Boxes,
  PieChart,
  FileSpreadsheet,
  ArrowUpRight,
  Filter,
} from "lucide-react";

import { AppShellActions } from "@/components/app/app-shell";
import { useWorkspace } from "@/components/app/workspace-context";
import { MetricsEngine } from "@/lib/metrics-engine";
import {
  buttonClass,
  inputClass,
  tableCellNumericClass,
  tableHeaderCellClass,
  tableHeaderNumericClass,
} from "@/lib/ui";
import { cn } from "@/lib/utils";
import { exportToCSV } from "./reports-export";
import {
  useReportsData,
  type ReportTimeframe,
  type CampaignReportItem,
  type ChannelReportItem,
  type ProductReportItem,
} from "./reports.queries";

const TIMEFRAME_LABELS: Record<ReportTimeframe, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  "7d": "Últimos 7 dias",
  "14d": "Últimos 14 dias",
  "30d": "Últimos 30 dias",
  this_month: "Este mês",
  last_month: "Mês passado",
  all: "Todo o histórico",
};

export function ReportsView() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;
  const baseCurrency = active?.workspace.base_currency || "BRL";

  const [timeframe, setTimeframe] = useState<ReportTimeframe>("30d");
  const [activeTab, setActiveTab] = useState<"executive_dre" | "campaigns" | "channels" | "products">(
    "executive_dre",
  );
  const [filterQuery, setFilterQuery] = useState("");

  const {
    isLoading,
    dre,
    traffic,
    dreRows,
    campaignsReport,
    channelsReport,
    productsReport,
    totalOrdersCount,
  } = useReportsData(workspaceId, timeframe, filterQuery);

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    const dateStr = new Date().toISOString().slice(0, 10);

    if (activeTab === "executive_dre") {
      const headers = ["Indicador / Linha DRE", "Valor (BRL)", "% sobre Receita Bruta"];
      const rows = dreRows.map((r) => [
        r.label,
        r.value.toFixed(2),
        `${r.percentOfRevenue.toFixed(1)}%`,
      ]);
      exportToCSV(`costfy_dre_${timeframe}`, headers, rows);
    } else if (activeTab === "campaigns") {
      const headers = [
        "Campanha",
        "Plataforma",
        "Status",
        "Investimento (BRL)",
        "Receita Atribuída (BRL)",
        "Conversões",
        "CPA Médio (BRL)",
        "ROAS",
        "Lucro Bruto (BRL)",
        "Margem (%)",
      ];
      const rows = campaignsReport.map((c) => [
        c.name,
        c.platform,
        c.status,
        c.spend.toFixed(2),
        c.revenue.toFixed(2),
        c.conversions,
        c.cpa.toFixed(2),
        c.roas.toFixed(2),
        c.profit.toFixed(2),
        `${c.marginPercent.toFixed(1)}%`,
      ]);
      exportToCSV(`costfy_campanhas_${timeframe}`, headers, rows);
    } else if (activeTab === "channels") {
      const headers = [
        "Canal de Aquisição",
        "Investimento (BRL)",
        "Receita (BRL)",
        "Pedidos",
        "CPA (BRL)",
        "ROAS",
        "Lucro (BRL)",
        "Margem (%)",
      ];
      const rows = channelsReport.map((ch) => [
        ch.channel,
        ch.spend.toFixed(2),
        ch.revenue.toFixed(2),
        ch.orders,
        ch.cpa.toFixed(2),
        ch.roas.toFixed(2),
        ch.profit.toFixed(2),
        `${ch.marginPercent.toFixed(1)}%`,
      ]);
      exportToCSV(`costfy_canais_${timeframe}`, headers, rows);
    } else if (activeTab === "products") {
      const headers = [
        "Produto",
        "SKU",
        "Unidades Vendidas",
        "Faturamento Total (BRL)",
        "Preço Médio (BRL)",
        "CMV Total (BRL)",
        "Margem de Contribuição (BRL)",
        "Margem (%)",
      ];
      const rows = productsReport.map((p) => [
        p.name,
        p.sku,
        p.unitsSold,
        p.totalRevenue.toFixed(2),
        p.averagePrice.toFixed(2),
        p.totalCogs.toFixed(2),
        p.contributionMargin.toFixed(2),
        `${p.marginPercent.toFixed(1)}%`,
      ]);
      exportToCSV(`costfy_produtos_${timeframe}`, headers, rows);
    }
  }

  return (
    <>
      <AppShellActions>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className={buttonClass("outline", "sm", "gap-1.5")}
            title="Exportar planilha CSV formatada para Excel e Sheets"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Exportar</span> CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className={buttonClass("outline", "sm", "gap-1.5")}
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Imprimir / Salvar</span> PDF
          </button>
        </div>
      </AppShellActions>

      <div className="space-y-6">
        {/* BARRA DE CONTROLE: Timeframe & Seleção de Relatório */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          {/* Abas do Relatório */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: "executive_dre", label: "DRE Consolidada", icon: FileSpreadsheet },
                { key: "campaigns", label: "Campanhas & Mídia", icon: LineChart },
                { key: "channels", label: "Canais de Aquisição", icon: PieChart },
                { key: "products", label: "Produtos & SKUs", icon: Boxes },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.key
                      ? "bg-secondary text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Seletor de Período Temporal */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Filter className="size-3.5" />
              <span className="hidden md:inline">Período:</span>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as ReportTimeframe)}
              className="h-8 rounded-md border border-border bg-card px-2.5 text-[12.5px] font-medium text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(Object.keys(TIMEFRAME_LABELS) as ReportTimeframe[]).map((t) => (
                <option key={t} value={t}>
                  {TIMEFRAME_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUMMARY CARDS EXECUTIVOS */}
        <section
          aria-label="Resumo do Período"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4"
        >
          <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
            <span className="text-[11.5px] font-medium text-muted-foreground">Faturamento Bruto</span>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground tabular-nums">
              {MetricsEngine.formatCurrency(dre.grossRevenue, baseCurrency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {totalOrdersCount} {totalOrdersCount === 1 ? "pedido faturado" : "pedidos faturados"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
            <span className="text-[11.5px] font-medium text-muted-foreground">Investimento em Ads</span>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground tabular-nums">
              {MetricsEngine.formatCurrency(dre.adSpend, baseCurrency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ROAS: {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
            <span className="text-[11.5px] font-medium text-muted-foreground">Margem de Contribuição</span>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground tabular-nums">
              {MetricsEngine.formatCurrency(dre.contributionMargin, baseCurrency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {dre.grossRevenue > 0
                ? MetricsEngine.formatPercent((dre.contributionMargin / dre.grossRevenue) * 100)
                : "0%"}{" "}
              s/ receita
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
            <span className="text-[11.5px] font-medium text-muted-foreground">Lucro Líquido Real</span>
            <p
              className={cn(
                "mt-1 text-xl font-bold tracking-tight tabular-nums",
                dre.trueProfit >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {MetricsEngine.formatCurrency(dre.trueProfit, baseCurrency)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              Margem Real: {MetricsEngine.formatPercent(dre.realMarginPercent)}
            </p>
          </div>
        </section>

        {/* ABA 1: DRE CONSOLIDADA */}
        {activeTab === "executive_dre" && (
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden print:border-none print:shadow-none">
            <div className="flex flex-col gap-1 border-b border-border bg-surface/50 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="type-h3 text-foreground">Demonstrativo de Resultado do Exercício (DRE)</h3>
                  <p className="text-[12px] text-muted-foreground">
                    Cálculo gerencial auditado conforme princípios de competência e rateio operacional.
                  </p>
                </div>
                <div className="text-right text-[11.5px] text-muted-foreground">
                  <p>
                    Período: <strong className="text-foreground">{TIMEFRAME_LABELS[timeframe]}</strong>
                  </p>
                  <p>Moeda: {baseCurrency}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className={tableHeaderCellClass}>Conta / Indicador de Resultado</th>
                    <th className={tableHeaderNumericClass}>Valor Consolidado</th>
                    <th className={tableHeaderNumericClass}>% s/ Receita Bruta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {dreRows.map((row) => {
                    const isResult = row.type === "result";
                    const isSubtotal = row.type === "subtotal";
                    const isNegative = row.type === "negative";

                    return (
                      <tr
                        key={row.key}
                        className={cn(
                          "transition-colors",
                          isResult
                            ? "bg-secondary/70 font-bold text-[13.5px] text-foreground"
                            : isSubtotal
                              ? "bg-surface/60 font-semibold text-foreground"
                              : "hover:bg-secondary/30 text-muted-foreground",
                        )}
                      >
                        <td className="px-4 py-2.5 font-medium">
                          <span
                            className={cn(
                              isResult ? "text-foreground font-bold tracking-tight" : "",
                              isSubtotal ? "text-foreground" : "",
                            )}
                          >
                            {row.label}
                          </span>
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            "px-4 py-2.5 tabular-nums",
                            isResult
                              ? row.value >= 0
                                ? "text-success font-bold"
                                : "text-destructive font-bold"
                              : isNegative
                                ? "text-destructive"
                                : "text-foreground",
                          )}
                        >
                          {MetricsEngine.formatCurrency(row.value, baseCurrency)}
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            "px-4 py-2.5 tabular-nums text-muted-foreground",
                            isResult ? "font-bold text-foreground" : "",
                          )}
                        >
                          {MetricsEngine.formatPercent(row.percentOfRevenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border/80 bg-surface/30 px-5 py-3 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Costfy Operating System • Relatório gerado em tempo real com integridade contábil.</span>
              <span>Workspace: {active?.workspace.name}</span>
            </div>
          </div>
        )}

        {/* ABA 2: CAMPANHAS & MÍDIA */}
        {activeTab === "campaigns" && (
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border bg-surface/50 px-5 py-3.5">
              <div>
                <h3 className="type-h3 text-foreground">Relatório Detalhado por Campanha</h3>
                <p className="text-[12px] text-muted-foreground">
                  Performance de investimento, faturamento atribuído, ROAS e margem de lucro por campanha.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Filtrar por campanha..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className={cn(inputClass, "pl-8 text-[12.5px] h-8")}
                />
              </div>
            </div>

            {campaignsReport.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-muted-foreground">
                Nenhuma campanha encontrada para os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className={tableHeaderCellClass}>Campanha</th>
                      <th className={tableHeaderCellClass}>Plataforma</th>
                      <th className={tableHeaderNumericClass}>Investimento</th>
                      <th className={tableHeaderNumericClass}>Receita Atribuída</th>
                      <th className={tableHeaderNumericClass}>Pedidos</th>
                      <th className={tableHeaderNumericClass}>CPA</th>
                      <th className={tableHeaderNumericClass}>ROAS</th>
                      <th className={tableHeaderNumericClass}>Lucro (Mídia)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {campaignsReport.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground max-w-[220px] truncate">
                          {c.name}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-[12px] capitalize">
                          {c.platform.replace(/_/g, " ")}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(c.spend, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(c.revenue, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>{c.conversions}</td>
                        <td className={tableCellNumericClass}>
                          {c.cpa > 0 ? MetricsEngine.formatCurrency(c.cpa, baseCurrency) : "—"}
                        </td>
                        <td className={tableCellNumericClass}>
                          <span
                            className={cn(
                              "font-semibold",
                              c.roas >= 2
                                ? "text-success"
                                : c.roas >= 1
                                  ? "text-foreground"
                                  : "text-destructive",
                            )}
                          >
                            {c.roas > 0 ? `${c.roas.toFixed(2)}x` : "—"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            c.profit >= 0 ? "text-success font-semibold" : "text-destructive",
                          )}
                        >
                          {MetricsEngine.formatCurrency(c.profit, baseCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-border bg-surface font-semibold text-foreground text-[12.5px]">
                    <tr>
                      <td className="px-3 py-2.5" colSpan={2}>
                        Total Consolidado ({campaignsReport.length} campanhas)
                      </td>
                      <td className={tableCellNumericClass}>
                        {MetricsEngine.formatCurrency(
                          campaignsReport.reduce((acc, c) => acc + c.spend, 0),
                          baseCurrency,
                        )}
                      </td>
                      <td className={tableCellNumericClass}>
                        {MetricsEngine.formatCurrency(
                          campaignsReport.reduce((acc, c) => acc + c.revenue, 0),
                          baseCurrency,
                        )}
                      </td>
                      <td className={tableCellNumericClass}>
                        {campaignsReport.reduce((acc, c) => acc + c.conversions, 0)}
                      </td>
                      <td className={tableCellNumericClass}>—</td>
                      <td className={tableCellNumericClass}>
                        {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
                      </td>
                      <td className={tableCellNumericClass}>
                        {MetricsEngine.formatCurrency(
                          campaignsReport.reduce((acc, c) => acc + c.profit, 0),
                          baseCurrency,
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: CANAIS DE AQUISIÇÃO */}
        {activeTab === "channels" && (
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border bg-surface/50 px-5 py-3.5">
              <div>
                <h3 className="type-h3 text-foreground">Performance por Canal de Aquisição</h3>
                <p className="text-[12px] text-muted-foreground">
                  Consolidação de canais pagos versus fontes orgânicas e tráfego direto.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Filtrar canal..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className={cn(inputClass, "pl-8 text-[12.5px] h-8")}
                />
              </div>
            </div>

            {channelsReport.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-muted-foreground">
                Nenhum canal com movimentação no período selecionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className={tableHeaderCellClass}>Canal de Aquisição</th>
                      <th className={tableHeaderNumericClass}>Investimento (Ads)</th>
                      <th className={tableHeaderNumericClass}>Receita Faturada</th>
                      <th className={tableHeaderNumericClass}>Pedidos Gerados</th>
                      <th className={tableHeaderNumericClass}>CPA</th>
                      <th className={tableHeaderNumericClass}>ROAS</th>
                      <th className={tableHeaderNumericClass}>Margem Líquida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {channelsReport.map((ch) => (
                      <tr key={ch.channel} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground">{ch.channel}</td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(ch.spend, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(ch.revenue, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>{ch.orders}</td>
                        <td className={tableCellNumericClass}>
                          {ch.cpa > 0 ? MetricsEngine.formatCurrency(ch.cpa, baseCurrency) : "—"}
                        </td>
                        <td className={tableCellNumericClass}>
                          {ch.roas > 0 ? `${ch.roas.toFixed(2)}x` : "—"}
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            ch.marginPercent >= 0 ? "text-success font-semibold" : "text-destructive",
                          )}
                        >
                          {MetricsEngine.formatPercent(ch.marginPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ABA 4: PRODUTOS & SKUS */}
        {activeTab === "products" && (
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border bg-surface/50 px-5 py-3.5">
              <div>
                <h3 className="type-h3 text-foreground">Relatório de Produtos & SKUs</h3>
                <p className="text-[12px] text-muted-foreground">
                  Unidades vendidas, faturamento bruto, CMV total e margem de contribuição por SKU.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Filtrar por produto ou SKU..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className={cn(inputClass, "pl-8 text-[12.5px] h-8")}
                />
              </div>
            </div>

            {productsReport.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-muted-foreground">
                Nenhum produto cadastrado ou vendido no período selecionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className={tableHeaderCellClass}>Produto / Oferta</th>
                      <th className={tableHeaderCellClass}>SKU</th>
                      <th className={tableHeaderNumericClass}>Unid. Vendidas</th>
                      <th className={tableHeaderNumericClass}>Faturamento Total</th>
                      <th className={tableHeaderNumericClass}>Preço Médio</th>
                      <th className={tableHeaderNumericClass}>CMV Total</th>
                      <th className={tableHeaderNumericClass}>Margem Contribuição</th>
                      <th className={tableHeaderNumericClass}>Margem (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {productsReport.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground max-w-[220px] truncate">
                          {p.name}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11.5px] text-muted-foreground">
                          {p.sku}
                        </td>
                        <td className={tableCellNumericClass}>{p.unitsSold}</td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(p.totalRevenue, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatCurrency(p.averagePrice, baseCurrency)}
                        </td>
                        <td className={cn(tableCellNumericClass, "text-destructive")}>
                          {MetricsEngine.formatCurrency(p.totalCogs, baseCurrency)}
                        </td>
                        <td
                          className={cn(
                            tableCellNumericClass,
                            p.contributionMargin >= 0
                              ? "text-success font-semibold"
                              : "text-destructive",
                          )}
                        >
                          {MetricsEngine.formatCurrency(p.contributionMargin, baseCurrency)}
                        </td>
                        <td className={tableCellNumericClass}>
                          {MetricsEngine.formatPercent(p.marginPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
