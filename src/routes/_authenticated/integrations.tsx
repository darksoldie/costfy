import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  X,
  AlertCircle,
  RefreshCw,
  PowerOff,
  Radio,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

import { useWorkspace } from "@/components/app/workspace-context";
import { integrationsQuery, type Integration } from "@/lib/workspaces";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import {
  INTEGRATION_REGISTRY,
  normalizeIntegrationStatus,
} from "@/lib/integrations/registry";
import type { IntegrationAdapter, NormalizedConnectionState } from "@/lib/integrations/types";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrações Oficiais — Costfy" },
      {
        name: "description",
        content:
          "Conecte canais de mídia (Meta, Google, TikTok) e plataformas de venda (Mercado Pago, Hotmart, Kiwify, Shopify, Stripe).",
      },
      { property: "og:title", content: "Integrações Oficiais — Costfy" },
      {
        property: "og:description",
        content: "Estado real de cada fonte de dados e mídia do seu negócio.",
      },
    ],
  }),
  component: IntegrationsPage,
});

const STATUS_CONFIG: Record<
  NormalizedConnectionState,
  { label: string; badgeClass: string; isConnected: boolean }
> = {
  CONNECTED: {
    label: "Conectado",
    badgeClass: "text-success border-success/30 bg-success/10",
    isConnected: true,
  },
  CONNECTING: {
    label: "Conectando...",
    badgeClass: "text-primary border-primary/30 bg-primary/10",
    isConnected: false,
  },
  SYNCING: {
    label: "Sincronizando...",
    badgeClass: "text-primary border-primary/30 bg-primary/10",
    isConnected: true,
  },
  ERROR: {
    label: "Erro de conexão",
    badgeClass: "text-destructive border-destructive/30 bg-destructive/10",
    isConnected: false,
  },
  DISCONNECTED: {
    label: "Desconectado",
    badgeClass: "text-muted-foreground border-border bg-secondary",
    isConnected: false,
  },
  NOT_CONNECTED: {
    label: "Não conectado",
    badgeClass: "text-muted-foreground border-border bg-secondary",
    isConnected: false,
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todas as Integrações",
  media: "Mídia & Tráfego",
  infoproducts: "Infoprodutos & Checkouts",
  sales: "E-commerce & Lojas",
  payments: "Pagamentos & Gateways",
};

export function IntegrationsPage() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery(integrationsQuery(workspaceId));

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedAdapter, setSelectedAdapter] = useState<IntegrationAdapter | null>(null);
  const [copied, setCopied] = useState(false);
  const [envStatus, setEnvStatus] = useState<{
    configured: boolean;
    missingEnvs: string[];
    requiresOAuth: boolean;
  } | null>(null);
  const [envLoading, setEnvLoading] = useState(false);

  const byProvider = new Map<string, Integration>((data ?? []).map((row) => [row.provider, row]));

  const hostOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://costfy.com.br";
  const webhookUrl = selectedAdapter
    ? `${hostOrigin}/api/webhooks/${selectedAdapter.provider}?workspace_id=${workspaceId || "YOUR_WORKSPACE_ID"}`
    : "";

  // Ao abrir o modal de um adapter, consulta o status de configuração no servidor
  useEffect(() => {
    if (!selectedAdapter) {
      setEnvStatus(null);
      return;
    }

    if (selectedAdapter.authType === "oauth") {
      setEnvLoading(true);
      fetch(`/api/integrations/env-status?provider=${encodeURIComponent(selectedAdapter.provider)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json) {
            setEnvStatus(json);
          }
        })
        .catch(() => {
          setEnvStatus({ configured: false, missingEnvs: selectedAdapter.getRequiredServerEnvs(), requiresOAuth: true });
        })
        .finally(() => setEnvLoading(false));
    } else {
      setEnvStatus({ configured: true, missingEnvs: [], requiresOAuth: false });
    }
  }, [selectedAdapter]);

  const syncMutation = useMutation({
    mutationFn: async (provider: string) => {
      if (!workspaceId) return;
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, provider }),
      });
      if (!res.ok) throw new Error("Falha ao sincronizar dados da integração.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", workspaceId] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      if (!workspaceId) return;
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, provider }),
      });
      if (!res.ok) throw new Error("Falha ao desconectar integração.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", workspaceId] });
      setSelectedAdapter(null);
    },
  });

  function handleCopy() {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const adaptersList = Object.values(INTEGRATION_REGISTRY);
  const filteredAdapters = selectedFilter === "all"
    ? adaptersList
    : adaptersList.filter((a) => a.category === selectedFilter);

  return (
    <div className="space-y-6 animate-fade">
      {error instanceof Error && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {!active && (
        <p className="type-body-sm text-muted-foreground">
          Crie ou selecione um workspace para gerenciar as conexões de dados.
        </p>
      )}

      {active && (
        <>
          {/* Header & Filtro de Categorias */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedFilter(key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors shrink-0",
                    selectedFilter === key
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Radio className="size-3.5 text-success animate-pulse" />
              <span>Conexões ativas são sincronizadas automaticamente</span>
            </div>
          </div>

          {/* Grid de Cards de Integrações */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAdapters.map((adapter) => {
              const row = byProvider.get(adapter.provider);
              const normalizedStatus = normalizeIntegrationStatus(row?.status);
              const statusCfg = STATUS_CONFIG[normalizedStatus];

              return (
                <article
                  key={adapter.provider}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-border-strong transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[14.5px] font-semibold text-foreground flex items-center gap-1.5">
                          {adapter.name}
                        </h2>
                        <span className="text-[11px] font-mono text-muted-foreground uppercase">
                          {CATEGORY_LABELS[adapter.category] || adapter.category}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          isPending ? "border-border bg-secondary text-muted-foreground" : statusCfg.badgeClass,
                        )}
                      >
                        {isPending ? "Verificando..." : statusCfg.label}
                      </span>
                    </div>

                    <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3">
                      {adapter.description}
                    </p>

                    {row?.last_synced_at && (
                      <p className="text-[11px] text-muted-foreground/80 font-mono">
                        Última sincronização: {new Date(row.last_synced_at).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <span className="rounded bg-surface px-2 py-0.5 text-[10.5px] font-mono text-muted-foreground uppercase border border-border">
                      {adapter.authType === "webhook" ? "Webhook" : "OAuth 2.0"}
                    </span>

                    <div className="flex items-center gap-2">
                      {statusCfg.isConnected && (
                        <button
                          type="button"
                          disabled={syncMutation.isPending}
                          onClick={() => syncMutation.mutate(adapter.provider)}
                          title="Sincronizar agora"
                          className={buttonClass("ghost", "sm", "size-8 p-0 text-muted-foreground hover:text-foreground")}
                        >
                          <RefreshCw className={cn("size-3.5", syncMutation.isPending && "animate-spin text-primary")} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedAdapter(adapter)}
                        className={buttonClass(statusCfg.isConnected ? "outline" : "primary", "sm", "text-[12px] h-8 px-3")}
                      >
                        {statusCfg.isConnected
                          ? "Gerenciar"
                          : adapter.authType === "webhook"
                            ? "Configurar Webhook"
                            : "Conectar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL DE GERENCIAMENTO E CONFIGURAÇÃO DA INTEGRAÇÃO */}
      {selectedAdapter && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setSelectedAdapter(null)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="space-y-0.5">
                <h3 className="type-h2 text-foreground flex items-center gap-2">
                  <span>{selectedAdapter.name}</span>
                  <span className="text-[11px] font-normal rounded-full border px-2 py-0.5 bg-secondary text-muted-foreground">
                    {selectedAdapter.authType === "webhook" ? "Webhook" : "OAuth 2.0"}
                  </span>
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  {selectedAdapter.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdapter(null)}
                className="grid size-7 place-items-center rounded hover:bg-secondary text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* CASO 1: INTEGRAÇÃO VIA WEBHOOK (Mercado Pago, Hotmart, Kiwify, etc.) */}
            {selectedAdapter.authType === "webhook" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                    URL Oficial do Webhook (Endpoint de Ingestão):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[12px] text-foreground focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={buttonClass("primary", "sm", "gap-1 shrink-0")}
                    >
                      {copied ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4 space-y-2.5 text-[12.5px] text-muted-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-primary" /> Instruções de Configuração:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    {selectedAdapter.getSetupInstructions(webhookUrl).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {selectedAdapter.docsUrl && (
                  <a
                    href={selectedAdapter.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                  >
                    <span>Documentação oficial da plataforma</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedAdapter(null)}
                    className={buttonClass("outline", "sm")}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              /* CASO 2: INTEGRAÇÃO VIA OAUTH 2.0 (Meta Ads, Google Ads, TikTok Ads) */
              <div className="space-y-4">
                {envLoading ? (
                  <div className="p-8 text-center text-muted-foreground text-[13px] space-y-2">
                    <RefreshCw className="size-5 animate-spin mx-auto text-primary" />
                    <p>Verificando credenciais no servidor...</p>
                  </div>
                ) : envStatus?.configured ? (
                  /* Credenciais configuradas no servidor -> Fluxo Real de Conexão */
                  <div className="space-y-3">
                    <div className="rounded-lg border border-success/30 bg-success/10 p-3.5 text-[12.5px] text-success flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Credenciais de aplicativo identificadas no servidor. Pronto para autorização OAuth.</span>
                    </div>

                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Ao clicar no botão abaixo, você será redirecionado com segurança para o ambiente oficial de consentimento do <strong>{selectedAdapter.name}</strong> para autorizar a leitura das suas contas e campanhas.
                    </p>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAdapter(null)}
                        className={buttonClass("outline", "sm")}
                      >
                        Cancelar
                      </button>
                      <a
                        href={selectedAdapter.getAuthUrl({
                          workspaceId: workspaceId || "",
                          redirectUri: `${hostOrigin}/api/integrations/oauth/callback`,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClass("primary", "sm", "gap-1.5")}
                      >
                        <span>Iniciar Autorização OAuth</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Credenciais ausentes no servidor -> Configuração Necessária Explicada */
                  <div className="space-y-3">
                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-3.5 text-[12.5px] text-warning flex items-start gap-2">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">Configuração necessária no servidor</strong>
                        <span>
                          Para conectar o {selectedAdapter.name}, as credenciais oficiais da aplicação precisam ser inseridas nas variáveis de ambiente do servidor.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-foreground">
                        Variáveis de ambiente requeridas:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAdapter.getRequiredServerEnvs().map((envVar) => (
                          <code
                            key={envVar}
                            className="rounded bg-secondary px-2 py-0.5 font-mono text-[11.5px] text-foreground border border-border"
                          >
                            {envVar}
                          </code>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-surface p-4 space-y-2 text-[12.5px] text-muted-foreground">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-primary" /> Como obter e configurar:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                        {selectedAdapter.getSetupInstructions().map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {selectedAdapter.docsUrl && (
                      <a
                        href={selectedAdapter.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                      >
                        <span>Acessar portal oficial de desenvolvedores do {selectedAdapter.name}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      {byProvider.get(selectedAdapter.provider)?.status === "connected" && (
                        <button
                          type="button"
                          disabled={disconnectMutation.isPending}
                          onClick={() => disconnectMutation.mutate(selectedAdapter.provider)}
                          className={buttonClass("ghost", "sm", "text-destructive hover:bg-destructive/10 gap-1.5")}
                        >
                          <PowerOff className="size-3.5" />
                          <span>Desconectar integração</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedAdapter(null)}
                        className={buttonClass("primary", "sm", "ml-auto")}
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
