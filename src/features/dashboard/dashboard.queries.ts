import { useState, useMemo } from "react";
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
  type Campaign,
  type Order,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { BrainEngine, type BrainActionProposal } from "@/lib/brain-engine";
import { ActionEngine } from "@/lib/action-engine";

export type DashboardTimeframe = "today" | "yesterday" | "7d" | "14d" | "30d" | "this_month" | "90d";

export interface DailyPoint {
  dateStr: string;
  label: string;
  revenue: number;
  spend: number;
  profit: number;
}

export interface DashboardCampaignItem {
  id: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  ticket: number;
  roas: number;
  profit: number;
  marginPercent: number;
}

export interface DashboardChannelItem {
  channel: string;
  platform: string;
  spend: number;
  revenue: number;
  orders: number;
  cpa: number;
  ticket: number;
  roas: number;
  profit: number;
  marginPercent: number;
}

export interface DashboardProductItem {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
  cogs: number;
  profit: number;
  marginPercent: number;
}

/**
 * Hook de aplicação e data access para o Dashboard Executivo no padrão UTMify.
 * Concentra as queries do TanStack Query, as transformações do MetricsEngine e do BrainEngine,
 * com cálculo real de séries temporais diárias, comparação histórica e agregações granulares.
 */
export function useDashboardData(
  workspaceId: string | null,
  timeframe: DashboardTimeframe = "30d",
) {
  const { data: allOrders = [], isLoading: loadingOrders } = useQuery(ordersQuery(workspaceId));
  const { data: allCampaigns = [], isLoading: loadingCampaigns } = useQuery(campaignsQuery(workspaceId));
  const { data: allProducts = [], isLoading: loadingProducts } = useQuery(productsQuery(workspaceId));
  const { data: allFixedCosts = [], isLoading: loadingFixedCosts } = useQuery(fixedCostsQuery(workspaceId));
  const { data: allOrderItems = [], isLoading: loadingOrderItems } = useQuery(orderItemsQuery(workspaceId));
  const { data: allGatewayFees = [], isLoading: loadingGatewayFees } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: allTaxes = [], isLoading: loadingTaxes } = useQuery(taxesQuery(workspaceId));
  const { data: allAdMetrics = [], isLoading: loadingAdMetrics } = useQuery(adMetricsDailyQuery(workspaceId));

  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});
  const [dismissedActions, setDismissedActions] = useState<Record<string, boolean>>({});

  const isLoadingData =
    loadingOrders ||
    loadingCampaigns ||
    loadingProducts ||
    loadingFixedCosts ||
    loadingOrderItems ||
    loadingGatewayFees ||
    loadingTaxes ||
    loadingAdMetrics;

  // Cálculo de intervalo temporal
  const { currentOrders, previousOrders, currentMetrics, previousMetrics, dailySeries } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000 - 1;

    let daysCount = 30;
    let startTimestamp = todayStart - 29 * 86400000;
    let endTimestamp = todayEnd;
    let prevStartTimestamp = startTimestamp - 30 * 86400000;
    let prevEndTimestamp = startTimestamp - 1;

    if (timeframe === "today") {
      daysCount = 1;
      startTimestamp = todayStart;
      endTimestamp = todayEnd;
      prevStartTimestamp = todayStart - 86400000;
      prevEndTimestamp = todayStart - 1;
    } else if (timeframe === "yesterday") {
      daysCount = 1;
      startTimestamp = todayStart - 86400000;
      endTimestamp = todayStart - 1;
      prevStartTimestamp = todayStart - 2 * 86400000;
      prevEndTimestamp = startTimestamp - 1;
    } else if (timeframe === "7d") {
      daysCount = 7;
      startTimestamp = todayStart - 6 * 86400000;
      endTimestamp = todayEnd;
      prevStartTimestamp = startTimestamp - 7 * 86400000;
      prevEndTimestamp = startTimestamp - 1;
    } else if (timeframe === "14d") {
      daysCount = 14;
      startTimestamp = todayStart - 13 * 86400000;
      endTimestamp = todayEnd;
      prevStartTimestamp = startTimestamp - 14 * 86400000;
      prevEndTimestamp = startTimestamp - 1;
    } else if (timeframe === "this_month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      startTimestamp = monthStart;
      endTimestamp = todayEnd;
      daysCount = Math.max(1, Math.ceil((endTimestamp - startTimestamp) / 86400000));
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
      prevStartTimestamp = prevMonthStart;
      prevEndTimestamp = prevMonthEnd;
    } else if (timeframe === "90d") {
      daysCount = 90;
      startTimestamp = todayStart - 89 * 86400000;
      endTimestamp = todayEnd;
      prevStartTimestamp = startTimestamp - 90 * 86400000;
      prevEndTimestamp = startTimestamp - 1;
    }

    const curOrders = allOrders.filter((o) => {
      const t = new Date(o.ordered_at).getTime();
      return t >= startTimestamp && t <= endTimestamp;
    });

    const prevOrders = allOrders.filter((o) => {
      const t = new Date(o.ordered_at).getTime();
      return t >= prevStartTimestamp && t <= prevEndTimestamp;
    });

    const curMetrics = allAdMetrics.filter((m) => {
      const t = new Date(m.date + "T12:00:00").getTime();
      return t >= startTimestamp && t <= endTimestamp;
    });

    const prevMetrics = allAdMetrics.filter((m) => {
      const t = new Date(m.date + "T12:00:00").getTime();
      return t >= prevStartTimestamp && t <= prevEndTimestamp;
    });

    // Pontos diários da série temporal
    const pointsCount = Math.min(daysCount, 30);
    const stepDays = daysCount <= 30 ? 1 : Math.ceil(daysCount / 30);
    const points: DailyPoint[] = [];

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(endTimestamp - i * stepDays * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const label = `${day}/${month}`;

      const dayOrders = allOrders.filter((o) => o.ordered_at.startsWith(dateStr));
      const dayRev = dayOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

      const dayAd = allAdMetrics.filter((m) => m.date === dateStr);
      const daySpend = dayAd.reduce((acc, m) => acc + (m.spend || 0), 0);
      const dayProfit = dayRev - daySpend;

      points.push({
        dateStr,
        label,
        revenue: dayRev,
        spend: daySpend,
        profit: dayProfit,
      });
    }

    return {
      currentOrders: curOrders,
      previousOrders: prevOrders,
      currentMetrics: curMetrics,
      previousMetrics: prevMetrics,
      dailySeries: points,
    };
  }, [allOrders, allAdMetrics, timeframe]);

  // Se o filtro restrito não tiver pedidos, mas o workspace tiver dados cadastrados, usamos para não mostrar tela vazia
  const orders = currentOrders.length > 0 ? currentOrders : allOrders;
  const adMetrics = currentMetrics.length > 0 ? currentMetrics : allAdMetrics;

  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const prevRevenue = previousOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const revenueGrowth =
    prevRevenue > 0
      ? ((grossRevenue - prevRevenue) / prevRevenue) * 100
      : null;

  const financials = useMemo(() => {
    return MetricsEngine.calculateWorkspaceFinancials({
      orders,
      campaigns: allCampaigns,
      fixedCosts: allFixedCosts,
      orderItems: allOrderItems,
      gatewayFees: allGatewayFees,
      taxes: allTaxes,
      adMetricsDaily: adMetrics,
    });
  }, [orders, allCampaigns, allFixedCosts, allOrderItems, allGatewayFees, allTaxes, adMetrics]);

  const totalImpressions = adMetrics.reduce((acc, m) => acc + (m.impressions || 0), 0);
  const totalClicks = adMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);

  const traffic = useMemo(() => {
    return MetricsEngine.calculateTraffic({
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: financials.adSpend,
      conversions: orders.length,
      revenue: grossRevenue,
    });
  }, [totalImpressions, totalClicks, financials.adSpend, orders.length, grossRevenue]);

  const { insights, proposals, healthScore } = useMemo(() => {
    return BrainEngine.analyzeWorkspace({
      campaigns: allCampaigns,
      products: allProducts,
      orders,
      financials,
      traffic,
    });
  }, [allCampaigns, allProducts, orders, financials, traffic]);

  const hasData = allOrders.length > 0 || allCampaigns.length > 0 || allAdMetrics.length > 0;
  const averageTicket = orders.length > 0 ? grossRevenue / orders.length : 0;

  // Agregação granular de Campanhas no estilo UTMify
  const campaignsPerformance: DashboardCampaignItem[] = useMemo(() => {
    return allCampaigns.map((c) => {
      const campMetrics = adMetrics.filter((m) => m.campaign_id === c.id);
      const spend = campMetrics.length > 0
        ? campMetrics.reduce((acc, m) => acc + (m.spend || 0), 0)
        : (c.budget || 0);

      const campOrders = orders.filter(
        (o) =>
          o.utm_campaign?.toLowerCase() === c.name.toLowerCase() ||
          o.utm_campaign?.toLowerCase() === c.id.toLowerCase() ||
          (c.platform === "meta_ads" && o.utm_source?.toLowerCase().includes("meta") && allCampaigns.length === 1)
      );

      const revenue = campOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
      const conversions = campOrders.length;
      const cpa = conversions > 0 ? spend / conversions : 0;
      const ticket = conversions > 0 ? revenue / conversions : 0;
      const roas = spend > 0 ? revenue / spend : 0;
      const profit = revenue - spend;
      const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        id: c.id,
        name: c.name,
        platform: c.platform,
        status: c.status,
        spend,
        revenue,
        conversions,
        cpa,
        ticket,
        roas,
        profit,
        marginPercent,
      };
    });
  }, [allCampaigns, adMetrics, orders]);

  // Agregação granular de Canais de Aquisição
  const channelsPerformance: DashboardChannelItem[] = useMemo(() => {
    const channelMap = new Map<string, { platform: string; spend: number; revenue: number; orders: number }>();

    for (const c of allCampaigns) {
      let channelName = "Meta Ads";
      if (c.platform === "google_ads") channelName = "Google Ads";
      else if (c.platform === "tiktok_ads") channelName = "TikTok Ads";
      else if (c.platform) channelName = c.platform.replace(/_/g, " ").toUpperCase();

      const curr = channelMap.get(channelName) || { platform: c.platform, spend: 0, revenue: 0, orders: 0 };
      const campMetrics = adMetrics.filter((m) => m.campaign_id === c.id);
      curr.spend += campMetrics.length > 0
        ? campMetrics.reduce((acc, m) => acc + (m.spend || 0), 0)
        : (c.budget || 0);
      channelMap.set(channelName, curr);
    }

    for (const o of orders) {
      const src = (o.utm_source || "").toLowerCase().trim();
      let ch = "Orgânico / Direto";
      if (src.includes("meta") || src.includes("facebook") || src.includes("instagram") || src.includes("fb") || src.includes("ig")) {
        ch = "Meta Ads";
      } else if (src.includes("google") || src.includes("youtube") || src.includes("adwords")) {
        ch = "Google Ads";
      } else if (src.includes("tiktok")) {
        ch = "TikTok Ads";
      } else if (src.includes("email") || src.includes("newsletter") || src.includes("activecampaign")) {
        ch = "Email Marketing";
      } else if (src) {
        ch = src.charAt(0).toUpperCase() + src.slice(1);
      }

      const curr = channelMap.get(ch) || { platform: ch.toLowerCase(), spend: 0, revenue: 0, orders: 0 };
      curr.revenue += o.total_amount || 0;
      curr.orders += 1;
      channelMap.set(ch, curr);
    }

    return Array.from(channelMap.entries()).map(([name, data]) => {
      const cpa = data.orders > 0 ? data.spend / data.orders : 0;
      const ticket = data.orders > 0 ? data.revenue / data.orders : 0;
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
        ticket,
        roas,
        profit,
        marginPercent,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [allCampaigns, adMetrics, orders]);

  // Agregação granular de Produtos & SKUs
  const productsPerformance: DashboardProductItem[] = useMemo(() => {
    return allProducts.map((p) => {
      const matchingItems = allOrderItems.filter(
        (item) => item.product_id === p.id && orders.some((ord) => ord.id === item.order_id)
      );

      const unitsSold = matchingItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const revenue = matchingItems.reduce((acc, item) => acc + (item.total_price || item.unit_price * item.quantity || 0), 0);
      const averagePrice = unitsSold > 0 ? revenue / unitsSold : (p.price || 0);
      const totalCogs = unitsSold * (p.cost_price || 0);
      const profit = revenue - totalCogs;
      const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        id: p.id,
        name: p.title || "—",
        sku: p.sku || "—",
        unitsSold,
        revenue,
        averagePrice,
        cogs: totalCogs,
        profit,
        marginPercent,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [allProducts, allOrderItems, orders]);

  async function handleApproveProposal(proposal: BrainActionProposal) {
    if (!workspaceId) return;
    try {
      const res = await ActionEngine.executeApprovedAction({
        workspaceId,
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

  return {
    orders,
    allOrders,
    campaigns: allCampaigns,
    products: allProducts,
    financials,
    traffic,
    insights,
    proposals,
    visibleProposals,
    healthScore,
    hasData,
    grossRevenue,
    averageTicket,
    revenueGrowth,
    dailySeries,
    campaignsPerformance,
    channelsPerformance,
    productsPerformance,
    isLoadingData,
    executedActions,
    handleApproveProposal,
    handleDismissProposal,
  };
}

export type DashboardData = ReturnType<typeof useDashboardData>;
