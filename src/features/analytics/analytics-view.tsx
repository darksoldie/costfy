import { useState } from "react";
import { Activity, BarChart3, Calendar, Layers } from "lucide-react";

import { useWorkspace } from "@/components/app/workspace-context";
import { MetricsEngine } from "@/lib/metrics-engine";
import { cn } from "@/lib/utils";
import { useAnalyticsData, type AnalyticsPeriod } from "./analytics.queries";

export function AnalyticsView() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [breakdownTab, setBreakdownTab] = useState<"channel" | "campaign" | "product">("channel");

  const { orders, campaigns, products, financials, traffic, byChannel } = useAnalyticsData(
    workspaceId,
    period,
  );

  return (
    <div className="space-y-6">
      {/* Barra de Filtro de Período */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
          {(
            [
              { key: "7d", label: "Últimos 7 dias" },
              { key: "14d", label: "Últimos 14 dias" },
              { key: "30d", label: "Últimos 30 dias" },
              { key: "all", label: "Todo o período" },
            ] as const
          ).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
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
          <span>
            Recorte ativo:{" "}
            <strong>
              {period === "7d"
                ? "7 dias"
                : period === "14d"
                  ? "14 dias"
                  : period === "30d"
                    ? "30 dias"
                    : "Histórico completo"}
            </strong>
          </span>
        </div>
      </div>

      {/* Resumo de Indicadores Chave — Editorial Terminal Strip */}
      <div className="editorial-card overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-5">
          <div className="p-4 sm:p-5">
            <span className="type-label-subtle">Receita Bruta</span>
            <p className="type-metric-hero mt-2 text-foreground">
              {MetricsEngine.formatCurrency(
                financials.grossRevenue,
                active?.workspace.base_currency,
              )}
            </p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">no período selecionado</p>
          </div>

          <div className="p-4 sm:p-5">
            <span className="type-label-subtle">Investimento Ads</span>
            <p className="type-metric-hero mt-2 text-foreground">
              {MetricsEngine.formatCurrency(financials.adSpend, active?.workspace.base_currency)}
            </p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              gasto consolidado em mídia
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <span className="type-label-subtle">Lucro Líquido Real</span>
            <p
              className={cn(
                "type-metric-hero mt-2",
                financials.trueProfit >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {MetricsEngine.formatCurrency(
                financials.trueProfit,
                active?.workspace.base_currency,
              )}
            </p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              Margem: {MetricsEngine.formatPercent(financials.realMarginPercent)}
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <span className="type-label-subtle">ROAS Global</span>
            <p className="type-metric-hero mt-2 text-foreground">
              {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
            </p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">receita / investimento</p>
          </div>

          <div className="p-4 sm:p-5">
            <span className="type-label-subtle">Total de Pedidos</span>
            <p className="type-metric-hero mt-2 text-foreground">{orders.length}</p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">vendas computadas</p>
          </div>
        </div>
      </div>

      {/* Abas de Breakdowns */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 border-b border-border pb-1">
          {(
            [
              { key: "channel", label: "Quebra por Canal / Plataforma" },
              { key: "campaign", label: "Quebra por Campanha" },
              { key: "product", label: "Quebra por Produto" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setBreakdownTab(item.key)}
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
                <h3 className="type-h3 mt-3 text-foreground">
                  Sem dados suficientes para cruzamento por canal
                </h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Conecte canais em Integrações para visualizar a distribuição de receita e ROAS
                  por plataforma.
                </p>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Canal</th>
                      <th className="px-4 py-3 text-right">Investimento</th>
                      <th className="px-4 py-3 text-right">Receita Gerada</th>
                      <th className="px-4 py-3 text-right">Pedidos</th>
                      <th className="px-4 py-3 text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border">
                    {byChannel.map((row) => {
                      const channelRoas = row.spend > 0 ? row.revenue / row.spend : 0;
                      return (
                        <tr key={row.channel} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{row.channel}</td>
                          <td className="px-4 py-3 text-right type-numeric text-muted-foreground">
                            {MetricsEngine.formatCurrency(
                              row.spend,
                              active?.workspace.base_currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                            {MetricsEngine.formatCurrency(
                              row.revenue,
                              active?.workspace.base_currency,
                            )}
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
              <div className="editorial-card p-10 text-center bg-surface/50">
                <Layers className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhuma campanha cadastrada</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Acesse o menu Marketing para gerenciar campanhas e acompanhar o retorno
                  individual de cada anúncio.
                </p>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Campanha</th>
                      <th className="px-4 py-3">Plataforma</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Orçamento Diário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border">
                    {campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {c.platform.replace("_", " ")}
                        </td>
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
              <div className="editorial-card p-10 text-center bg-surface/50">
                <BarChart3 className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhum produto cadastrado</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Cadastre seus produtos em Vendas para acompanhar a margem de contribuição de
                  cada item.
                </p>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3 text-right">Preço de Venda</th>
                      <th className="px-4 py-3 text-right">Custo (CMV)</th>
                      <th className="px-4 py-3 text-right">Margem Unitária</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border">
                    {products.map((p) => {
                      const margin =
                        p.price > 0 ? ((p.price - p.cost_price) / p.price) * 100 : 0;
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
  );
}
