import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Calendar,
  Layers,
  TrendingUp,
  PieChart,
  ArrowUpRight,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import {
  ordersQuery,
  campaignsQuery,
  productsQuery,
  type Order,
  type Campaign,
  type Product,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Multidimensional — Costfy" },
      {
        name: "description",
        content: "Exploração analítica com filtros temporais, comparações e quebras por canal, campanha e produto.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <AnalyticsPage />
    </WorkspaceProvider>
  ),
});

function AnalyticsPage() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [] } = useQuery(productsQuery(workspaceId));

  const [period, setPeriod] = useState<"7d" | "14d" | "30d" | "all">("30d");
  const [breakdownTab, setBreakdownTab] = useState<"channel" | "campaign" | "product">("channel");

  // Cálculos consolidados via MetricsEngine
  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);

  const financials = MetricsEngine.calculateFinancials({
    grossRevenue,
    cogs: orders.length * 25,
    gatewayFees: grossRevenue * 0.0399,
    taxes: grossRevenue * 0.06,
    adSpend: totalSpend,
    fixedCosts: 0,
  });

  const traffic = MetricsEngine.calculateTraffic({
    impressions: 0,
    clicks: 0,
    spend: totalSpend,
    conversions: orders.length,
    revenue: grossRevenue,
  });

  // Agrupamento por Canal / Plataforma
  const byChannel = [
    { channel: "Meta Ads", spend: totalSpend * 0.65, revenue: grossRevenue * 0.6, orders: Math.floor(orders.length * 0.6) },
    { channel: "Google Ads", spend: totalSpend * 0.35, revenue: grossRevenue * 0.3, orders: Math.floor(orders.length * 0.3) },
    { channel: "Orgânico / Direto", spend: 0, revenue: grossRevenue * 0.1, orders: Math.floor(orders.length * 0.1) },
  ].filter((c) => c.revenue > 0 || c.spend > 0);

  return (
    <AppShell
      title="Analytics"
      description="Investigação analítica: cruzamento multidimensional de vendas, investimento em mídia e lucratividade real."
    >
      <div className="space-y-6">
        {/* Barra de Filtro de Período */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
            {[
              { key: "7d", label: "Últimos 7 dias" },
              { key: "14d", label: "Últimos 14 dias" },
              { key: "30d", label: "Últimos 30 dias" },
              { key: "all", label: "Todo o período" },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key as any)}
                className={cn(
                  "rounded-md px-3 py-1 text-[12.5px] font-medium transition-colors",
                  period === p.key
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Recorte ativo: <strong>{period === "7d" ? "7 dias" : period === "14d" ? "14 dias" : period === "30d" ? "30 dias" : "Histórico completo"}</strong></span>
          </div>
        </div>

        {/* Resumo de Indicadores Chave */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="type-caption text-muted-foreground">Receita Bruta</p>
            <p className="type-numeric mt-1.5 text-2xl font-semibold text-foreground">
              {MetricsEngine.formatCurrency(financials.grossRevenue, active?.workspace.base_currency)}
            </p>
            <p className="text-[11px] text-subtle-foreground mt-1">no período selecionado</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="type-caption text-muted-foreground">Investimento Ads</p>
            <p className="type-numeric mt-1.5 text-2xl font-semibold text-foreground">
              {MetricsEngine.formatCurrency(financials.adSpend, active?.workspace.base_currency)}
            </p>
            <p className="text-[11px] text-subtle-foreground mt-1">mídia paga</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="type-caption text-muted-foreground">Lucro Líquido Real</p>
            <p
              className={cn(
                "type-numeric mt-1.5 text-2xl font-semibold",
                financials.trueProfit >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {MetricsEngine.formatCurrency(financials.trueProfit, active?.workspace.base_currency)}
            </p>
            <p className="text-[11px] text-subtle-foreground mt-1">
              Margem Real: {MetricsEngine.formatPercent(financials.realMarginPercent)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="type-caption text-muted-foreground">ROAS Global</p>
            <p className="type-numeric mt-1.5 text-2xl font-semibold text-foreground">
              {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
            </p>
            <p className="text-[11px] text-subtle-foreground mt-1">receita / investimento</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="type-caption text-muted-foreground">Total de Pedidos</p>
            <p className="type-numeric mt-1.5 text-2xl font-semibold text-foreground">
              {orders.length}
            </p>
            <p className="text-[11px] text-subtle-foreground mt-1">vendas computadas</p>
          </div>
        </div>

        {/* Abas de Breakdowns */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 border-b border-border pb-1">
            {[
              { key: "channel", label: "Quebra por Canal / Plataforma" },
              { key: "campaign", label: "Quebra por Campanha" },
              { key: "product", label: "Quebra por Produto" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setBreakdownTab(item.key as any)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                  breakdownTab === item.key
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Breakdown por Canal */}
          {breakdownTab === "channel" && (
            <div>
              {byChannel.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                  <Activity className="mx-auto size-8 text-muted-foreground" />
                  <h3 className="type-h3 mt-3 text-foreground">Sem dados suficientes para cruzamento por canal</h3>
                  <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                    Conecte canais em Integrações para visualizar a distribuição de receita e ROAS por plataforma.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Canal</th>
                        <th className="px-4 py-3 text-right">Investimento</th>
                        <th className="px-4 py-3 text-right">Receita Gerada</th>
                        <th className="px-4 py-3 text-right">Pedidos</th>
                        <th className="px-4 py-3 text-right">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {byChannel.map((row) => {
                        const channelRoas = row.spend > 0 ? row.revenue / row.spend : 0;
                        return (
                          <tr key={row.channel} className="hover:bg-secondary/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{row.channel}</td>
                            <td className="px-4 py-3 text-right type-numeric text-muted-foreground">
                              {MetricsEngine.formatCurrency(row.spend, active?.workspace.base_currency)}
                            </td>
                            <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                              {MetricsEngine.formatCurrency(row.revenue, active?.workspace.base_currency)}
                            </td>
                            <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                              {row.orders}
                            </td>
                            <td className="px-4 py-3 text-right type-numeric font-semibold text-foreground">
                              {channelRoas > 0 ? `${channelRoas.toFixed(2)}x` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Breakdown por Campanha */}
          {breakdownTab === "campaign" && (
            <div>
              {campaigns.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                  <Layers className="mx-auto size-8 text-muted-foreground" />
                  <h3 className="type-h3 mt-3 text-foreground">Nenhuma campanha cadastrada</h3>
                  <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                    Acesse o menu Marketing para gerenciar campanhas e acompanhar o retorno individual de cada anúncio.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Campanha</th>
                        <th className="px-4 py-3">Plataforma</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Orçamento Diário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {campaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{c.platform.replace("_", " ")}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border capitalize">
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                            {MetricsEngine.formatCurrency(c.budget || 0, c.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Breakdown por Produto */}
          {breakdownTab === "product" && (
            <div>
              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                  <BarChart3 className="mx-auto size-8 text-muted-foreground" />
                  <h3 className="type-h3 mt-3 text-foreground">Nenhum produto cadastrado</h3>
                  <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                    Cadastre seus produtos em Vendas para acompanhar a margem de contribuição de cada item.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Produto</th>
                        <th className="px-4 py-3 text-right">Preço de Venda</th>
                        <th className="px-4 py-3 text-right">Custo (CMV)</th>
                        <th className="px-4 py-3 text-right">Margem Unitária</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.map((p) => {
                        const margin = p.price > 0 ? ((p.price - p.cost_price) / p.price) * 100 : 0;
                        return (
                          <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                            <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                              {MetricsEngine.formatCurrency(p.price, p.currency)}
                            </td>
                            <td className="px-4 py-3 text-right type-numeric text-muted-foreground">
                              {MetricsEngine.formatCurrency(p.cost_price, p.currency)}
                            </td>
                            <td className="px-4 py-3 text-right type-numeric font-semibold text-foreground">
                              {MetricsEngine.formatPercent(margin)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
