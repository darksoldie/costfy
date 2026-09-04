import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  ordersQuery,
  productsQuery,
  customersQuery,
  trackingSessionsCountQuery,
  type Order,
  type Product,
  type Customer,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";

export interface CreateProductParams {
  title: string;
  sku?: string | null;
  price: number;
  cost_price: number;
  currency?: string;
}

export interface CreateOrderParams {
  orderNumber?: string;
  totalAmount: number;
  paymentGateway: string;
  utmSource: string;
  currency?: string;
}

/**
 * Hook de aplicação e orquestração de dados para Sales (Vendas, Produtos e Clientes).
 * Encapsula consultas ao Supabase, queries canônicas de business-data,
 * agregações de métricas de vendas e mutações com invalidação reativa de cache.
 */
export function useSalesData(workspaceId: string | null, baseCurrency = "BRL") {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: loadingOrders, error: ordersError } = useQuery(
    ordersQuery(workspaceId),
  );
  const { data: products = [], isLoading: loadingProducts, error: productsError } = useQuery(
    productsQuery(workspaceId),
  );
  const { data: customers = [], isLoading: loadingCustomers, error: customersError } = useQuery(
    customersQuery(workspaceId),
  );
  const { data: totalSessions = 0 } = useQuery(
    trackingSessionsCountQuery(workspaceId),
  );

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const salesMetrics = MetricsEngine.calculateSales({
    totalOrders: orders.length,
    paidOrders: orders.filter((o) => o.status === "paid").length,
    totalCustomers: customers.length,
    grossRevenue: totalRevenue,
    totalSessions,
  });

  const createProduct = useMutation({
    mutationFn: async ({
      title,
      sku,
      price,
      cost_price,
      currency = baseCurrency,
    }: CreateProductParams) => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!title.trim()) throw new Error("Informe o nome do produto");

      const { data, error } = await supabase
        .from("products")
        .insert({
          workspace_id: workspaceId,
          title: title.trim(),
          sku: sku?.trim() || null,
          price: price || 0,
          cost_price: cost_price || 0,
          currency,
          status: "active",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products", workspaceId] });
    },
  });

  const createOrder = useMutation({
    mutationFn: async ({
      orderNumber,
      totalAmount,
      paymentGateway,
      utmSource,
      currency = baseCurrency,
    }: CreateOrderParams) => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!totalAmount || totalAmount <= 0) {
        throw new Error("Informe o valor do pedido");
      }

      const { data, error } = await supabase
        .from("orders")
        .insert({
          workspace_id: workspaceId,
          order_number: orderNumber?.trim() || `#${Math.floor(1000 + Math.random() * 9000)}`,
          total_amount: totalAmount,
          total_base_currency: totalAmount,
          currency,
          status: "paid",
          financial_status: "paid",
          payment_gateway: paymentGateway,
          utm_source: utmSource,
          ordered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders", workspaceId] });
    },
  });

  return {
    orders,
    loadingOrders,
    ordersError,
    products,
    loadingProducts,
    productsError,
    customers,
    loadingCustomers,
    customersError,
    totalSessions,
    totalRevenue,
    salesMetrics,
    createProduct,
    createOrder,
  };
}
