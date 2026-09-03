import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Send,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
  Activity,
  Bot,
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
  orderItemsQuery,
  gatewayFeesQuery,
  taxesQuery,
  adMetricsDailyQuery,
} from "@/lib/business-data";
import { BrainEngine, type BrainInsight, type BrainActionProposal } from "@/lib/brain-engine";
import { ActionEngine } from "@/lib/action-engine";
import { MetricsEngine } from "@/lib/metrics-engine";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/brain")({
  head: () => ({
    meta: [
      { title: "Costfy Brain Hub — Inteligência Operacional" },
      {
        name: "description",
        content:
          "O núcleo de inteligência do seu negócio digital: diagnósticos em tempo real, insights acionáveis e ações com aprovação humana.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <BrainPage />
    </WorkspaceProvider>
  ),
});

interface ChatMessage {
  id: string;
  sender: "user" | "brain";
  text: string;
  timestamp: string;
}

function BrainPage() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [] } = useQuery(productsQuery(workspaceId));
  const { data: fixedCosts = [] } = useQuery(fixedCostsQuery(workspaceId));
  const { data: orderItems = [] } = useQuery(orderItemsQuery(workspaceId));
  const { data: gatewayFees = [] } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: taxes = [] } = useQuery(taxesQuery(workspaceId));
  const { data: adMetrics = [] } = useQuery(adMetricsDailyQuery(workspaceId));

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  // Cálculo financeiro e de tráfego canônico e verídico
  const grossRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const financials = MetricsEngine.calculateWorkspaceFinancials({
    orders,
    campaigns,
    fixedCosts,
    orderItems,
    gatewayFees,
    taxes,
    adMetricsDaily: adMetrics,
  });

  const totalImpressions = adMetrics.reduce((acc, m) => acc + (m.impressions || 0), 0);
  const totalClicks = adMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);

  const traffic = MetricsEngine.calculateTraffic({
    impressions: totalImpressions,
    clicks: totalClicks,
    spend: financials.adSpend,
    conversions: orders.length,
    revenue: grossRevenue,
  });

  // Análise real do Brain Engine
  const { insights, proposals, healthScore } = BrainEngine.analyzeWorkspace({
    campaigns,
    products,
    orders,
    financials,
    traffic,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "brain",
      text: `Olá! Eu sou o **Costfy Brain**, a camada de inteligência operacional do workspace **${
        active?.workspace.name || "seu negócio"
      }**.\n\nAnalisei seus dados atuais e preparei o diagnóstico da sua operação. Você pode me fazer perguntas sobre seu lucro real, performance de tráfego, anomalias ou aprovar as ações recomendadas abaixo.`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const context = {
      workspaceId: active?.workspace.id || "",
      workspaceName: active?.workspace.name || "Workspace",
      currentPage: "Costfy Brain Hub",
      summary: {
        financials,
        traffic,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCampaigns: campaigns.length,
      },
    };

    setTimeout(() => {
      const responseText = BrainEngine.respondToPrompt(userText, context);
      const brainMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "brain",
        text: responseText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, brainMsg]);
      setLoading(false);
    }, 600);
  }

  async function handleApprove(prop: BrainActionProposal) {
    if (!active) return;
    try {
      const res = await ActionEngine.executeApprovedAction({
        workspaceId: active.workspace.id,
        proposal: prop,
      });
      if (res.success) {
        setExecutedActions((prev) => ({ ...prev, [prop.id]: true }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao executar ação";
      alert(message);
    }
  }

  return (
    <AppShell
      title="Costfy Brain"
      description="Intelligence layer: observação contínua, diagnóstico de anomalias e preparação de ações com controle humano total."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Coluna Esquerda: Chat Interativo (7 colunas) */}
        <section className="editorial-card flex flex-col lg:col-span-7 h-[700px] overflow-hidden">
          <header className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <CostfyMark size={20} state={loading ? "thinking" : "idle"} className="text-accent" />
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Brain Copilot</h3>
                <p className="text-[11px] text-muted-foreground">
                  Sessão operacional contextualizada com dados reais
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-success/10 border border-success/30 px-2.5 py-0.5 text-[11px] font-medium text-success flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                Monitorando
              </span>
            </div>
          </header>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-3.5 text-[13.5px] leading-relaxed",
                  msg.sender === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                    : "mr-auto bg-surface text-foreground border border-border rounded-bl-none",
                )}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span
                  className={cn(
                    "mt-1.5 text-[10px]",
                    msg.sender === "user"
                      ? "text-primary-foreground/70 text-right"
                      : "text-muted-foreground",
                  )}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex items-center gap-2.5 rounded-lg border border-accent/30 bg-accent/5 p-3.5 text-[13px] text-foreground">
                <CostfyMark size={16} state="thinking" className="text-accent" />
                <span>Analisando base de dados e preparando resposta…</span>
              </div>
            )}
          </div>

          {/* Input de Mensagem */}
          <form onSubmit={handleSend} className="border-t border-border p-3.5 bg-surface/60">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre margem, campanhas, lucros ou peça uma recomendação…"
                className="h-11 w-full rounded-md border border-border bg-background pl-4 pr-12 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Enviar mensagem ao Brain"
                className="absolute right-2 grid size-7 place-items-center rounded bg-accent text-accent-foreground disabled:opacity-40 transition-opacity hover:bg-accent/90"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </section>

        {/* Coluna Direita: Insights, Recomendações e Ações (5 colunas) */}
        <section className="space-y-5 lg:col-span-5">
          {/* Health Score do Negócio */}
          <div className="editorial-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="type-label-subtle">Health Score da Operação</span>
                <p className="type-metric-hero mt-1.5 text-foreground">
                  {healthScore}{" "}
                  <span className="text-[14px] text-muted-foreground font-normal">/ 100</span>
                </p>
              </div>
              <div className="grid size-10 place-items-center rounded-md border border-border bg-secondary text-accent">
                <Activity className="size-5" />
              </div>
            </div>
            <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  healthScore >= 75
                    ? "bg-success"
                    : healthScore >= 50
                      ? "bg-warning"
                      : "bg-destructive",
                )}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          {/* Insights Ativos */}
          <div className="editorial-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                <CostfyMark size={16} className="text-accent shrink-0" />
                Insights e Diagnósticos
              </h4>
              <span className="text-[11px] text-muted-foreground font-mono">
                {insights.length} ativo(s)
              </span>
            </div>

            <div className="space-y-2.5">
              {insights.map((ins) => (
                <div
                  key={ins.id}
                  className={cn(
                    "rounded-md border p-3.5 text-[13px] space-y-1.5 transition-colors",
                    ins.severity === "critical"
                      ? "border-destructive/30 bg-destructive/[0.04]"
                      : ins.severity === "warning"
                        ? "border-warning/30 bg-warning/[0.04]"
                        : ins.severity === "success"
                          ? "border-success/30 bg-success/[0.04]"
                          : "border-border bg-surface/50",
                  )}
                >
                  <p className="font-semibold text-foreground flex items-center gap-1.5 text-[13px]">
                    {ins.severity === "critical" && (
                      <AlertTriangle className="size-3.5 text-destructive" />
                    )}
                    {ins.severity === "warning" && (
                      <AlertTriangle className="size-3.5 text-warning" />
                    )}
                    {ins.severity === "success" && <TrendingUp className="size-3.5 text-success" />}
                    {ins.title}
                  </p>
                  <p className="text-muted-foreground text-[12px] leading-relaxed">
                    {ins.description}
                  </p>
                  {ins.recommendation && (
                    <p className="text-[11.5px] font-medium text-foreground pt-1.5 border-t border-border/50">
                      💡 Recomendação: {ins.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ações Preparadas para Aprovação */}
          {proposals.length > 0 && (
            <div className="editorial-card p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Ações Prontas para Aprovação
                </h4>
              </div>

              <div className="space-y-3">
                {proposals.map((prop) => {
                  const isDone = executedActions[prop.id];
                  return (
                    <div
                      key={prop.id}
                      className="rounded-md border border-border bg-surface/60 p-3.5 space-y-3 text-[13px]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-[13px]">
                            {prop.title}
                          </span>
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground border border-border">
                            Risco {prop.riskLevel}
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1">{prop.description}</p>
                      </div>

                      {/* Action Preview Diff */}
                      <div className="rounded border border-border/80 bg-background p-2.5 font-mono text-[11px] space-y-1">
                        <div className="text-muted-foreground">
                          Anterior: {prop.preview.current}
                        </div>
                        <div className="text-primary font-semibold">
                          Proposto: {prop.preview.proposed}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="size-3 text-success" /> Guardrails verificados
                        </span>
                        <button
                          type="button"
                          disabled={isDone}
                          onClick={() => handleApprove(prop)}
                          className={buttonClass(
                            isDone ? "outline" : "primary",
                            "sm",
                            "h-7 text-[11.5px] gap-1 shadow-none",
                          )}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="size-3 text-success" /> Executada
                            </>
                          ) : (
                            "Aprovar & Executar"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
