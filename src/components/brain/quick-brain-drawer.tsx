import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { CostfyMark } from "@/components/brand/costfy-mark";
import { useWorkspace } from "@/components/app/workspace-context";
import { BrainEngine, type BrainActionProposal } from "@/lib/brain-engine";
import { ActionEngine } from "@/lib/action-engine";
import { MetricsEngine } from "@/lib/metrics-engine";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "brain";
  text: string;
  proposals?: BrainActionProposal[];
  timestamp: string;
}

export function QuickBrainDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const location = useLocation();
  const { active } = useWorkspace();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [executedAction, setExecutedAction] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "brain",
      text: `Olá! Eu sou o **Costfy Brain**. Estou conectado ao seu workspace e acompanhando o contexto da tela atual (**${getPageLabel(
        location.pathname,
      )}**). Como posso te ajudar a entender seus dados ou otimizar sua operação agora?`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  if (!open) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Contexto de tela
    const context = {
      workspaceId: active?.workspace.id || "",
      workspaceName: active?.workspace.name || "Workspace",
      businessType: active?.workspace.business_type || "ecommerce",
      currentPage: getPageLabel(location.pathname),
      summary: {
        financials: MetricsEngine.calculateFinancials({ grossRevenue: 0, cogs: 0, adSpend: 0 }),
        traffic: MetricsEngine.calculateTraffic({ impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 }),
        totalOrders: 0,
        totalProducts: 0,
        totalCampaigns: 0,
      },
    };

    setTimeout(() => {
      const responseText = BrainEngine.respondToPrompt(userText, context);
      const brainMsg: Message = {
        id: `b_${Date.now()}`,
        sender: "brain",
        text: responseText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, brainMsg]);
      setLoading(false);
    }, 600);
  }

  async function handleApproveAction(proposal: BrainActionProposal) {
    if (!active) return;
    try {
      const res = await ActionEngine.executeApprovedAction({
        workspaceId: active.workspace.id,
        proposal,
        userId: active.role,
      });
      if (res.success) {
        setExecutedAction(proposal.id);
      }
    } catch (err: any) {
      alert(err?.message || "Erro ao executar ação");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex justify-end bg-background/60 backdrop-blur-sm animate-fade"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Costfy Brain — Copilot Contextual"
        className="flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3.5 bg-surface">
          <div className="flex items-center gap-2.5">
            <CostfyMark size={20} state={loading ? "thinking" : "idle"} className="text-accent" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-foreground">Costfy Brain</span>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                  Contextual
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Lendo: <strong className="text-foreground">{getPageLabel(location.pathname)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar Brain"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[88%] rounded-xl p-3 text-[13px] leading-relaxed",
                msg.sender === "user"
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                  : "mr-auto bg-secondary/80 text-foreground border border-border/60 rounded-bl-none",
              )}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <span
                className={cn(
                  "mt-1 text-[10px]",
                  msg.sender === "user" ? "text-primary-foreground/70 text-right" : "text-subtle-foreground",
                )}
              >
                {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="mr-auto flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3 text-[12.5px] text-foreground">
              <CostfyMark size={14} state="thinking" className="text-accent" />
              <span>Analisando contexto e calculando dados reais…</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-border p-3 bg-surface">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao Brain sobre esta tela…"
              className="h-10 w-full rounded-lg border border-border bg-background pl-3.5 pr-10 text-[13.5px] text-foreground placeholder:text-subtle-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Enviar mensagem"
              className="absolute right-1.5 grid size-7 place-items-center rounded-md bg-accent text-accent-foreground disabled:opacity-40 transition-opacity"
            >
              <Send className="size-3.5" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-subtle-foreground">
            <span>Intelligent Operating System</span>
            <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[9px]">Esc fecha</kbd>
          </div>
        </form>
      </div>
    </div>
  );
}

function getPageLabel(pathname: string): string {
  if (pathname.includes("/dashboard")) return "Visão Geral (Dashboard)";
  if (pathname.includes("/marketing")) return "Marketing & Campanhas";
  if (pathname.includes("/sales")) return "Vendas, Pedidos & Produtos";
  if (pathname.includes("/finance")) return "Financeiro & DRE Real";
  if (pathname.includes("/tracking")) return "Tracking & UTMs";
  if (pathname.includes("/analytics")) return "Analytics Multidimensional";
  if (pathname.includes("/brain")) return "Costfy Brain Hub";
  if (pathname.includes("/automations")) return "Automações & Regras";
  if (pathname.includes("/reports")) return "Relatórios Executivos";
  if (pathname.includes("/integrations")) return "Integrações";
  if (pathname.includes("/team")) return "Time & Permissões";
  if (pathname.includes("/audit")) return "Registro de Auditoria";
  if (pathname.includes("/settings")) return "Configurações";
  return "Costfy";
}
