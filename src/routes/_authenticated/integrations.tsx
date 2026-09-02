import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { integrationsQuery, type Integration } from "@/lib/workspaces";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrações — Costfy" },
      {
        name: "description",
        content:
          "Conecte mídia, vendas, pagamentos e finanças ao Costfy e veja o estado real de cada fonte de dados.",
      },
      { property: "og:title", content: "Integrações — Costfy" },
      {
        property: "og:description",
        content: "Estado real de cada fonte de dados do seu negócio.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <IntegrationsPage />
    </WorkspaceProvider>
  ),
});

const CATALOG = [
  { provider: "meta_ads", name: "Meta Ads", category: "Mídia" },
  { provider: "google_ads", name: "Google Ads", category: "Mídia" },
  { provider: "tiktok_ads", name: "TikTok Ads", category: "Mídia" },
  { provider: "shopify", name: "Shopify", category: "Vendas" },
  { provider: "stripe", name: "Stripe", category: "Pagamentos" },
  { provider: "hotmart", name: "Hotmart", category: "Infoprodutos" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  not_connected: "Não conectado",
  connecting: "Conectando",
  connected: "Conectado",
  syncing: "Sincronizando",
  error: "Erro",
  paused: "Pausado",
  data_delayed: "Dados atrasados",
};

function statusTone(status: string) {
  if (status === "connected") return "text-success border-success/30 bg-success/10";
  if (status === "error") return "text-destructive border-destructive/30 bg-destructive/10";
  if (status === "not_connected") return "text-muted-foreground border-border bg-secondary";
  return "text-primary border-primary/30 bg-primary/10";
}

function IntegrationsPage() {
  const { active } = useWorkspace();
  const { data, isPending, error } = useQuery(integrationsQuery(active?.workspace.id ?? null));

  const byProvider = new Map<string, Integration>(
    (data ?? []).map((row) => [row.provider, row]),
  );

  return (
    <AppShell
      title="Integrações"
      description="Cada fonte mostra seu estado real — sem status decorativo."
    >
      {error instanceof Error && (
        <p role="alert" className="type-body-sm text-destructive">
          {error.message}
        </p>
      )}

      {!active && (
        <p className="type-body-sm text-muted-foreground">
          Crie um workspace para conectar fontes de dados.
        </p>
      )}

      {active && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((item) => {
            const row = byProvider.get(item.provider);
            const status = row?.status ?? "not_connected";
            return (
              <article
                key={item.provider}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[14px] font-semibold text-foreground">
                      {item.name}
                    </h2>
                    <p className="text-[12px] text-subtle-foreground">{item.category}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      isPending ? "border-border bg-secondary text-muted-foreground" : statusTone(status),
                    )}
                  >
                    {isPending ? "Verificando" : STATUS_LABEL[status] ?? status}
                  </span>
                </div>
                <p className="type-body-sm mt-3 text-muted-foreground">
                  {row?.last_synced_at
                    ? `Última sincronização: ${new Date(row.last_synced_at).toLocaleString("pt-BR")}`
                    : "Nenhuma sincronização registrada."}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
