import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart2,
  Filter,
  Layers,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { supabase } from "@/integrations/supabase/client";
import { campaignsQuery, type Campaign, type CampaignStatus } from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing & Campanhas — Costfy" },
      {
        name: "description",
        content:
          "Acompanhe campanhas, conjuntos, anúncios e criativos com métricas consolidadas e ROAS real.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <MarketingPage />
    </WorkspaceProvider>
  ),
});

function MarketingPage() {
  const { active } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = active?.workspace.id ?? null;

  const { data: campaigns = [], isLoading, error } = useQuery(campaignsQuery(workspaceId));

  const [tab, setTab] = useState<"campaigns" | "ad_sets" | "ads" | "creatives">("campaigns");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state para nova campanha
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("meta_ads");
  const [budget, setBudget] = useState("");
  const [objective, setObjective] = useState("Conversions / Sales");

  const createCampaign = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!name.trim()) throw new Error("Informe o nome da campanha");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          workspace_id: workspaceId,
          name: name.trim(),
          platform,
          budget: budget ? parseFloat(budget) : 0,
          currency: active?.workspace.base_currency || "BRL",
          objective,
          status: "active",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      setModalOpen(false);
      setName("");
      setBudget("");
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: CampaignStatus }) => {
      const nextStatus: CampaignStatus = currentStatus === "active" ? "paused" : "active";
      const { error } = await supabase
        .from("campaigns")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
    },
  });

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  // Métricas agregadas de campanhas
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const trafficMetrics = MetricsEngine.calculateTraffic({
    impressions: 0,
    clicks: 0,
    spend: totalSpend,
    conversions: 0,
    revenue: 0,
  });

  return (
    <AppShell
      title="Marketing"
      description="Hierarquia de mídia paga: Campanhas → Conjuntos → Anúncios → Criativos."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/integrations" className={buttonClass("outline", "sm")}>
            Conectar Ads
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={buttonClass("primary", "sm", "gap-1.5")}
          >
            <Plus className="size-3.5" />
            Nova campanha
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Bar — Editorial Terminal Strip */}
        <div className="editorial-card overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-6">
            <div className="p-4">
              <span className="type-label-subtle">Campanhas Ativas</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {campaigns.filter((c) => c.status === "active").length}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                de {campaigns.length} cadastradas
              </p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">Orçamento Total</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {MetricsEngine.formatCurrency(totalSpend, active?.workspace.base_currency)}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">consolidado</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">ROAS Global</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {trafficMetrics.roas > 0 ? `${trafficMetrics.roas.toFixed(2)}x` : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">calculado central</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">CPA Médio</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {trafficMetrics.cpa > 0 ? MetricsEngine.formatCurrency(trafficMetrics.cpa) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">por conversão</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">CTR Médio</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {trafficMetrics.ctr > 0 ? MetricsEngine.formatPercent(trafficMetrics.ctr) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">taxa de clique</p>
            </div>
            <div className="p-4">
              <span className="type-label-subtle">CPC Médio</span>
              <p className="type-metric-hero mt-1.5 text-foreground">
                {trafficMetrics.cpc > 0 ? MetricsEngine.formatCurrency(trafficMetrics.cpc) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">custo por clique</p>
            </div>
          </div>
        </div>

        {/* Abas de Navegação Hierárquica */}
        <div className="flex items-center gap-1 border-b border-border pb-1">
          {(
            [
              { key: "campaigns", label: "Campanhas" },
              { key: "ad_sets", label: "Conjuntos" },
              { key: "ads", label: "Anúncios" },
              { key: "creatives", label: "Criativos" },
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

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar campanhas..."
              className={cn(inputClass, "pl-9 h-9 text-[13px]")}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-[13px] px-2.5")}
            >
              <option value="all">Todas as plataformas</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="tiktok_ads">TikTok Ads</option>
              <option value="kwai">Kwai</option>
            </select>
          </div>
        </div>

        {/* Tabela de Campanhas */}
        {isLoading ? (
          <div className="space-y-2 editorial-card p-6 bg-card">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="editorial-card p-10 text-center bg-surface/50">
            <Layers className="mx-auto size-8 text-muted-foreground" />
            <h3 className="type-h3 mt-3 text-foreground">Nenhuma campanha encontrada</h3>
            <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
              Conecte sua conta de anúncios em Integrações para sincronização automática ou cadastre
              manualmente.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={buttonClass("primary", "sm")}
              >
                Cadastrar campanha
              </button>
            </div>
          </div>
        ) : (
          <div className="editorial-card overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Campanha</th>
                  <th className="px-4 py-3">Plataforma</th>
                  <th className="px-4 py-3">Objetivo</th>
                  <th className="px-4 py-3 text-right">Orçamento Diário</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                          camp.status === "active"
                            ? "bg-success/10 text-success border border-success/30"
                            : "bg-secondary text-muted-foreground border border-border",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            camp.status === "active" ? "bg-success" : "bg-muted-foreground",
                          )}
                        />
                        {camp.status === "active" ? "Ativa" : "Pausada"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{camp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {camp.platform.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-subtle-foreground">
                      {camp.objective || "Vendas"}
                    </td>
                    <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                      {MetricsEngine.formatCurrency(camp.budget || 0, camp.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus.mutate({ id: camp.id, currentStatus: camp.status })
                        }
                        disabled={toggleStatus.isPending}
                        className={buttonClass("outline", "sm", "h-7 text-[12px] gap-1")}
                      >
                        {camp.status === "active" ? (
                          <>
                            <Pause className="size-3" /> Pausar
                          </>
                        ) : (
                          <>
                            <Play className="size-3" /> Ativar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Campanha */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-h3 text-foreground">Nova Campanha</h2>
            <p className="type-body-sm mt-1 text-muted-foreground">
              Cadastre os parâmetros da campanha para monitoramento pelo Costfy.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCampaign.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Nome da campanha
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: [Escala] Lookalike 1% - Conversão"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Plataforma
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className={inputClass}
                  >
                    <option value="meta_ads">Meta Ads</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="tiktok_ads">TikTok Ads</option>
                    <option value="kwai">Kwai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Orçamento Diário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ex.: 150.00"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Objetivo
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex.: Conversions / Sales"
                  className={inputClass}
                />
              </div>

              {createCampaign.error instanceof Error && (
                <p className="text-[12px] text-destructive">{createCampaign.error.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={buttonClass("outline", "md")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createCampaign.isPending}
                  className={buttonClass("primary", "md")}
                >
                  {createCampaign.isPending ? "Salvando…" : "Salvar campanha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
