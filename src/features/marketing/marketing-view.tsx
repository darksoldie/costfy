import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pause,
  Play,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

import { AppShellActions } from "@/components/app/app-shell";
import { useWorkspace } from "@/components/app/workspace-context";
import { type Campaign } from "@/lib/business-data";
import { MetricsEngine } from "@/lib/metrics-engine";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarketingCampaigns } from "./marketing.queries";

const TABS = [
  { id: "campanhas", label: "Campanhas" },
  { id: "conjuntos", label: "Conjuntos de Anúncios" },
  { id: "anuncios", label: "Anúncios" },
  { id: "criativos", label: "Criativos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface PlatformMeta {
  label: string;
  badge: string;
}

const DEFAULT_PLATFORM: PlatformMeta = {
  label: "Outro",
  badge: "bg-neutral-500/10 text-neutral-700 border-neutral-200/60 dark:bg-neutral-800/40 dark:text-neutral-300 dark:border-neutral-700",
};

const PLATFORM_CONFIG: Record<string, PlatformMeta> = {
  meta_ads: {
    label: "Meta Ads",
    badge: "bg-blue-500/10 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
  },
  google_ads: {
    label: "Google Ads",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
  },
  tiktok_ads: {
    label: "TikTok Ads",
    badge: "bg-neutral-500/10 text-neutral-800 border-neutral-200/60 dark:bg-neutral-800/40 dark:text-neutral-300 dark:border-neutral-700",
  },
  kwai: {
    label: "Kwai",
    badge: "bg-orange-500/10 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60",
  },
};

function getPlatformMeta(platform: string): PlatformMeta {
  return PLATFORM_CONFIG[platform] ?? DEFAULT_PLATFORM;
}

export function MarketingView() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;
  const currency = active?.workspace.base_currency || "BRL";

  const {
    campaigns,
    isLoading,
    createCampaign,
    toggleStatus,
    deleteCampaign,
    updateBudget,
  } = useMarketingCampaigns(workspaceId);

  const [activeTab, setActiveTab] = useState<TabId>("campanhas");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Form state para nova campanha
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("meta_ads");
  const [budget, setBudget] = useState("");
  const [objective, setObjective] = useState("Conversions / Sales");

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      return matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [campaigns, platformFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const paginatedCampaigns = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCampaigns.slice(start, start + pageSize);
  }, [filteredCampaigns, page, pageSize]);

  // Aggregate totals
  const totalSpend = useMemo(() => {
    return filteredCampaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  }, [filteredCampaigns]);

  const handleDelete = (campaign: Campaign) => {
    if (window.confirm(`Tem certeza que deseja excluir a campanha "${campaign.name}"?`)) {
      deleteCampaign.mutate(campaign.id);
    }
  };

  const handleEditBudget = (campaign: Campaign) => {
    const current = campaign.budget ? String(campaign.budget) : "0";
    const val = window.prompt("Defina o novo orçamento diário (R$):", current);
    if (val !== null && val.trim() !== "" && !isNaN(Number(val))) {
      updateBudget.mutate({ id: campaign.id, budget: Number(val) });
    }
  };

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCampaign.mutateAsync({
        name,
        platform,
        budget: budget ? parseFloat(budget) : 0,
        currency,
        objective,
      });
      setModalOpen(false);
      setName("");
      setBudget("");
      setPlatform("meta_ads");
      setObjective("Conversions / Sales");
    } catch {
      // O erro é tratado no createCampaign.error
    }
  }

  return (
    <>
      <AppShellActions>
        <div className="flex items-center gap-2">
          <Link
            to="/integrations"
            className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Conectar Ads
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" aria-hidden />
            Nova Campanha
          </button>
        </div>
      </AppShellActions>
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-6" aria-label="Abas de Marketing">
            {TABS.map((tabItem) => {
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tabItem.id);
                    setPage(1);
                  }}
                  className={cn(
                    "relative pb-2.5 text-[13px] font-medium transition-colors cursor-pointer",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tabItem.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab !== "campanhas" ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center shadow-2xs">
            <Layers className="size-8 text-muted-foreground/50 mb-3" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              A gestão operacional detalhada deste nível será sincronizada diretamente com as contas de anúncios conectadas.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("campanhas")}
              className="mt-4 inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              Voltar para Campanhas
            </button>
          </div>
        ) : (
          <>
            {/* Operational Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="text"
                    placeholder="Buscar campanhas..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-8.5 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Canal / Plataforma */}
                <select
                  aria-label="Filtrar por plataforma"
                  value={platformFilter}
                  onChange={(e) => {
                    setPlatformFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">Todas as Plataformas</option>
                  <option value="meta_ads">Meta Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="tiktok_ads">TikTok Ads</option>
                  <option value="kwai">Kwai</option>
                </select>

                {/* Status Filter */}
                <select
                  aria-label="Filtrar por status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativas</option>
                  <option value="paused">Pausadas</option>
                  <option value="draft">Rascunhos</option>
                  <option value="archived">Arquivadas</option>
                </select>

                {(platformFilter !== "all" || statusFilter !== "all" || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlatformFilter("all");
                      setStatusFilter("all");
                      setSearch("");
                      setPage(1);
                    }}
                    className="h-8.5 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {/* Quick totals strip */}
              <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground border-l border-border pl-4">
                <div>
                  Investimento Orçado:{" "}
                  <span className="font-semibold text-foreground tabular-nums font-mono">
                    {MetricsEngine.formatCurrency(totalSpend, currency)}
                  </span>
                </div>
                <div>
                  Campanhas Ativas:{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {filteredCampaigns.filter((c) => c.status === "active").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Table (Hero Element) */}
            <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th scope="col" className="py-2.5 px-4 text-left font-medium">
                        Campanha
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-left font-medium">
                        Canal
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">
                        Investimento
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">
                        Receita
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">
                        ROAS
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">
                        CPA
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-left font-medium">
                        Status
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <span className="size-2 animate-ping rounded-full bg-primary" />
                            Carregando campanhas...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <p className="text-sm font-medium text-foreground">
                            Nenhuma campanha encontrada
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {search || platformFilter !== "all" || statusFilter !== "all"
                              ? "Ajuste os filtros acima para visualizar outras campanhas."
                              : "Cadastre sua primeira campanha para iniciar o acompanhamento operacional."}
                          </p>
                          {!search && platformFilter === "all" && statusFilter === "all" && (
                            <button
                              type="button"
                              onClick={() => setModalOpen(true)}
                              className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                            >
                              <Plus className="size-3.5" aria-hidden />
                              Cadastrar Campanha
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedCampaigns.map((c) => {
                        const platformCfg = getPlatformMeta(c.platform);
                        const spend = c.budget || 0;
                        const isActive = c.status === "active";
                        const isPaused = c.status === "paused";

                        return (
                          <tr
                            key={c.id}
                            className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
                          >
                            {/* Campanha */}
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground truncate max-w-[240px]">
                                {c.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                                {c.objective || "Conversões / Vendas"}
                              </div>
                            </td>

                            {/* Canal */}
                            <td className="py-3 px-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium",
                                  platformCfg.badge,
                                )}
                              >
                                {platformCfg.label}
                              </span>
                            </td>

                            {/* Investimento */}
                            <td className="py-3 px-3 text-right tabular-nums font-mono text-[12.5px] text-foreground">
                              {MetricsEngine.formatCurrency(spend, c.currency || currency)}
                            </td>

                            {/* Receita (conforme dados atribuídos) */}
                            <td className="py-3 px-3 text-right tabular-nums font-mono text-[12.5px] text-foreground">
                              {MetricsEngine.formatCurrency(0, c.currency || currency)}
                            </td>

                            {/* ROAS */}
                            <td className="py-3 px-3 text-right tabular-nums font-mono text-[12.5px] text-muted-foreground">
                              —
                            </td>

                            {/* CPA */}
                            <td className="py-3 px-3 text-right tabular-nums font-mono text-[12.5px] text-muted-foreground">
                              —
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-left">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-[11.5px] font-medium",
                                  isActive
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : isPaused
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-muted-foreground",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    isActive
                                      ? "bg-emerald-500"
                                      : isPaused
                                      ? "bg-amber-500"
                                      : "bg-muted-foreground",
                                  )}
                                  aria-hidden
                                />
                                {isActive
                                  ? "Ativa"
                                  : isPaused
                                  ? "Pausada"
                                  : c.status === "draft"
                                  ? "Rascunho"
                                  : "Arquivada"}
                              </span>
                            </td>

                            {/* Ações */}
                            <td className="py-3 px-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">Ações da campanha</span>
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 text-xs">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleStatus.mutate({
                                        id: c.id,
                                        currentStatus: c.status,
                                      })
                                    }
                                    className="gap-2 cursor-pointer text-xs"
                                  >
                                    {isActive ? (
                                      <>
                                        <Pause className="size-3.5 text-amber-600" />
                                        <span>Pausar Campanha</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="size-3.5 text-emerald-600" />
                                        <span>Ativar Campanha</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEditBudget(c)}
                                    className="gap-2 cursor-pointer text-xs"
                                  >
                                    <Pencil className="size-3.5 text-muted-foreground" />
                                    <span>Editar Orçamento</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(c)}
                                    className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span>Excluir Campanha</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Minimal Pagination Footer */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-card">
                <div>
                  Mostrando{" "}
                  <span className="font-medium text-foreground">
                    {filteredCampaigns.length === 0
                      ? 0
                      : (page - 1) * pageSize + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(page * pageSize, filteredCampaigns.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-foreground">
                    {filteredCampaigns.length}
                  </span>{" "}
                  campanhas
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="size-3.5" />
                    Anterior
                  </button>
                  <span className="px-2 font-medium text-foreground">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Criar Campanha */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-xs p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-foreground">Nova Campanha</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cadastre os parâmetros da campanha para monitoramento pelo Costfy.
            </p>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Nome da Campanha
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
                  <label className="block text-xs font-medium text-foreground mb-1">
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
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Orçamento Diário ({currency})
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
                <label className="block text-xs font-medium text-foreground mb-1">
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
                <p className="text-xs text-destructive">{createCampaign.error.message}</p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={buttonClass("outline", "sm")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createCampaign.isPending}
                  className={buttonClass("primary", "sm")}
                >
                  {createCampaign.isPending ? "Salvando…" : "Salvar Campanha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
