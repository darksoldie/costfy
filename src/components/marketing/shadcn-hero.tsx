import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  DollarSign,
  LineChart,
  Boxes,
} from "lucide-react";

import { DotPattern } from "@/components/ui/dot-pattern";
import { CostfyMark } from "@/components/brand/costfy-mark";
import { buttonClass } from "@/lib/ui";

export function ShadcnHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background/90 to-surface/40 pt-16 sm:pt-24 pb-20 sm:pb-28">
      {/* Background Dot Pattern */}
      <DotPattern size="md" opacity="medium" fadeStyle="ellipse" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Center Content */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-6 flex justify-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[12.5px] font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/50 shadow-sm"
            >
              <Sparkles className="size-3.5 fill-current text-primary" />
              <span>Costfy 2.0 • Planos Oficiais & Assinatura Mercado Pago</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground text-balance">
            O Sistema Operacional para
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Negócios Digitais
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-[16px] sm:text-lg text-muted-foreground leading-relaxed text-balance">
            Abandone planilhas manuais e números desencontrados. Centralize métricas de tráfego, custos de produto (CMV), DRE gerencial em tempo real e um copilot executivo que prepara ações com aprovação em 1 clique.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className={buttonClass("primary", "lg", "w-full sm:w-auto gap-2 px-7 text-[15px] font-semibold shadow-[var(--shadow-raised)]")}
            >
              <span>Começar Teste de 14 Dias</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              to="/dashboard"
              className={buttonClass("outline", "lg", "w-full sm:w-auto gap-2 px-7 text-[15px] font-medium bg-background/80 hover:bg-secondary")}
            >
              <Zap className="size-4 text-primary" />
              <span>Explorar Cockpit Executivo</span>
            </Link>
          </div>

          {/* Micro-Trust Signals */}
          <div className="mt-6 flex items-center justify-center gap-6 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-success" /> Sem cartão para testar
            </span>
            <span className="text-border">•</span>
            <span>14 dias de acesso completo</span>
            <span className="text-border">•</span>
            <span>Isolamento relacional RLS</span>
          </div>
        </div>

        {/* Hero Interactive Cockpit Preview Frame */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative group">
            {/* Background Ambient Glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[85%] h-64 bg-primary/25 rounded-full blur-3xl pointer-events-none" />

            {/* macOS Cockpit Window */}
            <div className="relative rounded-2xl border border-border/90 bg-card/95 shadow-[var(--shadow-overlay)] backdrop-blur-xl overflow-hidden ring-1 ring-border/40">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-secondary/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground font-medium">
                    costfy.app / cockpit-executivo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[10.5px] font-medium text-success">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    Live Engine
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">⌘K Control Center</span>
                </div>
              </div>

              {/* Window Inner Content */}
              <div className="p-5 sm:p-6 space-y-6 bg-gradient-to-b from-card to-secondary/15">
                {/* 4 Mini KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-xl border border-border/80 bg-surface/60 p-3.5 space-y-1">
                    <span className="type-label-subtle">Receita Bruta</span>
                    <div className="text-xl font-bold text-foreground tabular-nums">R$ 148.520,00</div>
                    <div className="flex items-center gap-1 text-[11px] text-success font-medium">
                      <TrendingUp className="size-3" /> +14.2% vs 7d anteriores
                    </div>
                  </div>

                  <div className="rounded-xl border border-success/30 bg-success/5 p-3.5 space-y-1">
                    <span className="type-label-subtle text-success font-semibold">Lucro Líquido Real</span>
                    <div className="text-xl font-bold text-success tabular-nums">R$ 62.410,00</div>
                    <span className="inline-block rounded bg-success/20 px-1.5 py-0.2 text-[10px] font-bold text-success">
                      Margem 42.0%
                    </span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-surface/60 p-3.5 space-y-1">
                    <span className="type-label-subtle">Investimento em Mídia</span>
                    <div className="text-xl font-bold text-foreground tabular-nums">R$ 38.250,00</div>
                    <div className="text-[11px] text-muted-foreground">Meta Ads + Google Ads</div>
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-1">
                    <span className="type-label-subtle text-primary font-semibold">ROAS Consolidado</span>
                    <div className="text-xl font-bold text-primary tabular-nums">3,88x</div>
                    <div className="text-[11px] text-muted-foreground">Meta: 4.12x • Google: 3.45x</div>
                  </div>
                </div>

                {/* Unit Economics Waterfall Bar */}
                <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <DollarSign className="size-3.5 text-primary" />
                      DRE Visual em Cascata (Unit Economics)
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Deduções em tempo real
                    </span>
                  </div>

                  {/* Multi-segment bar */}
                  <div className="flex h-3.5 w-full overflow-hidden rounded-full border border-border">
                    <div style={{ width: "22%" }} className="bg-amber-500/80" title="CMV: 22%" />
                    <div style={{ width: "6%" }} className="bg-orange-500/80" title="Taxas Checkout: 6%" />
                    <div style={{ width: "8%" }} className="bg-rose-500/80" title="Impostos: 8%" />
                    <div style={{ width: "26%" }} className="bg-blue-500/80" title="Mídia Paga: 26%" />
                    <div style={{ width: "38%" }} className="bg-emerald-500/90" title="Lucro Real: 38%" />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span><strong className="text-foreground">CMV:</strong> R$ 32.674</span>
                    <span><strong className="text-foreground">Gateways:</strong> R$ 8.911</span>
                    <span><strong className="text-foreground">Impostos:</strong> R$ 11.881</span>
                    <span><strong className="text-foreground">Mídia:</strong> R$ 38.250</span>
                    <span className="text-success font-semibold"><strong>Lucro Real:</strong> R$ 56.804</span>
                  </div>
                </div>

                {/* Brain Copilot Action Proposal Card */}
                <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/15 text-accent">
                      <CostfyMark size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">
                          Proposta Executiva do Brain
                        </span>
                        <span className="rounded-full bg-warning/20 px-2 py-0.2 text-[10px] font-bold text-warning border border-warning/30">
                          Atenção Operacional
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Margem do SKU 'Kit Skincare Premium' caiu para 17.5% por aumento de CPC no conjunto 'Lookalike 1%'.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">Guardrail ativo</span>
                    <button
                      type="button"
                      className={buttonClass("primary", "sm", "h-8 text-[12px] font-medium shadow-sm")}
                    >
                      Aprovar Redução de Budget (-25%)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
