import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// =====================================================================
// TIPOS DE DOMÍNIO CANÔNICOS (BUSINESS DATA ENTITIES)
// =====================================================================

// ---------- MARKETING ----------
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
export type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];
export type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

export type AdSet = Database["public"]["Tables"]["ad_sets"]["Row"];
export type AdSetInsert = Database["public"]["Tables"]["ad_sets"]["Insert"];
export type AdSetUpdate = Database["public"]["Tables"]["ad_sets"]["Update"];

export type Creative = Database["public"]["Tables"]["creatives"]["Row"];
export type CreativeInsert = Database["public"]["Tables"]["creatives"]["Insert"];
export type CreativeUpdate = Database["public"]["Tables"]["creatives"]["Update"];
export type CreativeType = Database["public"]["Enums"]["creative_type"];

export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type AdInsert = Database["public"]["Tables"]["ads"]["Insert"];
export type AdUpdate = Database["public"]["Tables"]["ads"]["Update"];

export type AdMetricsDaily = Database["public"]["Tables"]["ad_metrics_daily"]["Row"];
export type AdMetricsDailyInsert = Database["public"]["Tables"]["ad_metrics_daily"]["Insert"];

// ---------- VENDAS, PRODUTOS E CLIENTES ----------
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type ProductStatus = Database["public"]["Enums"]["product_status"];
export type ProductType = Database["public"]["Enums"]["product_type"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];

export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

// ---------- FINANCEIRO ----------
export type ProductCost = Database["public"]["Tables"]["product_costs"]["Row"];
export type ProductCostInsert = Database["public"]["Tables"]["product_costs"]["Insert"];

export type GatewayFee = Database["public"]["Tables"]["gateway_fees"]["Row"];
export type GatewayFeeInsert = Database["public"]["Tables"]["gateway_fees"]["Insert"];

export type Tax = Database["public"]["Tables"]["taxes"]["Row"];
export type TaxInsert = Database["public"]["Tables"]["taxes"]["Insert"];

export type FixedCost = Database["public"]["Tables"]["fixed_costs"]["Row"];
export type FixedCostInsert = Database["public"]["Tables"]["fixed_costs"]["Insert"];

export type FinancialEntry = Database["public"]["Tables"]["financial_entries"]["Row"];
export type FinancialEntryInsert = Database["public"]["Tables"]["financial_entries"]["Insert"];
export type FinancialEntryType = Database["public"]["Enums"]["financial_entry_type"];

// ---------- TRACKING ----------
export type UtmLink = Database["public"]["Tables"]["utm_links"]["Row"];
export type UtmLinkInsert = Database["public"]["Tables"]["utm_links"]["Insert"];
export type UtmLinkUpdate = Database["public"]["Tables"]["utm_links"]["Update"];

export type TrackingSession = Database["public"]["Tables"]["tracking_sessions"]["Row"];
export type TrackingSessionInsert = Database["public"]["Tables"]["tracking_sessions"]["Insert"];

export type TrackingEvent = Database["public"]["Tables"]["tracking_events"]["Row"];
export type TrackingEventInsert = Database["public"]["Tables"]["tracking_events"]["Insert"];

export type Attribution = Database["public"]["Tables"]["attributions"]["Row"];
export type AttributionInsert = Database["public"]["Tables"]["attributions"]["Insert"];
export type AttributionModel = Database["public"]["Enums"]["attribution_model"];

// =====================================================================
// QUERIES TANSTACK QUERY (VALIDAÇÃO E ACESSO ISOLADO POR WORKSPACE)
// =====================================================================

export const campaignsQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["campaigns", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    queryFn: async (): Promise<Campaign[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const productsQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["products", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    queryFn: async (): Promise<Product[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("title", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const customersQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["customers", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    queryFn: async (): Promise<Customer[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const ordersQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["orders", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
    queryFn: async (): Promise<Order[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("ordered_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const fixedCostsQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["fixed-costs", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
    queryFn: async (): Promise<FixedCost[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const financialEntriesQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["financial-entries", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    queryFn: async (): Promise<FinancialEntry[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("financial_entries")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("entry_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const utmLinksQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["utm-links", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    queryFn: async (): Promise<UtmLink[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("utm_links")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const trackingSessionsQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["tracking-sessions", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
    queryFn: async (): Promise<TrackingSession[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("tracking_sessions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("started_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
