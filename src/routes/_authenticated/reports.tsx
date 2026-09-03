import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Printer, Calendar, Layers, Sparkles, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
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
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios Executivos — Costfy" },
      {
        name: "description",
        content: "Gere e exporte relatórios executivos de DRE, tráfego pago e vendas consolidadas.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <ReportsPage />
    </WorkspaceProvider>
  ),
});

function ReportsPage() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: fixedCosts = [] } = useQuery(fixedCostsQuery(workspaceId));
  const { data: orderItems = [] } = useQuery(orderItemsQuery(workspaceId));
  const { data: gatewayFees = [] } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: taxes = [] } = useQuery(taxesQuery(workspaceId));
  const { data: adMetrics = [] } = useQuery(adMetricsDailyQuery(workspaceId));

  const [reportType, setReportType] = useState<"executive" | "dre" | "traffic">("executive");

  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const dre = MetricsEngine.calculateWorkspaceFinancials({
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
    spend: dre.adSpend,
    conversions: orders.length,
    revenue: grossRevenue,
  });

  function handlePrint() {
    window.print();
  }

  return (
    <AppShell
      title="Relatórios"
      description="Documentos consolidados para diretoria, investidores e planejamento estratégico."
      actions={
        <button
          type="button"
          onClick={handlePrint}
          className={buttonClass("outline", "sm", "gap-1.5")}
        >
          <Printer className="size-3.5" />
          Imprimir / Salvar PDF
        </button>
      }
    >
      <div className="space-y-6">
        {/* Seleção de Relatório */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          {(
            [
              { key: "executive", label: "Relatório Executivo Geral" },
              { key: "dre", label: "DRE Contábil & Gerencial" },
              { key: "traffic", label: "Performance de Mídia & ROAS" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setReportType(item.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                reportType === item.key
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Folha do Relatório */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
          {/* Cabeçalho do Relatório */}
          <div className="flex items-start justify-between border-b border-border pb-5">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-accent uppercase">
                Costfy Intelligent Operating System
              </span>
              <h2 className="type-h2 mt-1 text-foreground">
                {reportType === "executive"
                  ? "Relatório Executivo Consolidado"
                  : reportType === "dre"
                    ? "Demonstrativo de Resultado do Exercício (DRE)"
                    : "Relatório de Performance de Tráfego e Mídia"}
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Workspace: <strong className="text-foreground">{active?.workspace.name}</strong> •
                Moeda: <span className="font-mono">{active?.workspace.base_currency || "BRL"}</span>
              </p>
            </div>
            <div className="text-right text-[12px] text-muted-foreground">
              <p>Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
              <p>Status: Consolidado Real</p>
            </div>
          </div>

          {/* Quadro Executivo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="type-caption text-muted-foreground">Faturamento Bruto</p>
              <p className="type-numeric mt-1 text-xl font-bold text-foreground">
                {MetricsEngine.formatCurrency(dre.grossRevenue, active?.workspace.base_currency)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="type-caption text-muted-foreground">Investimento em Mídia</p>
              <p className="type-numeric mt-1 text-xl font-bold text-foreground">
                {MetricsEngine.formatCurrency(dre.adSpend, active?.workspace.base_currency)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="type-caption text-muted-foreground">Lucro Líquido Real</p>
              <p
                className={cn(
                  "type-numeric mt-1 text-xl font-bold",
                  dre.trueProfit >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {MetricsEngine.formatCurrency(dre.trueProfit, active?.workspace.base_currency)}
              </p>
            </div>
          </div>

          {/* Linhas da DRE do Relatório */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface border-b border-border text-[11.5px] font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2.5">Conta / Indicador</th>
                  <th className="px-4 py-2.5 text-right">Valor Consolidado</th>
                  <th className="px-4 py-2.5 text-right">% s/ Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="font-semibold text-foreground bg-card">
                  <td className="px-4 py-2.5">(+) Receita Bruta</td>
                  <td className="px-4 py-2.5 text-right type-numeric">
                    {MetricsEngine.formatCurrency(
                      dre.grossRevenue,
                      active?.workspace.base_currency,
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right type-numeric">100,0%</td>
                </tr>
                <tr className="text-muted-foreground">
                  <td className="px-4 py-2.5">(−) CMV (Custos de Mercadorias)</td>
                  <td className="px-4 py-2.5 text-right type-numeric text-destructive">
                    {MetricsEngine.formatCurrency(dre.cogs, active?.workspace.base_currency)}
                  </td>
                  <td className="px-4 py-2.5 text-right type-numeric">
                    {dre.grossRevenue > 0
                      ? MetricsEngine.formatPercent((dre.cogs / dre.grossRevenue) * 100)
                      : "0%"}
                  </td>
                </tr>
                <tr className="text-muted-foreground">
                  <td className="px-4 py-2.5">(−) Taxas de Pagamento / Gateways</td>
                  <td className="px-4 py-2.5 text-right type-numeric text-destructive">
                    {MetricsEngine.formatCurrency(dre.gatewayFees, active?.workspace.base_currency)}
                  </td>
                  <td className="px-4 py-2.5 text-right type-numeric">
                    {dre.grossRevenue > 0
                      ? MetricsEngine.formatPercent((dre.gatewayFees / dre.grossRevenue) * 100)
                      : "0%"}
                  </td>
                </tr>
                <tr className="text-muted-foreground">
                  <td className="px-4 py-2.5">(−) Impostos e Tributos</td>
                  <td className="px-4 py-2.5 text-right type-numeric text-destructive">
                    {MetricsEngine.formatCurrency(dre.taxes, active?.workspace.base_currency)}
                  </td>
                  <td className="px-4 py-2.5 text-right type-numeric">
                    {dre.grossRevenue > 0
                      ? MetricsEngine.formatPercent((dre.taxes / dre.grossRevenue) * 100)
                      : "0%"}
                  </td>
                </tr>
                <tr className="text-muted-foreground">
                  <td className="px-4 py-2.5">(−) Tráfego Pago / Mídia</td>
                  <td className="px-4 py-2.5 text-right type-numeric text-destructive">
                    {MetricsEngine.formatCurrency(dre.adSpend, active?.workspace.base_currency)}
                  </td>
                  <td className="px-4 py-2.5 text-right type-numeric">
                    {dre.grossRevenue > 0
                      ? MetricsEngine.formatPercent((dre.adSpend / dre.grossRevenue) * 100)
                      : "0%"}
                  </td>
                </tr>
                <tr className="text-muted-foreground">
                  <td className="px-4 py-2.5">(−) Custos Fixos Operacionais</td>
                  <td className="px-4 py-2.5 text-right type-numeric text-destructive">
                    {MetricsEngine.formatCurrency(dre.fixedCosts, active?.workspace.base_currency)}
                  </td>
                  <td className="px-4 py-2.5 text-right type-numeric">
                    {dre.grossRevenue > 0
                      ? MetricsEngine.formatPercent((dre.fixedCosts / dre.grossRevenue) * 100)
                      : "0%"}
                  </td>
                </tr>
                <tr className="font-bold text-[14px] bg-secondary/50 text-foreground">
                  <td className="px-4 py-3">(=) LUCRO LÍQUIDO REAL</td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right type-numeric",
                      dre.trueProfit >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {MetricsEngine.formatCurrency(dre.trueProfit, active?.workspace.base_currency)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right type-numeric",
                      dre.trueProfit >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {MetricsEngine.formatPercent(dre.realMarginPercent)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-muted-foreground text-center border-t border-border pt-4">
            Costfy — Intelligent Operating System for Digital Businesses • Documento gerado com
            dados auditados do workspace.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
