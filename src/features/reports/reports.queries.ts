import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

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

export type ReportTimeframe =
  | "today"
  | "yesterday"
  | "7d"
  | "14d"
  | "30d"
  | "this_month"
  | "last_month"
  | "all";

export interface CampaignReportItem {
  id: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpc: number;
  cpa: number;
  roas: number;
  profit: number;
  marginPercent: number;
}

export interface ChannelReportItem {
  channel: string;
  platform: string;
  spend: number;
  revenue: number;
  orders: number;
  cpa: number;
  roas: number;
  profit: number;
  marginPercent: number;
}

export interface ProductReportItem {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  totalRevenue: number;
  averagePrice: number;
  totalCogs: number;
  contributionMargin: number;
  marginPercent: number;
}

export interface DreReportRow {
  key: string;
  label: string;
  value: number;
  percentOfRevenue: number;
  type: "positive" | "negative" | "subtotal" | "result";
}

function getTimeframeBounds(timeframe: ReportTimeframe): { start: number | null; end: number | null } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000 - 1;

  switch (timeframe) {
    case "today":
      return { start: todayStart, end: todayEnd };
    case "yesterday": {
      const yesterdayStart = todayStart - 86400000;
      const yesterdayEnd = todayStart - 1;
      return { start: yesterdayStart, end: yesterdayEnd };
    }
    case "7d":
      return { start: todayStart - 6 * 86400000, end: todayEnd };
    case "14d":
      return { start: todayStart - 13 * 86400000, end: todayEnd };
    case "30d":
      return { start: todayStart - 29 * 86400000, end: todayEnd };
    case "this_month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return { start: monthStart, end: todayEnd };
    }
    case "last_month": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
      return { start: lastMonthStart, end: lastMonthEnd };
    }
    case "all":
    default:
      return { start: null, end: null };
  }
}

