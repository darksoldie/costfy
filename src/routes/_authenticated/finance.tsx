import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Plus,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Receipt,
  Percent,
  Calculator,
  Layers,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { supabase } from "@/integrations/supabase/client";
import {
  ordersQuery,
  campaignsQuery,
  productsQuery,
  fixedCostsQuery,
  financialEntriesQuery,
  orderItemsQuery,
  gatewayFeesQuery,
  taxesQuery,
  adMetricsDailyQuery,
  type FixedCost,
  type FinancialEntry,
} from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Financeiro & DRE Gerencial — Costfy" },
      {
        name: "description",
        content:
          "DRE em cascata: Receita Líquida − CMV − Taxas − Impostos − Tráfego − Custos Fixos = Lucro Real.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <FinancePage />
    </WorkspaceProvider>
  ),
});

function FinancePage() {
  const { active } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [] } = useQuery(productsQuery(workspaceId));
  const { data: fixedCosts = [] } = useQuery(fixedCostsQuery(workspaceId));
  const { data: entries = [] } = useQuery(financialEntriesQuery(workspaceId));
  const { data: orderItems = [] } = useQuery(orderItemsQuery(workspaceId));
  const { data: gatewayFees = [] } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: taxes = [] } = useQuery(taxesQuery(workspaceId));
  const { data: adMetrics = [] } = useQuery(adMetricsDailyQuery(workspaceId));

  const [tab, setTab] = useState<"dre" | "fixed_costs" | "entries">("dre");
  const [fixedCostModalOpen, setFixedCostModalOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);

  // Form de Custo Fixo
  const [costName, setCostName] = useState("");
  const [costCategory, setCostCategory] = useState("software");
  const [costAmount, setCostAmount] = useState("");

  // Form de Lançamento Avulso
  const [entryDesc, setEntryDesc] = useState("");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryType, setEntryType] = useState<FinancialEntry["type"]>("expense");
  const [entryCategory, setEntryCategory] = useState("operational");

  const createFixedCost = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!costName.trim()) throw new Error("Informe o nome do custo");
      if (!costAmount || parseFloat(costAmount) <= 0) throw new Error("Informe o valor");

      const { data, error } = await supabase
        .from("fixed_costs")
        .insert({
          workspace_id: workspaceId,
          name: costName.trim(),
          category: costCategory,
          amount: parseFloat(costAmount),
          currency: active?.workspace.base_currency || "BRL",
          start_date: new Date().toISOString().slice(0, 10),
          active: true,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fixed-costs", workspaceId] });
      setFixedCostModalOpen(false);
      setCostName("");
      setCostAmount("");
    },
  });

  const createEntry = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!entryDesc.trim()) throw new Error("Informe a descrição");
      if (!entryAmount || parseFloat(entryAmount) <= 0) throw new Error("Informe o valor");

      const amount = parseFloat(entryAmount);
      const { data, error } = await supabase
        .from("financial_entries")
        .insert({
          workspace_id: workspaceId,
          description: entryDesc.trim(),
          type: entryType,
          category: entryCategory,
          amount,
          amount_base_currency: amount,
          currency: active?.workspace.base_currency || "BRL",
          entry_date: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["financial-entries", workspaceId] });
      setEntryModalOpen(false);
      setEntryDesc("");
      setEntryAmount("");
    },
  });

  // Cálculo canônico e verídico da DRE a partir dos dados do workspace
  const dre = MetricsEngine.calculateWorkspaceFinancials({
    orders,
    campaigns,
    fixedCosts,
    orderItems,
    gatewayFees,
    taxes,
    adMetricsDaily: adMetrics,
  });

  return (
    <AppShell
      title="Financeiro"
      description="DRE Gerencial em cascata: Lucro Líquido Real e Margem Real calculados com todas as despesas da operação."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEntryModalOpen(true)}
            className={buttonClass("outline", "sm")}
          >
            Lançamento avulso
          </button>
          <button
            type="button"
            onClick={() => setFixedCostModalOpen(true)}
            className={buttonClass("primary", "sm", "gap-1.5")}
          >
            <Plus className="size-3.5" />
            Novo custo fixo
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Executive Overview Strip */}
        <div className="editorial-card overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            <div className="p-4 sm:p-5">
              <span className="type-label-subtle">Receita Bruta</span>
              <p className="type-metric-hero mt-2 text-foreground">
                {MetricsEngine.formatCurrency(dre.grossRevenue, active?.workspace.base_currency)}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                total bruto transacionado
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <span className="type-label-subtle">Investimento em Mídia</span>
              <p className="type-metric-hero mt-2 text-foreground">
                {MetricsEngine.formatCurrency(dre.adSpend, active?.workspace.base_currency)}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                gasto consolidado em anúncios
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <span className="type-label-subtle">Lucro Líquido Real</span>
              <p
                className={cn(
                  "type-metric-hero mt-2",
                  dre.trueProfit >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {MetricsEngine.formatCurrency(dre.trueProfit, active?.workspace.base_currency)}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                após CMV, taxas, mídia e fixos
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <span className="type-label-subtle">Margem Real Líquida</span>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="type-metric-hero text-foreground">
                  {MetricsEngine.formatPercent(dre.realMarginPercent)}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums border",
                    dre.realMarginPercent >= 20
                      ? "bg-success/10 text-success border-success/25"
                      : dre.realMarginPercent >= 0
                        ? "bg-warning/10 text-warning border-warning/25"
                        : "bg-destructive/10 text-destructive border-destructive/25",
                  )}
                >
                  {dre.realMarginPercent >= 0 ? "+" : ""}
                  {dre.realMarginPercent.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                lucro real / faturamento bruto
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1 border-b border-border pb-1">
          {(
            [
              { key: "dre", label: "DRE Gerencial Completa" },
              { key: "fixed_costs", label: `Custos Fixos (${fixedCosts.length})` },
              { key: "entries", label: `Lançamentos de Caixa (${entries.length})` },
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

        {/* DRE Gerencial Completa */}
        {tab === "dre" && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border bg-surface px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">
                  Demonstrativo de Resultado (DRE)
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  Detalhamento linha a linha da formação do lucro
                </p>
              </div>
              <span className="rounded-md bg-secondary border border-border px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                Moeda Base: {active?.workspace.base_currency || "BRL"}
              </span>
            </div>

            <div className="divide-y divide-border text-[13.5px]">
              {/* 1. Receita Bruta */}
              <div className="flex items-center justify-between px-5 py-3 bg-card font-medium text-foreground">
                <span className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded bg-primary/10 text-primary text-[11px] font-bold">
                    1
                  </span>
                  (+) Receita Bruta de Vendas
                </span>
                <span className="type-numeric font-semibold">
                  {MetricsEngine.formatCurrency(dre.grossRevenue, active?.workspace.base_currency)}
                </span>
              </div>

              {/* 2. Deduções */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-surface/50 text-muted-foreground pl-10 text-[13px]">
                <span>(−) Reembolsos, Estornos e Descontos</span>
                <span className="type-numeric">
                  {MetricsEngine.formatCurrency(
                    dre.refundsAndDiscounts,
                    active?.workspace.base_currency,
                  )}
                </span>
              </div>

              {/* 3. Receita Líquida */}
              <div className="flex items-center justify-between px-5 py-3 bg-secondary/40 font-semibold text-foreground">
                <span>(=) Receita Líquida Operacional</span>
                <span className="type-numeric">
                  {MetricsEngine.formatCurrency(dre.netRevenue, active?.workspace.base_currency)}
                </span>
              </div>

              {/* 4. Custos Variáveis */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-surface/50 text-muted-foreground pl-10 text-[13px]">
                <span className="flex items-center gap-1.5">
                  (−) CMV / Custo de Mercadorias e Produtos
                  {!dre.hasConfiguredCogs && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground border border-border">
                      Não cadastrado
                    </span>
                  )}
                </span>
                <span className="type-numeric text-destructive">
                  {MetricsEngine.formatCurrency(dre.cogs, active?.workspace.base_currency)}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-2.5 bg-surface/50 text-muted-foreground pl-10 text-[13px]">
                <span className="flex items-center gap-1.5">
                  (−) Taxas de Gateway e Processadores de Pagamento
                  {!dre.hasConfiguredGatewayFees && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground border border-border">
                      Sem taxas cadastradas
                    </span>
                  )}
                </span>
                <span className="type-numeric text-destructive">
                  {MetricsEngine.formatCurrency(dre.gatewayFees, active?.workspace.base_currency)}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-2.5 bg-surface/50 text-muted-foreground pl-10 text-[13px]">
                <span className="flex items-center gap-1.5">
                  (−) Impostos e Tributos sobre Faturamento
                  {!dre.hasConfiguredTaxes && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground border border-border">
                      Sem alíquota cadastrada
                    </span>
                  )}
                </span>
                <span className="type-numeric text-destructive">
                  {MetricsEngine.formatCurrency(dre.taxes, active?.workspace.base_currency)}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-2.5 bg-surface/50 text-muted-foreground pl-10 text-[13px]">
                <span>(−) Investimento em Mídia Paga (Meta, Google, TikTok Ads)</span>
                <span className="type-numeric text-destructive">
                  {MetricsEngine.formatCurrency(dre.adSpend, active?.workspace.base_currency)}
                </span>
              </div>

              {/* 5. Margem de Contribuição */}
              <div className="flex items-center justify-between px-5 py-3 bg-secondary/40 font-semibold text-foreground">
                <span>(=) Margem de Contribuição</span>
                <div className="text-right">
                  <span className="type-numeric">
                    {MetricsEngine.formatCurrency(
                      dre.contributionMargin,
                      active?.workspace.base_currency,
                    )}
                  </span>
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    ({MetricsEngine.formatPercent(dre.contributionMarginPercent)})
                  </span>
                </div>
              </div>

              {/* 6. Custos Fixos */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-surface/50 text-muted-foreground pl-10 text-[13px]">
                <span>(−) Custos Fixos Operacionais (Equipe, Softwares, Infraestrutura)</span>
                <span className="type-numeric text-destructive">
                  {MetricsEngine.formatCurrency(dre.fixedCosts, active?.workspace.base_currency)}
                </span>
              </div>

              {/* 7. Lucro Líquido Real */}
              <div
                className={cn(
                  "flex items-center justify-between px-5 py-4 font-bold text-[15px]",
                  dre.trueProfit >= 0
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                <span>(=) LUCRO LÍQUIDO REAL</span>
                <div className="text-right">
                  <span className="type-numeric text-lg">
                    {MetricsEngine.formatCurrency(dre.trueProfit, active?.workspace.base_currency)}
                  </span>
                  <span className="ml-2 text-[12px] opacity-80">
                    (Margem Real: {MetricsEngine.formatPercent(dre.realMarginPercent)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custos Fixos */}
        {tab === "fixed_costs" && (
          <div>
            {fixedCosts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <Receipt className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhum custo fixo cadastrado</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Cadastre ferramentas de SaaS, hospedagem, equipe e aluguel para abater
                  automaticamente no cálculo do Lucro Real.
                </p>
                <button
                  type="button"
                  onClick={() => setFixedCostModalOpen(true)}
                  className={buttonClass("primary", "sm", "mt-4")}
                >
                  Cadastrar custo fixo
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Periodicidade</th>
                      <th className="px-4 py-3 text-right">Valor Mensal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fixedCosts.map((fc) => (
                      <tr key={fc.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{fc.name}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {fc.category}
                        </td>
                        <td className="px-4 py-3 text-subtle-foreground">Mensal</td>
                        <td className="px-4 py-3 text-right type-numeric font-medium text-destructive">
                          {MetricsEngine.formatCurrency(fc.amount, fc.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Lançamentos Avulsos */}
        {tab === "entries" && (
          <div>
            {entries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <Calculator className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">
                  Nenhum lançamento avulso registrado
                </h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Registre receitas extras, reembolsos manuais ou ajustes de caixa.
                </p>
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(true)}
                  className={buttonClass("primary", "sm", "mt-4")}
                >
                  Novo lançamento
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(e.entry_date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{e.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">{e.category}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
                              e.type === "income"
                                ? "bg-success/10 text-success border-success/30"
                                : "bg-destructive/10 text-destructive border-destructive/30",
                            )}
                          >
                            {e.type === "income" ? "Entrada" : "Saída"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right type-numeric font-semibold",
                            e.type === "income" ? "text-success" : "text-destructive",
                          )}
                        >
                          {e.type === "income" ? "+" : "-"}
                          {MetricsEngine.formatCurrency(e.amount, e.currency)}
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

      {/* Modal Custo Fixo */}
      {fixedCostModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setFixedCostModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-h3 text-foreground">Novo Custo Fixo</h2>
            <p className="type-body-sm mt-1 text-muted-foreground">
              Cadastre despesas fixas recorrentes para a DRE operacional.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createFixedCost.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Nome da despesa
                </label>
                <input
                  type="text"
                  required
                  value={costName}
                  onChange={(e) => setCostName(e.target.value)}
                  placeholder="Ex.: Servidores AWS / Vturb / Salários"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Categoria
                  </label>
                  <select
                    value={costCategory}
                    onChange={(e) => setCostCategory(e.target.value)}
                    className={inputClass}
                  >
                    <option value="software">Software / SaaS</option>
                    <option value="payroll">Equipe / Freelancers</option>
                    <option value="marketing_tools">Ferramentas Mkt</option>
                    <option value="infrastructure">Infraestrutura</option>
                    <option value="office">Escritório</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    placeholder="Ex.: 450.00"
                    className={inputClass}
                  />
                </div>
              </div>

              {createFixedCost.error instanceof Error && (
                <p className="text-[12px] text-destructive">{createFixedCost.error.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFixedCostModalOpen(false)}
                  className={buttonClass("outline", "md")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createFixedCost.isPending}
                  className={buttonClass("primary", "md")}
                >
                  {createFixedCost.isPending ? "Salvando…" : "Salvar custo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançamento */}
      {entryModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setEntryModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-h3 text-foreground">Lançamento de Caixa</h2>
            <p className="type-body-sm mt-1 text-muted-foreground">
              Registre uma entrada ou saída avulsa no histórico financeiro.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createEntry.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  placeholder="Ex.: Consultoria Externa / Ajuste Bancário"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">Tipo</label>
                  <select
                    value={entryType}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "expense" || val === "income") {
                        setEntryType(val);
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="expense">Saída / Despesa</option>
                    <option value="income">Entrada / Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryAmount}
                    onChange={(e) => setEntryAmount(e.target.value)}
                    placeholder="Ex.: 1200.00"
                    className={inputClass}
                  />
                </div>
              </div>

              {createEntry.error instanceof Error && (
                <p className="text-[12px] text-destructive">{createEntry.error.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className={buttonClass("outline", "md")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createEntry.isPending}
                  className={buttonClass("primary", "md")}
                >
                  {createEntry.isPending ? "Lançando…" : "Salvar lançamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
