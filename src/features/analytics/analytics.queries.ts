import { useQuery } from "@tanstack/react-query";

import {
  ordersQuery,
  campaignsQuery,
  productsQuery,
  orderItemsQuery,
  gatewayFeesQuery,
  taxesQuery,
  adMetricsDailyQuery,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";

export type AnalyticsPeriod = "7d" | "14d" | "30d" | "all";

export interface ChannelAnalytics {
  channel: string;
  spend: number;
  revenue: number;
  orders: number;
}

/**
 * Hook de aplicação e orquestração de dados para a feature Analytics.
 * Centraliza o consumo de queries canônicas, a filtragem temporal de pedidos,
 * o cálculo de métricas de domínio via MetricsEngine e o agrupamento por canal.
 */
export function useAnalyticsData(
  workspaceId: string | null,
  period: AnalyticsPeriod = "30d",
) {
  const { data: allOrders = [], isLoading: loadingOrders } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [], isLoading: loadingProducts } = useQuery(productsQuery(workspaceId));
  const { data: orderItems = [], isLoading: loadingOrderItems } = useQuery(orderItemsQuery(workspaceId));
  const { data: gatewayFees = [], isLoading: loadingGatewayFees } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: taxes = [], isLoading: loadingTaxes } = useQuery(taxesQuery(workspaceId));
  const { data: adMetrics = [], isLoading: loadingAdMetrics } = useQuery(adMetricsDailyQuery(workspaceId));

  const isLoading =
    loadingOrders ||
    loadingCampaigns ||
    loadingProducts ||
    loadingOrderItems ||
    loadingGatewayFees ||
    loadingTaxes ||
    loadingAdMetrics;

  // Filtro temporal real sobre pedidos
  const now = new Date().getTime();
  const periodDays =
    period === "7d" ? 7 : period === "14d" ? 14 : period === "30d" ? 30 : null;

  const orders = periodDays
    ? allOrders.filter((o) => {
        const orderTime = new Date(o.ordered_at).getTime();
        return now - orderTime <= periodDays * 86400000;
      })
    : allOrders;

  // Cálculos consolidados reais via MetricsEngine
  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const financials = MetricsEngine.calculateWorkspaceFinancials({
    orders,
    campaigns,
    fixedCosts: [],
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

  // Agrupamento por Canal / Plataforma a partir de campanhas e UTMs dos pedidos
  const channelMap = new Map<string, ChannelAnalytics>();

  for (const c of campaigns) {
    const platformName =
      c.platform === "meta_ads"
        ? "Meta Ads"
        : c.platform === "google_ads"
          ? "Google Ads"
          : c.platform === "tiktok_ads"
            ? "TikTok Ads"
            : c.platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const curr = channelMap.get(platformName) || {
      channel: platformName,
      spend: 0,
      revenue: 0,
      orders: 0,
    };
    curr.spend += c.budget || 0;
    channelMap.set(platformName, curr);
  }

  for (const o of orders) {
    const rawSource = (o.utm_source || "").toLowerCase().trim();
    let channelName = "Orgânico / Direto";
    if (
      rawSource.includes("meta") ||
      rawSource.includes("facebook") ||
      rawSource.includes("fb") ||
      rawSource.includes("instagram") ||
      rawSource.includes("ig")
    ) {
      channelName = "Meta Ads";
    } else if (
      rawSource.includes("google") ||
      rawSource.includes("youtube") ||
      rawSource.includes("adwords")
    ) {
      channelName = "Google Ads";
    } else if (rawSource.includes("tiktok")) {
      channelName = "TikTok Ads";
    } else if (rawSource.includes("email") || rawSource.includes("newsletter")) {
      channelName = "Email Marketing";
    } else if (rawSource) {
      channelName = rawSource.charAt(0).toUpperCase() + rawSource.slice(1);
    }

    const curr = channelMap.get(channelName) || {
      channel: channelName,
      spend: 0,
      revenue: 0,
      orders: 0,
    };
    curr.revenue += o.total_amount || 0;
    curr.orders += 1;
    channelMap.set(channelName, curr);
  }

  const byChannel = Array.from(channelMap.values()).filter(
    (c) => c.revenue > 0 || c.spend > 0,
  );

  return {
    orders,
    campaigns,
    products,
    financials,
    traffic,
    byChannel,
    isLoading,
  };
}
