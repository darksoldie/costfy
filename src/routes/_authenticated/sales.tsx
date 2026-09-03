import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  Plus,
  Search,
  ShoppingCart,
  Users,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
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
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Vendas, Produtos & Clientes — Costfy" },
      {
        name: "description",
        content:
          "Acompanhe pedidos, produtos e clientes com ticket médio, LTV e status de pagamento.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <SalesPage />
    </WorkspaceProvider>
  ),
});

function SalesPage() {
  const { active } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [], isLoading: loadingOrders } = useQuery(ordersQuery(workspaceId));
  const { data: products = [], isLoading: loadingProducts } = useQuery(productsQuery(workspaceId));
  const { data: customers = [], isLoading: loadingCustomers } = useQuery(
    customersQuery(workspaceId),
  );
  const { data: totalSessions = 0 } = useQuery(trackingSessionsCountQuery(workspaceId));

  const [tab, setTab] = useState<"orders" | "products" | "customers">("orders");
  const [search, setSearch] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Form states para produto
  const [prodTitle, setProdTitle] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCost, setProdCost] = useState("");

  // Form states para pedido manual
  const [orderNumber, setOrderNumber] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("stripe");
  const [utmSource, setUtmSource] = useState("meta_ads");

  const createProduct = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!prodTitle.trim()) throw new Error("Informe o nome do produto");

      const { data, error } = await supabase
        .from("products")
        .insert({
          workspace_id: workspaceId,
          title: prodTitle.trim(),
          sku: prodSku.trim() || null,
          price: prodPrice ? parseFloat(prodPrice) : 0,
          cost_price: prodCost ? parseFloat(prodCost) : 0,
          currency: active?.workspace.base_currency || "BRL",
          status: "active",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products", workspaceId] });
      setProductModalOpen(false);
      setProdTitle("");
      setProdSku("");
      setProdPrice("");
      setProdCost("");
    },
  });

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!orderAmount || parseFloat(orderAmount) <= 0)
        throw new Error("Informe o valor do pedido");

      const amount = parseFloat(orderAmount);
      const { data, error } = await supabase
        .from("orders")
        .insert({
          workspace_id: workspaceId,
          order_number: orderNumber.trim() || `#${Math.floor(1000 + Math.random() * 9000)}`,
          total_amount: amount,
          total_base_currency: amount,
          currency: active?.workspace.base_currency || "BRL",
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
      setOrderModalOpen(false);
      setOrderNumber("");
      setOrderAmount("");
    },
  });

  // Métricas de Vendas calculadas pelo MetricsEngine
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const salesMetrics = MetricsEngine.calculateSales({
    totalOrders: orders.length,
    paidOrders: orders.filter((o) => o.status === "paid").length,
    totalCustomers: customers.length,
    grossRevenue: totalRevenue,
    totalSessions,
  });

  return (
    <AppShell
      title="Vendas"
      description="Conecte seu gateway, checkout ou e-commerce para ver pedidos, produtos e receita real."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/integrations" className={buttonClass("outline", "sm")}>
            Conectar Vendas
          </Link>
          <button
            type="button"
            onClick={() =>
              tab === "products" ? setProductModalOpen(true) : setOrderModalOpen(true)
            }
            className={buttonClass("primary", "sm", "gap-1.5")}
          >
            <Plus className="size-3.5" />
            {tab === "products" ? "Novo produto" : "Lançar pedido"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Bar — Editorial Terminal Strip */}
        <div className="editorial-card overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-5">
            <div className="p-4">
              <span className="type-label-subtle">Receita Bruta</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {MetricsEngine.formatCurrency(totalRevenue, active?.workspace.base_currency)}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">pedidos realizados</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">Total de Pedidos</span>
              <p className="type-metric-hero mt-1.5 text-foreground">{salesMetrics.totalOrders}</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                {salesMetrics.paidOrders} pagos
              </p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">Ticket Médio</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {MetricsEngine.formatCurrency(
                  salesMetrics.averageTicket,
                  active?.workspace.base_currency,
                )}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">por pedido pago</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">Clientes Cadastrados</span>
              <p className="type-metric-hero mt-1.5 text-foreground">{customers.length}</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">base única</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">Produtos Cadastrados</span>
              <p className="type-metric-hero mt-1.5 text-foreground">{products.length}</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                {products.filter((p) => p.status === "active").length} ativos
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1 border-b border-border pb-1">
          {(
            [
              { key: "orders", label: `Pedidos (${orders.length})` },
              { key: "products", label: `Produtos (${products.length})` },
              { key: "customers", label: `Clientes (${customers.length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                tab === item.key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tabela de Pedidos */}
        {tab === "orders" && (
          <div>
            {loadingOrders ? (
              <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <ShoppingCart className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhum pedido registrado</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Conecte sua plataforma de vendas (Shopify, Hotmart, Kiwify, Stripe, etc.) ou
                  registre pedidos manualmente.
                </p>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(true)}
                  className={buttonClass("primary", "sm", "mt-4")}
                >
                  Registrar pedido
                </button>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Pedido</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Gateway</th>
                      <th className="px-4 py-3">Origem (UTM)</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {ord.order_number || ord.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                              ord.status === "paid"
                                ? "bg-success/10 text-success border border-success/30"
                                : "bg-warning/10 text-warning border border-warning/30",
                            )}
                          >
                            {ord.status === "paid" ? "Pago" : ord.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {ord.payment_gateway || "Direto"}
                        </td>
                        <td className="px-4 py-3 text-subtle-foreground font-mono text-[12px]">
                          {ord.utm_source || "Orgânico / Direto"}
                        </td>
                        <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                          {MetricsEngine.formatCurrency(ord.total_amount, ord.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {new Date(ord.ordered_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tabela de Produtos */}
        {tab === "products" && (
          <div>
            {loadingProducts ? (
              <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <Boxes className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhum produto cadastrado</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Cadastre seus produtos com preço de venda e custo unitário para permitir o cálculo
                  de Margem Real e Lucro Líquido.
                </p>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(true)}
                  className={buttonClass("primary", "sm", "mt-4")}
                >
                  Cadastrar produto
                </button>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Preço de Venda</th>
                      <th className="px-4 py-3 text-right">Custo Unitário (CMV)</th>
                      <th className="px-4 py-3 text-right">Margem Bruta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((prod) => {
                      const margin =
                        prod.price > 0 ? ((prod.price - prod.cost_price) / prod.price) * 100 : 0;
                      return (
                        <tr key={prod.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{prod.title}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-[12px]">
                            {prod.sku || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success border border-success/30">
                              Ativo
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                            {MetricsEngine.formatCurrency(prod.price, prod.currency)}
                          </td>
                          <td className="px-4 py-3 text-right type-numeric text-muted-foreground">
                            {MetricsEngine.formatCurrency(prod.cost_price, prod.currency)}
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

        {/* Tabela de Clientes */}
        {tab === "customers" && (
          <div>
            {loadingCustomers ? (
              <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <Users className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhum cliente registrado</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Os clientes são criados e atualizados automaticamente conforme as vendas são
                  integradas ou registradas.
                </p>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">E-mail</th>
                      <th className="px-4 py-3">Cidade / Estado</th>
                      <th className="px-4 py-3 text-right">Pedidos</th>
                      <th className="px-4 py-3 text-right">Total Gasto (LTV)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {cust.first_name
                            ? `${cust.first_name} ${cust.last_name || ""}`
                            : "Cliente"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{cust.email || "—"}</td>
                        <td className="px-4 py-3 text-subtle-foreground">
                          {cust.city ? `${cust.city}, ${cust.state || cust.country}` : cust.country}
                        </td>
                        <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                          {cust.total_orders}
                        </td>
                        <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                          {MetricsEngine.formatCurrency(cust.total_spent, cust.currency)}
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

      {/* Modal Criar Produto */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setProductModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-h3 text-foreground">Novo Produto</h2>
            <p className="type-body-sm mt-1 text-muted-foreground">
              Cadastre o produto com preço e custo para habilitar o cálculo de Lucro Real.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProduct.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Título do produto
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Ex.: Curso de Tráfego Pago / Camiseta Oversized"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  SKU / Código (opcional)
                </label>
                <input
                  type="text"
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  placeholder="Ex.: PROD-001"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="Ex.: 197.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Custo Unitário / CMV (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodCost}
                    onChange={(e) => setProdCost(e.target.value)}
                    placeholder="Ex.: 35.00"
                    className={inputClass}
                  />
                </div>
              </div>

              {createProduct.error instanceof Error && (
                <p className="text-[12px] text-destructive">{createProduct.error.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className={buttonClass("outline", "md")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createProduct.isPending}
                  className={buttonClass("primary", "md")}
                >
                  {createProduct.isPending ? "Salvando…" : "Salvar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançar Pedido */}
      {orderModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setOrderModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-h3 text-foreground">Lançar Pedido</h2>
            <p className="type-body-sm mt-1 text-muted-foreground">
              Cadastre um pedido manual para contabilizar na receita e DRE.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrder.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Número do Pedido
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ex.: #1024"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder="Ex.: 297.00"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Gateway / Checkout
                  </label>
                  <select
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className={inputClass}
                  >
                    <option value="stripe">Stripe</option>
                    <option value="hotmart">Hotmart</option>
                    <option value="kiwify">Kiwify</option>
                    <option value="eduzz">Eduzz</option>
                    <option value="mercado_pago">Mercado Pago</option>
                    <option value="shopify">Shopify</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Origem UTM
                  </label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="Ex.: meta_ads"
                    className={inputClass}
                  />
                </div>
              </div>

              {createOrder.error instanceof Error && (
                <p className="text-[12px] text-destructive">{createOrder.error.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className={buttonClass("outline", "md")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className={buttonClass("primary", "md")}
                >
                  {createOrder.isPending ? "Lançando…" : "Registrar pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