export function useReportsData(
  workspaceId: string | null,
  timeframe: ReportTimeframe = "30d",
  filterQuery: string = "",
) {
  const { data: allOrders = [], isLoading: loadingOrders } = useQuery(ordersQuery(workspaceId));
  const { data: allCampaigns = [], isLoading: loadingCampaigns } = useQuery(campaignsQuery(workspaceId));
  const { data: allProducts = [], isLoading: loadingProducts } = useQuery(productsQuery(workspaceId));
  const { data: allFixedCosts = [], isLoading: loadingFixedCosts } = useQuery(fixedCostsQuery(workspaceId));
  const { data: allOrderItems = [], isLoading: loadingOrderItems } = useQuery(orderItemsQuery(workspaceId));
  const { data: allGatewayFees = [], isLoading: loadingGatewayFees } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: allTaxes = [], isLoading: loadingTaxes } = useQuery(taxesQuery(workspaceId));
  const { data: allAdMetrics = [], isLoading: loadingAdMetrics } = useQuery(adMetricsDailyQuery(workspaceId));

  const isLoading =
    loadingOrders ||
    loadingCampaigns ||
    loadingProducts ||
    loadingFixedCosts ||
    loadingOrderItems ||
    loadingGatewayFees ||
    loadingTaxes ||
    loadingAdMetrics;

  const { filteredOrders, filteredAdMetrics } = useMemo(() => {
    const { start, end } = getTimeframeBounds(timeframe);

    const orders = allOrders.filter((o) => {
      if (!start || !end) return true;
      const t = new Date(o.ordered_at).getTime();
      return t >= start && t <= end;
    });

    const metrics = allAdMetrics.filter((m) => {
      if (!start || !end) return true;
      const t = new Date(m.date + "T12:00:00").getTime();
      return t >= start && t <= end;
    });

    return { filteredOrders: orders, filteredAdMetrics: metrics };
  }, [allOrders, allAdMetrics, timeframe]);

  // DRE consolidada real do período
  const dre = useMemo(() => {
    return MetricsEngine.calculateWorkspaceFinancials({
      orders: filteredOrders,
      campaigns: allCampaigns,
      fixedCosts: allFixedCosts,
      orderItems: allOrderItems,
      gatewayFees: allGatewayFees,
      taxes: allTaxes,
      adMetricsDaily: filteredAdMetrics,
    });
  }, [filteredOrders, allCampaigns, allFixedCosts, allOrderItems, allGatewayFees, allTaxes, filteredAdMetrics]);

  // Métricas de tráfego
  const traffic = useMemo(() => {
    const totalImpressions = filteredAdMetrics.reduce((acc, m) => acc + (m.impressions || 0), 0);
    const totalClicks = filteredAdMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);
    return MetricsEngine.calculateTraffic({
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: dre.adSpend,
      conversions: filteredOrders.length,
      revenue: dre.grossRevenue,
    });
  }, [filteredAdMetrics, dre.adSpend, dre.grossRevenue, filteredOrders.length]);

  // Linhas formatadas da DRE
  const dreRows: DreReportRow[] = useMemo(() => {
    const rev = dre.grossRevenue || 0;
    const calcPct = (v: number) => (rev > 0 ? (v / rev) * 100 : 0);

    return [
      {
        key: "gross_revenue",
        label: "(+) Receita Bruta Faturada",
        value: dre.grossRevenue,
        percentOfRevenue: 100,
        type: "positive",
      },
      {
        key: "cogs",
        label: "(−) Custo das Mercadorias Vendidas (CMV)",
        value: dre.cogs,
        percentOfRevenue: calcPct(dre.cogs),
        type: "negative",
      },
      {
        key: "gross_profit",
        label: "(=) Lucro Bruto",
        value: dre.grossRevenue - dre.cogs,
        percentOfRevenue: calcPct(dre.grossRevenue - dre.cogs),
        type: "subtotal",
      },
      {
        key: "gateway_fees",
        label: "(−) Taxas de Intermediação e Gateways",
        value: dre.gatewayFees,
        percentOfRevenue: calcPct(dre.gatewayFees),
        type: "negative",
      },
      {
        key: "taxes",
        label: "(−) Impostos e Encargos Tributários",
        value: dre.taxes,
        percentOfRevenue: calcPct(dre.taxes),
        type: "negative",
      },
      {
        key: "contribution_margin",
        label: "(=) Margem de Contribuição Bruta",
        value: dre.contributionMargin,
        percentOfRevenue: calcPct(dre.contributionMargin),
        type: "subtotal",
      },
      {
        key: "ad_spend",
        label: "(−) Investimento em Mídia Paga (Ads)",
        value: dre.adSpend,
        percentOfRevenue: calcPct(dre.adSpend),
        type: "negative",
      },
      {
        key: "operating_result",
        label: "(=) Resultado Operacional",
        value: dre.contributionMargin - dre.adSpend,
        percentOfRevenue: calcPct(dre.contributionMargin - dre.adSpend),
        type: "subtotal",
      },
      {
        key: "fixed_costs",
        label: "(−) Custos Fixos Operacionais Rateados",
        value: dre.fixedCosts,
        percentOfRevenue: calcPct(dre.fixedCosts),
        type: "negative",
      },
      {
        key: "true_profit",
        label: "(=) LUCRO LÍQUIDO REAL (EBITDA / DE BOLSO)",
        value: dre.trueProfit,
        percentOfRevenue: dre.realMarginPercent,
        type: "result",
      },
    ];
  }, [dre]);

  // Relatório de Campanhas
  const campaignsReport: CampaignReportItem[] = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();

    return allCampaigns
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q))
      .map((c) => {
        const campMetrics = filteredAdMetrics.filter((m) => m.campaign_id === c.id);
        const campSpend = campMetrics.length > 0
          ? campMetrics.reduce((acc, m) => acc + (m.spend || 0), 0)
          : (c.budget || 0);

        // Atribuição de pedidos por utm_campaign
        const campOrders = filteredOrders.filter(
          (o) =>
            o.utm_campaign?.toLowerCase() === c.name.toLowerCase() ||
            o.utm_campaign?.toLowerCase() === c.id.toLowerCase() ||
            (c.platform === "meta_ads" && o.utm_source?.toLowerCase().includes("meta") && allCampaigns.length === 1)
        );

        const campRevenue = campOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
        const conversions = campOrders.length;
        const clicks = campMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);
        const cpc = clicks > 0 ? campSpend / clicks : 0;
        const cpa = conversions > 0 ? campSpend / conversions : 0;
        const roas = campSpend > 0 ? campRevenue / campSpend : 0;
        const profit = campRevenue - campSpend;
        const marginPercent = campRevenue > 0 ? (profit / campRevenue) * 100 : 0;

        return {
          id: c.id,
          name: c.name,
          platform: c.platform,
          status: c.status,
          spend: campSpend,
          revenue: campRevenue,
          conversions,
          cpc,
          cpa,
          roas,
          profit,
          marginPercent,
        };
      });
  }, [allCampaigns, filteredAdMetrics, filteredOrders, filterQuery]);

  // Relatório de Canais de Aquisição
  const channelsReport: ChannelReportItem[] = useMemo(() => {
    const channelMap = new Map<string, { platform: string; spend: number; revenue: number; orders: number }>();

    for (const c of allCampaigns) {
      let channelName = "Meta Ads";
      if (c.platform === "google_ads") channelName = "Google Ads";
      else if (c.platform === "tiktok_ads") channelName = "TikTok Ads";
      else if (c.platform) channelName = c.platform.replace(/_/g, " ").toUpperCase();

      const curr = channelMap.get(channelName) || { platform: c.platform, spend: 0, revenue: 0, orders: 0 };
      const campMetrics = filteredAdMetrics.filter((m) => m.campaign_id === c.id);
      curr.spend += campMetrics.length > 0
        ? campMetrics.reduce((acc, m) => acc + (m.spend || 0), 0)
        : (c.budget || 0);
      channelMap.set(channelName, curr);
    }

    for (const o of filteredOrders) {
      const src = (o.utm_source || "").toLowerCase().trim();
      let ch = "Orgânico / Direto";
      if (src.includes("meta") || src.includes("facebook") || src.includes("instagram") || src.includes("fb") || src.includes("ig")) {
        ch = "Meta Ads";
      } else if (src.includes("google") || src.includes("youtube") || src.includes("adwords")) {
        ch = "Google Ads";
      } else if (src.includes("tiktok")) {
        ch = "TikTok Ads";
      } else if (src.includes("email") || src.includes("newsletter") || src.includes("activecampaign") || src.includes("klaviyo")) {
        ch = "Email Marketing";
      } else if (src) {
        ch = src.charAt(0).toUpperCase() + src.slice(1);
      }

      const curr = channelMap.get(ch) || { platform: ch.toLowerCase(), spend: 0, revenue: 0, orders: 0 };
      curr.revenue += o.total_amount || 0;
      curr.orders += 1;
      channelMap.set(ch, curr);
    }

    const q = filterQuery.toLowerCase().trim();
    return Array.from(channelMap.entries())
      .filter(([name]) => !q || name.toLowerCase().includes(q))
      .map(([name, data]) => {
        const cpa = data.orders > 0 ? data.spend / data.orders : 0;
        const roas = data.spend > 0 ? data.revenue / data.spend : 0;
        const profit = data.revenue - data.spend;
        const marginPercent = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;
        return {
          channel: name,
          platform: data.platform,
          spend: data.spend,
          revenue: data.revenue,
          orders: data.orders,
          cpa,
          roas,
          profit,
          marginPercent,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [allCampaigns, filteredAdMetrics, filteredOrders, filterQuery]);

  // Relatório de Produtos & SKUs
  const productsReport: ProductReportItem[] = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();

    return allProducts
      .filter((p) => !q || p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)))
      .map((p) => {
        // Encontra itens de pedidos relacionados a este produto
        const matchingItems = allOrderItems.filter(
          (item) =>
            item.product_id === p.id &&
            filteredOrders.some((ord) => ord.id === item.order_id)
        );

        const unitsSold = matchingItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const totalRevenue = matchingItems.reduce((acc, item) => acc + (item.total_price || item.unit_price * item.quantity || 0), 0);
        const averagePrice = unitsSold > 0 ? totalRevenue / unitsSold : (p.price || 0);
        const unitCogs = p.cost_price || 0;
        const totalCogs = unitsSold * unitCogs;
        const contributionMargin = totalRevenue - totalCogs;
        const marginPercent = totalRevenue > 0 ? (contributionMargin / totalRevenue) * 100 : 0;

        return {
          id: p.id,
          name: p.title,
          sku: p.sku || "—",
          unitsSold,
          totalRevenue,
          averagePrice,
          totalCogs,
          contributionMargin,
          marginPercent,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [allProducts, allOrderItems, filteredOrders, filterQuery]);

  return {
    isLoading,
    dre,
    traffic,
    dreRows,
    campaignsReport,
    channelsReport,
    productsReport,
    totalOrdersCount: filteredOrders.length,
    totalCampaignsCount: allCampaigns.length,
    totalProductsCount: allProducts.length,
  };
}
