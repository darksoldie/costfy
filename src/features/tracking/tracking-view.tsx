import { useState } from "react";
import { Workflow, Copy, Check, Plus } from "lucide-react";

import { AppShellActions } from "@/components/app/app-shell";
import { useWorkspace } from "@/components/app/workspace-context";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { useTrackingData } from "./tracking.queries";

export function TrackingView() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { utmLinks, loadingLinks, sessions, loadingSessions, createUtmLink } =
    useTrackingData(workspaceId);

  const [tab, setTab] = useState<"builder" | "links" | "sessions" | "script">("builder");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states do gerador de UTM
  const [linkName, setLinkName] = useState("");
  const [destUrl, setDestUrl] = useState("https://");
  const [utmSource, setUtmSource] = useState("meta_ads");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmTerm, setUtmTerm] = useState("");

  // Construção em tempo real da URL rastreada
  const generatedUrl = (() => {
    try {
      const base = destUrl.trim();
      if (!base || base === "https://") return "";
      const url = new URL(base.startsWith("http") ? base : `https://${base}`);
      if (utmSource) url.searchParams.set("utm_source", utmSource.trim());
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium.trim());
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign.trim());
      if (utmContent) url.searchParams.set("utm_content", utmContent.trim());
      if (utmTerm) url.searchParams.set("utm_term", utmTerm.trim());
      return url.toString();
    } catch {
      return "";
    }
  })();

  function handleCreateLink() {
    createUtmLink.mutate(
      {
        name: linkName,
        destinationUrl: generatedUrl,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
      },
      {
        onSuccess: () => {
          setTab("links");
          setLinkName("");
          setUtmCampaign("");
          setUtmContent("");
          setUtmTerm("");
        },
      },
    );
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <>
      <AppShellActions>
        <button
          type="button"
          onClick={() => setTab("builder")}
          className={buttonClass("primary", "sm", "gap-1.5")}
        >
          <Plus className="size-3.5" />
          Criar link UTM
        </button>
      </AppShellActions>
      <div className="space-y-6">
        {/* Abas */}
        <div className="flex items-center gap-1 border-b border-border pb-1">
          {(
            [
              { key: "builder", label: "Gerador de UTMs" },
              { key: "links", label: `Links Criados (${utmLinks.length})` },
              { key: "sessions", label: `Sessões de Tráfego (${sessions.length})` },
              { key: "script", label: "Script de Rastreamento" },
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

        {/* Gerador de UTMs */}
        {tab === "builder" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="editorial-card p-6 space-y-4">
              <h3 className="text-[15px] font-semibold text-foreground">Configurar Parâmetros</h3>
              <p className="text-[12.5px] text-muted-foreground">
                Padronize suas tags para que o Costfy Brain e o motor de atribuição reconheçam
                exatamente a origem de cada venda.
              </p>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Nome / Identificador do Link (opcional)
                  </label>
                  <input
                    type="text"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Ex.: Bio do Instagram / Anúncio VSL 01"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    URL de Destino *
                  </label>
                  <input
                    type="url"
                    required
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    placeholder="https://sualoja.com.br/produto"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-1">
                      UTM Source *
                    </label>
                    <select
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className={inputClass}
                    >
                      <option value="meta_ads">meta_ads</option>
                      <option value="google_ads">google_ads</option>
                      <option value="tiktok_ads">tiktok_ads</option>
                      <option value="kwai">kwai</option>
                      <option value="instagram_bio">instagram_bio</option>
                      <option value="email">email</option>
                      <option value="whatsapp">whatsapp</option>
                      <option value="influencer">influencer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-1">
                      UTM Medium *
                    </label>
                    <select
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className={inputClass}
                    >
                      <option value="cpc">cpc (anúncio pago)</option>
                      <option value="stories">stories</option>
                      <option value="feed">feed</option>
                      <option value="reels">reels</option>
                      <option value="banner">banner</option>
                      <option value="organic">organic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    UTM Campaign *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="Ex.: [escala]_lookalike_1pct"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-1">
                      UTM Content (opcional)
                    </label>
                    <input
                      type="text"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      placeholder="Ex.: video_vsl_02"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-1">
                      UTM Term (opcional)
                    </label>
                    <input
                      type="text"
                      value={utmTerm}
                      onChange={(e) => setUtmTerm(e.target.value)}
                      placeholder="Ex.: palavra_chave"
                      className={inputClass}
                    />
                  </div>
                </div>

                {createUtmLink.error instanceof Error && (
                  <p className="text-[12px] text-destructive">{createUtmLink.error.message}</p>
                )}
              </div>
            </div>

            {/* Preview do Link Gerado */}
            <div className="editorial-card flex flex-col justify-between p-6">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">URL Rastreável Pronta</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">
                  Copie e use diretamente em seus criativos e anúncios.
                </p>

                <div className="mt-4 rounded-md border border-border bg-surface/60 p-3.5 font-mono text-[12px] text-foreground break-all">
                  {generatedUrl || "Preencha a URL de destino e os parâmetros ao lado..."}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  disabled={!generatedUrl}
                  onClick={() => copyToClipboard(generatedUrl, "preview")}
                  className={cn(buttonClass("secondary", "md"), "flex-1 gap-2")}
                >
                  {copiedId === "preview" ? (
                    <>
                      <Check className="size-4 text-success" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Copiar URL
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!generatedUrl || createUtmLink.isPending}
                  onClick={handleCreateLink}
                  className={cn(buttonClass("primary", "md"), "flex-1")}
                >
                  {createUtmLink.isPending ? "Salvando…" : "Salvar no Workspace"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Links Criados */}
        {tab === "links" && (
          <div>
            {loadingLinks ? (
              <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
                ))}
              </div>
            ) : utmLinks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <Workflow className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhum link UTM salvo</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Gere links parametrizados para rastrear a origem exata de cada clique e compra.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("builder")}
                  className={buttonClass("primary", "sm", "mt-4")}
                >
                  Criar primeiro link
                </button>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Identificador</th>
                      <th className="px-4 py-3">Source / Medium</th>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3 text-right">Cliques</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border">
                    {utmLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{link.name}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-[12px]">
                          {link.utm_source} / {link.utm_medium}
                        </td>
                        <td className="px-4 py-3 text-foreground">{link.utm_campaign}</td>
                        <td className="px-4 py-3 text-right type-numeric font-medium text-foreground">
                          {link.click_count}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(link.destination_url, link.id)}
                            className={buttonClass("outline", "sm", "h-7 text-[12px] gap-1")}
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="size-3 text-success" /> Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" /> Copiar
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
        )}

        {/* Sessões de Tráfego */}
        {tab === "sessions" && (
          <div>
            {loadingSessions ? (
              <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
                <Workflow className="mx-auto size-8 text-muted-foreground" />
                <h3 className="type-h3 mt-3 text-foreground">Nenhuma sessão registrada</h3>
                <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
                  Instale o script de tracking no seu site para capturar automaticamente os acessos
                  dos visitantes e tags UTM.
                </p>
              </div>
            ) : (
              <div className="editorial-card overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Início</th>
                      <th className="px-4 py-3">Página de Entrada</th>
                      <th className="px-4 py-3">Origem UTM</th>
                      <th className="px-4 py-3">Dispositivo</th>
                      <th className="px-4 py-3 text-right">Localização</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(s.started_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground truncate max-w-xs">
                          {s.landing_page}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-[12px]">
                          {s.utm_source ? `${s.utm_source} / ${s.utm_campaign || ""}` : "Direto"}
                        </td>
                        <td className="px-4 py-3 text-subtle-foreground capitalize">
                          {s.device_type || "Desktop"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {s.city ? `${s.city}, ${s.country}` : s.country || "BR"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Script de Rastreamento */}
        {tab === "script" && (
          <div className="editorial-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  Script de Rastreamento Costfy
                </h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">
                  Adicione esta tag no cabeçalho (<code className="text-foreground">&lt;head&gt;</code>)
                  do seu site, loja ou checkout para capturar sessões, UTMs e eventos de conversão em
                  tempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const origin =
                    typeof window !== "undefined" ? window.location.origin : "https://costfy.com.br";
                  const snippet = `<!-- Costfy Pixel Tracking Tag -->\n<script>\n  (function(w,d,s,u,wid){\n    w.CostfyTrackingObject=wid;\n    w.costfyWorkspaceId=wid;\n    var f=d.getElementsByTagName(s)[0],j=d.createElement(s);\n    j.async=true;j.src=u;j.setAttribute('data-workspace-id',wid);f.parentNode.insertBefore(j,f);\n  })(window,document,'script','${origin}/track.js','${workspaceId || "YOUR_WORKSPACE_ID"}');\n</script>`;
                  copyToClipboard(snippet, "script_pixel");
                }}
                className={buttonClass("primary", "sm", "gap-1.5 shrink-0")}
              >
                {copiedId === "script_pixel" ? (
                  <>
                    <Check className="size-3.5 text-success" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Copiar script
                  </>
                )}
              </button>
            </div>

            <pre className="rounded-md border border-border bg-surface/60 p-4 font-mono text-[12px] text-foreground overflow-x-auto">
              {`<!-- Costfy Pixel Tracking Tag -->
<script>
  (function(w,d,s,u,wid){
    w.CostfyTrackingObject=wid;
    w.costfyWorkspaceId=wid;
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
    j.async=true;j.src=u;j.setAttribute('data-workspace-id',wid);f.parentNode.insertBefore(j,f);
  })(window,document,'script','${typeof window !== "undefined" ? window.location.origin : "https://costfy.com.br"}/track.js','${workspaceId || "YOUR_WORKSPACE_ID"}');
</script>`}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
