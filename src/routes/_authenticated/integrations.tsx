import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Check, ExternalLink, ShieldCheck, Zap, X } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { integrationsQuery, type Integration } from "@/lib/workspaces";
import { buttonClass } from "@/lib/ui";
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
  { provider: "hotmart", name: "Hotmart", category: "Infoprodutos", type: "webhook" },
  { provider: "kiwify", name: "Kiwify", category: "Infoprodutos", type: "webhook" },
  { provider: "stripe", name: "Stripe", category: "Pagamentos", type: "webhook" },
  { provider: "shopify", name: "Shopify", category: "Vendas", type: "oauth" },
  { provider: "meta_ads", name: "Meta Ads", category: "Mídia", type: "oauth" },
  { provider: "google_ads", name: "Google Ads", category: "Mídia", type: "oauth" },
  { provider: "tiktok_ads", name: "TikTok Ads", category: "Mídia", type: "oauth" },
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
  const workspaceId = active?.workspace.id ?? null;
  const { data, isPending, error } = useQuery(integrationsQuery(workspaceId));

  const [selectedProvider, setSelectedProvider] = useState<(typeof CATALOG)[number] | null>(null);
  const [copied, setCopied] = useState(false);

  const byProvider = new Map<string, Integration>((data ?? []).map((row) => [row.provider, row]));

  const hostOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://costfy.com.br";
  const webhookUrl = selectedProvider
    ? `${hostOrigin}/api/webhooks/${selectedProvider.provider}?workspace_id=${workspaceId || "YOUR_WORKSPACE_ID"}`
    : "";

  function handleCopy() {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell
      title="Integrações"
      description="Conecte suas fontes de vendas e tráfego. Dados recebidos via Webhooks são normalizados em tempo real."
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
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-foreground">
                  Webhooks Automáticos Ativos
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Integrações de checkout (Hotmart, Kiwify, Stripe) funcionam via Webhook direto com
                  validação de idempotência.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {CATALOG.map((item) => {
              const row = byProvider.get(item.provider);
              const status = row?.status ?? "not_connected";
              return (
                <article
                  key={item.provider}
                  className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[14px] font-semibold text-foreground">{item.name}</h2>
                        <p className="text-[12px] text-subtle-foreground">{item.category}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          isPending
                            ? "border-border bg-secondary text-muted-foreground"
                            : statusTone(status),
                        )}
                      >
                        {isPending ? "Verificando" : (STATUS_LABEL[status] ?? status)}
                      </span>
                    </div>

                    <p className="type-body-sm mt-3 text-muted-foreground">
                      {row?.last_synced_at
                        ? `Última sincronização: ${new Date(row.last_synced_at).toLocaleString("pt-BR")}`
                        : item.type === "webhook"
                          ? "Pronto para receber webhooks de vendas."
                          : "Conexão direta via API."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-mono text-subtle-foreground uppercase">
                      {item.type === "webhook" ? "Webhook" : "OAuth"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(item)}
                      className={buttonClass("outline", "sm", "text-[12px] h-7 px-2.5")}
                    >
                      {item.type === "webhook" ? "Configurar Webhook" : "Conectar"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Configuração de Webhook */}
      {selectedProvider && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="type-h3 text-foreground">Configurar {selectedProvider.name}</h3>
                <p className="text-[12px] text-muted-foreground">
                  {selectedProvider.type === "webhook"
                    ? "Cadastre a URL abaixo no painel de webhooks da sua conta."
                    : "Fluxo de autorização OAuth direto."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="grid size-7 place-items-center rounded hover:bg-secondary text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {selectedProvider.type === "webhook" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                    URL do Webhook (Endpoint de Ingestão):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[12px] text-foreground focus:outline-none"
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

                <div className="rounded-lg border border-border bg-surface p-3.5 space-y-2 text-[12px] text-muted-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" /> Instruções para{" "}
                    {selectedProvider.name}:
                  </p>
                  {selectedProvider.provider === "hotmart" && (
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Acesse Ferramentas &gt; Webhook (Notificações) no painel Hotmart.</li>
                      <li>Clique em Cadastrar Webhook e cole a URL acima.</li>
                      <li>Selecione os eventos de Compra Aprovada, Reembolsada e Cancelada.</li>
                    </ol>
                  )}
                  {selectedProvider.provider === "kiwify" && (
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Acesse Apps &gt; Webhooks no painel Kiwify.</li>
                      <li>Clique em Criar Webhook e cole a URL acima.</li>
                      <li>
                        Marque todos os eventos de Pedido (Aprovado, Reembolsado, Chargeback).
                      </li>
                    </ol>
                  )}
                  {selectedProvider.provider === "stripe" && (
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Acesse Developers &gt; Webhooks no painel da Stripe.</li>
                      <li>Clique em Add Endpoint e cole a URL acima.</li>
                      <li>
                        Selecione eventos:{" "}
                        <code className="text-foreground font-mono">
                          checkout.session.completed
                        </code>
                        , <code className="text-foreground font-mono">charge.refunded</code>.
                      </li>
                    </ol>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className={buttonClass("outline", "sm")}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-[13px]">
                <p className="text-muted-foreground">
                  A autorização de leitura de campanhas do {selectedProvider.name} está em fase
                  final de homologação técnica.
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Você já pode cadastrar suas campanhas ativas no menu{" "}
                  <strong className="text-foreground">Marketing</strong> para acompanhamento
                  imediato de orçamento e ROAS consolidado.
                </p>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className={buttonClass("primary", "sm")}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
