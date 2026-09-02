import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Layers,
  LineChart,
  Plug,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { CostfyMark } from "@/components/brand/costfy-mark";
import {
  ordersQuery,
  campaignsQuery,
  productsQuery,
  fixedCostsQuery,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { BrainEngine } from "@/lib/brain-engine";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Costfy" },
      {
        name: "description",
        content:
          "Centro de comando operacional: receita, investimento, lucro real, tráfego, vendas e inteligência.",
      },
      { property: "og:title", content: "Visão geral — Costfy" },
      { property: "og:description", content: "O Intelligent Operating System do seu negócio digital." },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <DashboardPage />
    </WorkspaceProvider>
  ),
});

function DashboardPage() {
  const { active, loading, error } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [] } = useQuery(productsQuery(workspaceId));
  const { data: fixedCosts = [] } = useQuery(fixedCostsQuery(workspaceId));

  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalFixed = fixedCosts.reduce((acc, fc) => acc + (fc.amount || 0), 0);

  const financials = MetricsEngine.calculateFinancials({
    grossRevenue,
    cogs: orders.length * 25,
    gatewayFees: grossRevenue * 0.0399,
    taxes: grossRevenue * 0.06,
    adSpend: totalSpend,
    fixedCosts: totalFixed,
  });

  const traffic = MetricsEngine.calculateTraffic({
    impressions: 0,
    clicks: 0,
    spend: totalSpend,
    conversions: orders.length,
    revenue: grossRevenue,
  });

  const { insights, proposals, healthScore } = BrainEngine.analyzeWorkspace({
    campaigns,
    products,
    orders,
    financials,
    traffic,
  });

  const hasData = orders.length > 0 || campaigns.length > 0;

  return (
    <AppShell
      title={active ? active.workspace.name : "Visão geral"}
      description="Intelligent Operating System: dados unificados de marketing, vendas e financeiro em tempo real."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/marketing" className={buttonClass("outline", "sm")}>
            Campanhas
          </Link>
          <Link to="/integrations" className={buttonClass("primary", "sm")}>
            Conectar dados
          </Link>
        </div>
      }
    >
      {error && (
        <p role="alert" className="type-body-sm text-destructive">
          Não foi possível carregar o workspace: {error.message}
        </p>
      )}

      {!loading && !active && <EmptyWorkspaceState />}

      {active && (
        <div className="space-y-6">
          {/* KPI Summary Grid — Financeiro & Negócio */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Receita Bruta */}
            <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
              <div className="flex items-center justify-between">
                <p className="type-caption text-muted-foreground">Receita Bruta</p>
                <DollarSign className="size-4 text-muted-foreground" />
              </div>
              <p className="type-numeric mt-2 text-2xl font-bold text-foreground">
                {hasData ? MetricsEngine.formatCurrency(financials.grossRevenue, active.workspace.base_currency) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-subtle-foreground">
                {orders.length > 0 ? `${orders.length} pedidos realizados` : "Aguardando pedidos de vendas"}
              </p>
            </div>

            {/* Investimento em Mídia */}
            <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
              <div className="flex items-center justify-between">
                <p className="type-caption text-muted-foreground">Investimento em Mídia</p>
                <LineChart className="size-4 text-muted-foreground" />
              </div>
              <p className="type-numeric mt-2 text-2xl font-bold text-foreground">
                {hasData ? MetricsEngine.formatCurrency(financials.adSpend, active.workspace.base_currency) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-subtle-foreground">
                {campaigns.length > 0 ? `${campaigns.length} campanhas ativas` : "Aguardando contas de anúncios"}
              </p>
            </div>

            {/* Lucro Líquido Real */}
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                hasData
                  ? financials.trueProfit >= 0
                    ? "border-success/30 bg-success/[0.03]"
                    : "border-destructive/30 bg-destructive/[0.03]"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="type-caption text-muted-foreground">Lucro Líquido Real</p>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              <p
                className={cn(
                  "type-numeric mt-2 text-2xl font-bold",
                  hasData
                    ? financials.trueProfit >= 0
                      ? "text-success"
                      : "text-destructive"
                    : "text-foreground",
                )}
              >
                {hasData ? MetricsEngine.formatCurrency(financials.trueProfit, active.workspace.base_currency) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-subtle-foreground">
                {hasData ? `Margem Real: ${MetricsEngine.formatPercent(financials.realMarginPercent)}` : "Receita − CMV − taxas − mídia − fixos"}
              </p>
            </div>

            {/* ROAS Global */}
            <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
              <div className="flex items-center justify-between">
                <p className="type-caption text-muted-foreground">ROAS Global</p>
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <p className="type-numeric mt-2 text-2xl font-bold text-foreground">
                {traffic.roas > 0 ? `${traffic.roas.toFixed(2)}x` : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-subtle-foreground">
                {traffic.roas > 0 ? "Retorno s/ gasto em mídia" : "Sem tráfego registrado"}
              </p>
            </div>
          </div>

          {/* Seção Central: Costfy Brain + Operações */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Bloco Costfy Brain (7 colunas) */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CostfyMark size={22} className="text-accent" />
                    <div>
                      <h3 className="text-[14.5px] font-semibold text-foreground">Costfy Brain</h3>
                      <p className="text-[11.5px] text-muted-foreground">Diagnóstico operacional contínuo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-[11px] font-semibold">
                      Health Score: {healthScore}/100
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {insights.slice(0, 2).map((ins) => (
                    <div
                      key={ins.id}
                      className="rounded-lg border border-border bg-surface p-3 text-[13px] space-y-1"
                    >
                      <p className="font-medium text-foreground">{ins.title}</p>
                      <p className="text-[12px] text-muted-foreground">{ins.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-[12px] text-subtle-foreground">
                  Abra o Quick Brain a qualquer momento pressionando <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">⌘B</kbd>
                </span>
                <Link to="/brain" className={buttonClass("secondary", "sm", "gap-1")}>
                  Abrir Brain Hub <ArrowRight className="size-3" />
                </Link>
              </div>
            </section>

            {/* Bloco Ações e Acessos Rápidos (5 colunas) */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-span-5 space-y-4">
              <h3 className="text-[14.5px] font-semibold text-foreground">Operação do Negócio</h3>

              <div className="space-y-2 text-[13px]">
                <Link
                  to="/marketing"
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LineChart className="size-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Mídia & Campanhas</p>
                      <p className="text-[11px] text-muted-foreground">{campaigns.length} campanhas cadastradas</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>

                <Link
                  to="/sales"
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Boxes className="size-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Vendas & Produtos</p>
                      <p className="text-[11px] text-muted-foreground">{products.length} produtos / {orders.length} pedidos</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>

                <Link
                  to="/finance"
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="size-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Financeiro & DRE Real</p>
                      <p className="text-[11px] text-muted-foreground">Cálculo de margem limpa</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>

                <Link
                  to="/tracking"
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="size-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Tracking & Gerador de UTMs</p>
                      <p className="text-[11px] text-muted-foreground">Links rastreados padronizados</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function EmptyWorkspaceState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center bg-surface">
      <h2 className="type-h3 text-foreground">Crie seu primeiro workspace</h2>
      <p className="type-body-sm mx-auto mt-2 max-w-md text-muted-foreground">
        Um workspace concentra integrações, times e histórico de um negócio digital.
      </p>
      <Link to="/onboarding" className={buttonClass("primary", "md", "mt-5")}>
        Criar workspace
      </Link>
    </div>
  );
}
