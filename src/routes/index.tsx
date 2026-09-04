import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Activity,
  Zap,
  ArrowUpRight,
  Check,
  Lock,
  SlidersHorizontal,
  MoreHorizontal,
  FileSpreadsheet,
  Workflow,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Wallet,
  Calendar,
  Bell,
  LayoutDashboard,
  Megaphone,
  ShoppingCart,
  Receipt,
  Crosshair,
  PieChart,
  FileText,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";

import { CostfyLogo, CostfyMark } from "@/components/brand/costfy-mark";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

const TITLE = "Costfy — Entenda seu negócio. Decida melhor.";
const DESCRIPTION =
  "Marketing, vendas, finanças e operação conectados em um único sistema operacional para negócios digitais.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: LandingPage,
});

type ShowcaseTab = "marketing" | "vendas" | "financeiro" | "tracking" | "analytics";

// Ícones vetorizados precisos para as integrações oficiais
function MetaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.58 4.5c-2.5 0-4.45 1.38-5.55 3.32C.36 9 0 10.36 0 11.96c0 1.63.36 3.01 1.03 4.16 1.1 1.93 3.05 3.32 5.55 3.32 2.37 0 4.14-1.16 5.42-3.15 1.28 1.99 3.05 3.15 5.42 3.15 2.5 0 4.45-1.39 5.55-3.32.67-1.15 1.03-2.53 1.03-4.16 0-1.6-.36-2.96-1.03-4.14-1.1-1.94-3.05-3.32-5.55-3.32-2.37 0-4.14 1.16-5.42 3.15C10.72 5.66 8.95 4.5 6.58 4.5zm0 2.55c1.48 0 2.7.9 3.65 2.57L11.5 9.4c-1.13 2.5-2.67 4.9-4.92 4.9-1.5 0-2.65-.96-3.18-2.26-.26-.64-.39-1.42-.39-2.08 0-.66.13-1.44.39-2.08.53-1.3 1.68-2.26 3.18-2.26zm10.84 0c1.5 0 2.65.96 3.18 2.26.26.64.39 1.42.39 2.08 0 .66-.13 1.44-.39 2.08-.53 1.3-1.68 2.26-3.18 2.26-2.25 0-3.79-2.4-4.92-4.9l1.27-2.12c.95-1.67 2.17-2.57 3.65-2.57z" />
    </svg>
  );
}

function GoogleLogo({ className, colored = false }: { className?: string; colored?: boolean }) {
  if (colored) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function TikTokLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.39 0 .76.08 1.1.22V9.12a6.34 6.34 0 0 0-1.1-.1 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.28 8.28 0 0 0 4.88 1.56V6.86a4.84 4.84 0 0 1-1.11-.17z" />
    </svg>
  );
}

function ShopifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 5.1c-.04-.3-.26-.52-.56-.55-.3-.02-.87.05-1.57.25-.26-.8-1.02-1.4-1.92-1.4-.2 0-.4.03-.6.09C12.3 2.45 11.23 2 10.15 2c-1.8 0-3.3 1.25-3.7 2.95-.75.25-1.3.45-1.5.55-.35.15-.45.45-.4.8L2 20.3c.05.45.4.8.85.8h17.3c.45 0 .8-.35.85-.8L17.47 5.1zM12.8 4.2c.2-.05.4-.08.6-.08.5 0 .9.3.95.78l-1.9.55c.08-.65.2-1.1.35-1.25zm-2.65-.6c.9 0 1.6.35 2 .9l-2.8.85c.2-.95.4-1.75.8-1.75zm-1.8 1.35c.15-.3.4-.6.75-.85l2.4-.75c-.3.8-.45 1.5-.55 2.15l-2.6.55zm2.75 14.15c-.25 0-.5-.05-.7-.15-.45-.25-.65-.7-.65-1.2 0-.95.85-1.45 1.7-1.85.8-.4 1.35-.8 1.35-1.35 0-.45-.35-.75-.9-.75-.6 0-1.15.35-1.5.8l-.9-.95c.55-.65 1.35-1.05 2.4-1.05 1.3 0 2.2.75 2.2 1.95 0 1-.8 1.5-1.7 1.95-.8.4-1.3.8-1.3 1.3 0 .2.1.4.35.5.25.1.55.15.9.15.7 0 1.35-.35 1.8-.85l.8.95c-.65.75-1.55 1.25-2.55 1.25z" />
    </svg>
  );
}

function HotmartLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.63 2.1c-.38-.27-.9-.18-1.17.2-.24.34-.65.98-.95 1.62-.75 1.58-1.18 3.32-.42 5.08.08.19.19.37.3.55-.38-.05-.75-.16-1.1-.34-1.2-.62-1.95-1.78-2.18-3.05-.06-.35-.4-.6-.75-.54-.35.06-.6.4-.54.75.32 1.85 1.45 3.5 3.16 4.38.7.36 1.46.54 2.22.56-.16.3-.35.58-.57.84-1.38 1.65-3.6 2.3-5.55 1.62-.33-.12-.7.06-.82.4-.12.33.06.7.4.82 2.58.9 5.5.08 7.32-2.1 1.05-1.25 1.55-2.8 1.55-4.38 0-1.92-.7-3.78-1.9-5.36zM12 11.2c-.3 0-.6.04-.88.13.25.68.7 1.28 1.3 1.7.2.14.4.26.63.35-.12-.6-.37-1.18-.75-1.68-.1-.18-.2-.34-.3-.5zM12 21.9c-4.4 0-8-3.6-8-8 0-1.8.6-3.5 1.7-4.9.2-.26.6-.3.85-.1.26.2.3.6.1.85-.9 1.15-1.4 2.55-1.4 4.15 0 3.7 3 6.7 6.7 6.7 3.4 0 6.2-2.5 6.7-5.8.05-.36.37-.62.73-.57.36.05.62.37.57.73-.6 4-4 7.04-7.95 7.04z" />
    </svg>
  );
}

function KiwifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 14.5l-3.2-3.8v3.8H8.2V7.5h1.8v3.9l3.1-3.9h2.3l-3.5 4.3 3.8 4.7h-2.5z" />
    </svg>
  );
}

function MercadoPagoLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9zm-1.1 4.5h2.2v1.5a3.1 3.1 0 0 1 2.3 3c0 1.8-1.3 3.1-3.4 3.1h-.9v2.4h-2.2V7.5zm2.2 5.5c.8 0 1.3-.5 1.3-1.1 0-.7-.5-1.1-1.3-1.1h-.9v2.2h.9z" />
    </svg>
  );
}

const INTEGRATIONS = [
  { name: "Meta Ads", Icon: MetaLogo },
  { name: "Google Ads", Icon: GoogleLogo },
  { name: "TikTok Ads", Icon: TikTokLogo },
  { name: "Shopify", Icon: ShopifyLogo },
  { name: "Hotmart", Icon: HotmartLogo },
  { name: "Kiwify", Icon: KiwifyLogo },
  { name: "Mercado Pago", Icon: MercadoPagoLogo },
];

function LandingPage() {
  const [activeShowcase, setActiveShowcase] = useState<ShowcaseTab>("marketing");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary font-sans antialiased">
      {/* ==================================================
          1. HEADER
          ================================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Esquerda: Costfy */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <CostfyLogo markSize={24} />
          </Link>

          {/* Centro: Navegação simples */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-muted-foreground">
            <a href="#showcase" className="transition-colors hover:text-foreground">
              Produto
            </a>
            <a href="#storytelling" className="transition-colors hover:text-foreground">
              Soluções
            </a>
            <a href="#recursos" className="transition-colors hover:text-foreground">
              Recursos
            </a>
            <Link to="/pricing" className="transition-colors hover:text-foreground">
              Preços
            </Link>
            <a href="#sobre" className="transition-colors hover:text-foreground">
              Sobre
            </a>
          </nav>

          {/* Direita: Entrar e Criar conta (azul Costfy sólido) */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ==================================================
            2. HERO — Editorial, memorável e centrada no produto
            ================================================== */}
        <section className="relative overflow-hidden border-b border-border/60 bg-background pt-10 sm:pt-14 pb-12 sm:pb-16">
          {/* Assinatura gráfica sutil derivada da geometria do símbolo Costfy */}
          <div className="pointer-events-none absolute -left-20 top-20 -z-10 select-none overflow-hidden text-primary/[0.07] dark:text-primary/[0.12]">
            <svg width="480" height="480" viewBox="0 0 200 200" fill="none" role="img" aria-hidden="true">
              <path
                d="M152 44 A 76 76 0 1 0 152 156"
                stroke="currentColor"
                strokeWidth="24"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Top Row: Headline à esquerda + 4 Métricas à direita */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              {/* Esquerda: Headline, Subheadline, CTAs e Microcopy com Motion Stagger */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full lg:w-[42%] space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.15rem] font-bold tracking-tight text-foreground leading-[1.12]">
                  Entenda o que está<br />
                  acontecendo.<br />
                  Saiba o que <span className="text-primary">fazer depois.</span>
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Marketing, vendas e finanças conectados<br className="hidden sm:inline" />
                  em um único sistema operacional.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/signup"
                    className="inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 sm:px-6 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Começar agora</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="#showcase"
                    className="inline-flex h-10 sm:h-11 items-center justify-center rounded-lg border border-border/80 bg-background px-5 sm:px-6 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/60 active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
                  >
                    Ver produto
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-0.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>14 dias grátis · sem cartão</span>
                </div>
              </motion.div>

              {/* Direita: 4 Metric Cards com AnimatedNumber */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="w-full lg:w-[58%] grid grid-cols-2 sm:grid-cols-4 gap-3 xl:gap-3.5"
              >
                {/* Card 1: Receita Bruta */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs space-y-2 hover:border-border-strong transition-all">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center shrink-0">
                      <DollarSign className="size-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      Receita Bruta
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                    <AnimatedNumber
                      value={284920}
                      format={(n) => `R$ ${n.toLocaleString("pt-BR")}`}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3 shrink-0" />
                    <span>18,4%</span>
                    <span className="text-muted-foreground font-normal">vs 7 dias anteriores</span>
                  </div>
                </div>

                {/* Card 2: Lucro Líquido */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs space-y-2 hover:border-border-strong transition-all">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Wallet className="size-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      Lucro Líquido
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                    <AnimatedNumber
                      value={94130}
                      format={(n) => `R$ ${n.toLocaleString("pt-BR")}`}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3 shrink-0" />
                    <span>33,0%</span>
                    <span className="text-muted-foreground font-normal">vs 7 dias anteriores</span>
                  </div>
                </div>

                {/* Card 3: ROAS Consolidado */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs space-y-2 hover:border-border-strong transition-all">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center shrink-0">
                      <BarChart3 className="size-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      ROAS Consolidado
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                    <AnimatedNumber
                      value={4.16}
                      format={(n) => `${n.toFixed(2)}x`}
                    />
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Meta: 4,2x
                  </div>
                </div>

                {/* Card 4: Investimento */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs space-y-2 hover:border-border-strong transition-all">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                      <TrendingDown className="size-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      Investimento
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                    <AnimatedNumber
                      value={68400}
                      format={(n) => `R$ ${n.toLocaleString("pt-BR")}`}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                    <TrendingDown className="size-3 shrink-0" />
                    <span>4,6%</span>
                    <span className="text-muted-foreground font-normal">vs 7 dias anteriores</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Middle Row: Dashboard Window + Painel Lateral do Brain */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-8"
            >
              {/* Janela Principal do Dashboard (Cockpit) */}
              <div className="w-full lg:flex-1 min-w-0 rounded-2xl border border-border/80 bg-card shadow-2xl shadow-black/[0.04] overflow-hidden">
                {/* Barra do Navegador */}
                <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-[#EF4444]" />
                    <div className="size-2.5 rounded-full bg-[#F59E0B]" />
                    <div className="size-2.5 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-background/80 border border-border/60 px-3 py-0.5 text-[11px] font-mono text-muted-foreground shadow-2xs">
                    <Lock className="size-3 text-muted-foreground/70" />
                    <span>app.costfy.com.br</span>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Estrutura Interna do Sistema: Sidebar Escura + Área Operacional */}
                <div className="flex flex-col sm:flex-row min-h-[460px]">
                  {/* Sidebar Escura */}
                  <div className="w-full sm:w-44 lg:w-48 bg-[#0F172A] text-slate-300 p-3.5 flex flex-col justify-between shrink-0 select-none">
                    <div className="space-y-4">
                      {/* Logo Costfy na Sidebar */}
                      <div className="flex items-center gap-2 px-1.5 py-1">
                        <CostfyMark size={20} />
                        <span className="font-bold text-sm text-white tracking-wider">COSTFY</span>
                      </div>

                      {/* Lista de Navegação */}
                      <nav className="space-y-0.5 text-xs font-medium">
                        <div className="flex items-center gap-2.5 rounded-md bg-primary/20 text-white font-semibold px-2.5 py-1.5">
                          <LayoutDashboard className="size-3.5 text-primary" />
                          <span>Visão Geral</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <Megaphone className="size-3.5" />
                          <span>Marketing</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <ShoppingCart className="size-3.5" />
                          <span>Vendas</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <Receipt className="size-3.5" />
                          <span>Financeiro</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <Crosshair className="size-3.5" />
                          <span>Tracking</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <PieChart className="size-3.5" />
                          <span>Analytics</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <FileText className="size-3.5" />
                          <span>Relatórios</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <Workflow className="size-3.5" />
                          <span>Automações</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors">
                          <CostfyMark size={14} />
                          <span>Brain</span>
                        </div>
                      </nav>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 mt-4">
                      <div className="flex items-center gap-2.5 rounded-md text-slate-400 hover:text-white px-2.5 py-1.5 text-xs font-medium transition-colors">
                        <Settings className="size-3.5" />
                        <span>Configurações</span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Principal do Dashboard */}
                  <div className="flex-1 bg-background p-4 sm:p-5 space-y-4 min-w-0">
                    {/* Topbar de Conteúdo */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-border/60">
                      <h2 className="text-base font-bold text-foreground tracking-tight">
                        Visão Geral
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>01 - 30 Mai, 2024</span>
                          <ChevronDown className="size-3 text-muted-foreground" />
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground">
                          <SlidersHorizontal className="size-3 text-muted-foreground" />
                          <span>Personalizar</span>
                        </div>
                        <div className="relative flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                          <Bell className="size-3.5" />
                          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                          CF
                        </div>
                      </div>
                    </div>

                    {/* Linha de Gráficos: Principal (30 dias) + Secundário (Canais Donut) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Gráfico Principal: Receita, Investimento e Lucro */}
                      <div className="md:col-span-7 rounded-xl border border-border/80 bg-card p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            Receita, Investimento e Lucro (30 dias)
                          </span>
                          <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                              <span className="size-2 rounded-full bg-[#2563EB]" /> Receita
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="size-2 rounded-full bg-[#F59E0B]" /> Investimento
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="size-2 rounded-full bg-[#10B981]" /> Lucro
                            </span>
                          </div>
                        </div>

                        {/* Gráfico SVG com Eixos e Curvas Precisas */}
                        <div className="h-32 sm:h-36 w-full pt-1">
                          <svg className="w-full h-full" viewBox="0 0 460 146" preserveAspectRatio="none">
                            {/* Linhas de Grade e Eixo Y */}
                            <text x="2" y="16" className="text-[9px] fill-muted-foreground/80 font-mono">250k</text>
                            <line x1="30" y1="13" x2="455" y2="13" stroke="currentColor" className="text-border/40" strokeDasharray="2 2" />

                            <text x="2" y="39" className="text-[9px] fill-muted-foreground/80 font-mono">200k</text>
                            <line x1="30" y1="36" x2="455" y2="36" stroke="currentColor" className="text-border/40" strokeDasharray="2 2" />

                            <text x="2" y="62" className="text-[9px] fill-muted-foreground/80 font-mono">150k</text>
                            <line x1="30" y1="59" x2="455" y2="59" stroke="currentColor" className="text-border/40" strokeDasharray="2 2" />

                            <text x="2" y="85" className="text-[9px] fill-muted-foreground/80 font-mono">100k</text>
                            <line x1="30" y1="82" x2="455" y2="82" stroke="currentColor" className="text-border/40" strokeDasharray="2 2" />

                            <text x="6" y="108" className="text-[9px] fill-muted-foreground/80 font-mono">50k</text>
                            <line x1="30" y1="105" x2="455" y2="105" stroke="currentColor" className="text-border/40" strokeDasharray="2 2" />

                            <text x="12" y="131" className="text-[9px] fill-muted-foreground/80 font-mono">0</text>
                            <line x1="30" y1="128" x2="455" y2="128" stroke="currentColor" className="text-border/70" />

                            {/* Receita (Azul) */}
                            <path
                              d="M35,96 L100,74 L170,88 L240,54 L310,68 L380,42 L450,22"
                              fill="none"
                              stroke="#2563EB"
                              strokeWidth="2.2"
                            />
                            {[
                              [35, 96], [100, 74], [170, 88], [240, 54], [310, 68], [380, 42], [450, 22]
                            ].map(([cx, cy], i) => (
                              <circle key={i} cx={cx} cy={cy} r="2.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.2" />
                            ))}

                            {/* Investimento (Laranja) */}
                            <path
                              d="M35,118 L100,112 L170,110 L240,102 L310,97 L380,95 L450,90"
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="1.8"
                            />
                            {[
                              [35, 118], [100, 112], [170, 110], [240, 102], [310, 97], [380, 95], [450, 90]
                            ].map(([cx, cy], i) => (
                              <circle key={i} cx={cx} cy={cy} r="2.2" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />
                            ))}

                            {/* Lucro (Verde) */}
                            <path
                              d="M35,108 L100,98 L170,102 L240,82 L310,88 L380,72 L450,52"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2"
                            />
                            {[
                              [35, 108], [100, 98], [170, 102], [240, 82], [310, 88], [380, 72], [450, 52]
                            ].map(([cx, cy], i) => (
                              <circle key={i} cx={cx} cy={cy} r="2.4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
                            ))}

                            {/* Datas no Eixo X */}
                            <text x="35" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">01 Mai</text>
                            <text x="100" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">06 Mai</text>
                            <text x="170" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">11 Mai</text>
                            <text x="240" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">16 Mai</text>
                            <text x="310" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">21 Mai</text>
                            <text x="380" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">26 Mai</text>
                            <text x="445" y="142" className="text-[8.5px] fill-muted-foreground/80 font-mono" textAnchor="middle">31 Mai</text>
                          </svg>
                        </div>
                      </div>

                      {/* Gráfico Secundário: Canais de Marketing Donut */}
                      <div className="md:col-span-5 rounded-xl border border-border/80 bg-card p-3.5 space-y-2">
                        <span className="text-xs font-semibold text-foreground block">
                          Canais de Marketing
                        </span>
                        <div className="flex items-center justify-center sm:justify-between gap-3 pt-1">
                          {/* Donut SVG */}
                          <div className="relative size-28 sm:size-32 shrink-0">
                            <svg className="size-full -rotate-90" viewBox="0 0 130 130">
                              {/* Background Circle */}
                              <circle cx="65" cy="65" r="46" fill="transparent" stroke="currentColor" className="text-muted/20" strokeWidth="16" />
                              {/* Meta Ads (56%) */}
                              <circle
                                cx="65"
                                cy="65"
                                r="46"
                                fill="transparent"
                                stroke="#2563EB"
                                strokeWidth="16"
                                strokeDasharray="161.85 289.03"
                                strokeDashoffset="0"
                              />
                              {/* Google Ads (23%) */}
                              <circle
                                cx="65"
                                cy="65"
                                r="46"
                                fill="transparent"
                                stroke="#10B981"
                                strokeWidth="16"
                                strokeDasharray="66.48 289.03"
                                strokeDashoffset="-161.85"
                              />
                              {/* TikTok Ads (11%) */}
                              <circle
                                cx="65"
                                cy="65"
                                r="46"
                                fill="transparent"
                                stroke="#8B5CF6"
                                strokeWidth="16"
                                strokeDasharray="31.79 289.03"
                                strokeDashoffset="-228.33"
                              />
                              {/* Outros (10%) */}
                              <circle
                                cx="65"
                                cy="65"
                                r="46"
                                fill="transparent"
                                stroke="#94A3B8"
                                strokeWidth="16"
                                strokeDasharray="28.90 289.03"
                                strokeDashoffset="-260.12"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                              <span className="text-xs font-bold text-foreground font-sans">
                                R$ 68.400
                              </span>
                              <span className="text-[9px] text-muted-foreground font-medium">
                                Investimento
                              </span>
                            </div>
                          </div>

                          {/* Legenda dos Canais */}
                          <div className="space-y-1.5 text-[11px] font-medium">
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-foreground">
                                <span className="size-2 rounded-full bg-[#2563EB]" /> Meta Ads
                              </span>
                              <span className="text-muted-foreground font-mono">56%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-foreground">
                                <span className="size-2 rounded-full bg-[#10B981]" /> Google Ads
                              </span>
                              <span className="text-muted-foreground font-mono">23%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-foreground">
                                <span className="size-2 rounded-full bg-[#8B5CF6]" /> TikTok Ads
                              </span>
                              <span className="text-muted-foreground font-mono">11%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-1.5 text-foreground">
                                <span className="size-2 rounded-full bg-[#94A3B8]" /> Outros
                              </span>
                              <span className="text-muted-foreground font-mono">10%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabela de Campanhas em Destaque */}
                    <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-2">
                      <span className="text-xs font-bold text-foreground block">
                        Campanhas em Destaque
                      </span>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border/60 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                              <th className="pb-2 text-left font-medium">Campanha</th>
                              <th className="pb-2 text-left font-medium">Canal</th>
                              <th className="pb-2 text-right font-medium">Investimento</th>
                              <th className="pb-2 text-right font-medium">Receita</th>
                              <th className="pb-2 text-right font-medium">ROAS</th>
                              <th className="pb-2 text-right font-medium">CPA</th>
                              <th className="pb-2 text-center font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-mono text-[11.5px]">
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 font-sans font-medium text-foreground">
                                [Escala | Lookalike 1% Checkout
                              </td>
                              <td className="py-2 font-sans">
                                <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-medium">
                                  <MetaLogo className="size-3.5 text-[#0668E1]" /> Meta Ads
                                </span>
                              </td>
                              <td className="py-2 text-right text-foreground">R$ 24.800</td>
                              <td className="py-2 text-right text-foreground">R$ 114.080</td>
                              <td className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                4,60x
                              </td>
                              <td className="py-2 text-right text-muted-foreground">R$ 38,20</td>
                              <td className="py-2 text-center font-sans">
                                <span className="inline-flex rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Ativa
                                </span>
                              </td>
                            </tr>

                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 font-sans font-medium text-foreground">
                                Pesquisa | Produto X
                              </td>
                              <td className="py-2 font-sans">
                                <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-medium">
                                  <GoogleLogo className="size-3.5" colored /> Google Ads
                                </span>
                              </td>
                              <td className="py-2 text-right text-foreground">R$ 12.700</td>
                              <td className="py-2 text-right text-foreground">R$ 41.930</td>
                              <td className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                3,30x
                              </td>
                              <td className="py-2 text-right text-muted-foreground">R$ 19,70</td>
                              <td className="py-2 text-center font-sans">
                                <span className="inline-flex rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Ativa
                                </span>
                              </td>
                            </tr>

                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 font-sans font-medium text-foreground">
                                Conversão | Vitrine
                              </td>
                              <td className="py-2 font-sans">
                                <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-medium">
                                  <TikTokLogo className="size-3.5 text-foreground" /> TikTok Ads
                                </span>
                              </td>
                              <td className="py-2 text-right text-foreground">R$ 8.900</td>
                              <td className="py-2 text-right text-foreground">R$ 26.540</td>
                              <td className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                2,98x
                              </td>
                              <td className="py-2 text-right text-muted-foreground">R$ 23,10</td>
                              <td className="py-2 text-center font-sans">
                                <span className="inline-flex rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                  Pausada
                                </span>
                              </td>
                            </tr>

                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 font-sans font-medium text-foreground">
                                Remarketing | Carrinho
                              </td>
                              <td className="py-2 font-sans">
                                <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-medium">
                                  <MetaLogo className="size-3.5 text-[#0668E1]" /> Meta Ads
                                </span>
                              </td>
                              <td className="py-2 text-right text-foreground">R$ 6.000</td>
                              <td className="py-2 text-right text-foreground">R$ 17.820</td>
                              <td className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                2,97x
                              </td>
                              <td className="py-2 text-right text-muted-foreground">R$ 17,40</td>
                              <td className="py-2 text-center font-sans">
                                <span className="inline-flex rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Ativa
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="text-center pt-1.5">
                        <a
                          href="#showcase"
                          className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Ver todas as campanhas <ArrowRight className="size-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel Contextual do Brain (À Direita do Preview) */}
              <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 self-center">
                <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xl shadow-black/[0.03] space-y-4">
                  {/* Header do Brain */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="text-xs font-semibold text-foreground/90">
                        Brain · Insight Operacional
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Últimos 7 dias
                    </span>
                  </div>

                  {/* Conteúdo do Insight */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug tracking-tight">
                      CPA aumentou 32%<br />
                      nos últimos 7 dias.
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A alta está concentrada em duas campanhas com queda de conversão no checkout.
                    </p>
                  </div>

                  {/* Bloco de Impacto Estimado */}
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Impacto estimado
                    </span>
                    <div className="text-2xl font-bold font-mono text-rose-500 tracking-tight">
                      -R$ 14.250
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      no lucro projetado
                    </span>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      className="flex-1 h-9 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                    >
                      Ver análise
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-9 rounded-lg bg-primary hover:bg-primary/90 text-xs font-semibold text-primary-foreground transition-colors shadow-xs cursor-pointer"
                    >
                      Preparar ajuste
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Base da Hero: Conectado às Principais Plataformas */}
            <div className="mt-12 sm:mt-16 text-center space-y-5">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground/80">
                CONECTADO ÀS PRINCIPAIS PLATAFORMAS
              </p>
              <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-10 opacity-90">
                <div className="flex items-center gap-2 text-foreground">
                  <MetaLogo className="size-5 text-[#0668E1]" />
                  <span className="font-bold text-base tracking-tight">Meta</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <GoogleLogo className="size-5" colored />
                  <span className="font-bold text-base tracking-tight">Google</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <TikTokLogo className="size-5 text-foreground" />
                  <span className="font-bold text-base tracking-tight">TikTok</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <ShopifyLogo className="size-5 text-[#95BF47]" />
                  <span className="font-bold text-base tracking-tight">shopify</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <HotmartLogo className="size-5 text-[#FF5722]" />
                  <span className="font-bold text-base tracking-tight">hotmart</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <KiwifyLogo className="size-5 text-[#00E377]" />
                  <span className="font-bold text-base tracking-tight">kiwify</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <MercadoPagoLogo className="size-5 text-[#009EE3]" />
                  <span className="font-bold text-base tracking-tight">mercado pago</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            3. PRODUCT SHOWCASE — "Seu negócio inteiro, em contexto."
            ================================================== */}
        <section id="showcase" className="border-b border-border/60 bg-background py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-2.5 mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Visão Integrada
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Seu negócio inteiro, em contexto.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Módulos operacionais desenhados para responder exatamente o que importa: margem, retorno e previsibilidade de caixa.
              </p>
            </div>

            {/* Barra de Seleção de Módulos */}
            <div className="flex items-center justify-center border-b border-border">
              <nav className="-mb-px flex flex-wrap gap-2 sm:gap-8 justify-center" aria-label="Módulos do Sistema">
                {(
                  [
                    { id: "marketing", label: "Marketing", icon: TrendingUp },
                    { id: "vendas", label: "Vendas", icon: DollarSign },
                    { id: "financeiro", label: "Financeiro", icon: BarChart3 },
                    { id: "tracking", label: "Tracking", icon: Activity },
                    { id: "analytics", label: "Analytics", icon: Layers },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeShowcase === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveShowcase(tab.id)}
                      className={cn(
                        "flex items-center gap-2 pb-3.5 px-2 text-xs sm:text-sm font-medium transition-colors border-b-2 cursor-pointer",
                        isActive
                          ? "border-primary text-primary font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Painel Operacional Principal Correspondente */}
            <div className="mt-8 rounded-xl border border-border bg-card shadow-xs p-5 sm:p-7">
              {activeShowcase === "marketing" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Painel de Marketing & Mídia Paga
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Centralize orçamentos, ROAS consolidado e CPA real por campanha de todos os canais.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span>Total Investido: <strong className="text-foreground">R$ 68.400</strong></span>
                      <span className="text-border">·</span>
                      <span>Receita: <strong className="text-foreground">R$ 284.920</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Meta Ads</span>
                      <div className="text-xl font-bold text-foreground font-mono">R$ 39.300</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Receita: R$ 170.630</span>
                        <span className="text-emerald-600 font-semibold font-mono">4,34x ROAS</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Google Ads</span>
                      <div className="text-xl font-bold text-foreground font-mono">R$ 29.100</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Receita: R$ 114.290</span>
                        <span className="text-emerald-600 font-semibold font-mono">3,92x ROAS</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">TikTok & Outros</span>
                      <div className="text-xl font-bold text-foreground font-mono">Em teste</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conexão rápida</span>
                        <span className="text-primary font-medium">Conectar conta</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcase === "vendas" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Operação de Vendas & Checkout
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Acompanhe pedidos aprovados, conversão por gateway e ticket médio por produto.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span>Pedidos: <strong className="text-foreground">1.625</strong></span>
                      <span className="text-border">·</span>
                      <span>Ticket Médio: <strong className="text-foreground">R$ 175,30</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">Conversão de Checkout</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">4,2%</div>
                      <span className="text-[11px] text-emerald-600 font-medium">+0.6% vs benchmark</span>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">Aprovação Cartão</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">91,4%</div>
                      <span className="text-[11px] text-muted-foreground">Hotmart & Kiwify</span>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">Conversão Pix</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">84,8%</div>
                      <span className="text-[11px] text-muted-foreground">Instantâneo</span>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">Reembolsos & Chargebacks</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">1,1%</div>
                      <span className="text-[11px] text-muted-foreground">Dentro do limite</span>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcase === "financeiro" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        DRE Gerencial em Cascata
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cálculo automático de deduções por SKU: CMV, taxas financeiras, impostos e custos fixos.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded">
                      Margem Líquida Real: 33,0%
                    </span>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-border">
                        <tr className="bg-muted/30">
                          <td className="py-2.5 px-4 font-sans font-semibold text-foreground">(=) Receita Bruta Consolidada</td>
                          <td className="py-2.5 px-4 text-right font-bold text-foreground">R$ 284.920,00</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">100,0%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-sans text-muted-foreground">(-) Impostos Faturados (Simples / Lucro Presumido)</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">R$ 23.363,44</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">8,2%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-sans text-muted-foreground">(-) Taxas de Plataforma & Gateway (Checkout)</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">R$ 16.525,36</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">5,8%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-sans text-muted-foreground">(-) Custo de Mercadoria Vendida (CMV Unitário)</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">R$ 68.380,80</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">24,0%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-sans text-muted-foreground">(-) Investimento em Mídia Paga (Meta + Google)</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">R$ 68.400,00</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">24,0%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-sans text-muted-foreground">(-) Custos Fixos Operacionais Rateados</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">R$ 14.120,40</td>
                          <td className="py-2.5 px-4 text-right text-muted-foreground">5,0%</td>
                        </tr>
                        <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold">
                          <td className="py-3 px-4 font-sans text-emerald-700 dark:text-emerald-400">(=) Lucro Líquido Real em Caixa</td>
                          <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400 font-bold">R$ 94.130,00</td>
                          <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400">33,0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeShowcase === "tracking" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Tracking First-Party & Atribuição de Conversão
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Script próprio ultraleve imune a restrições de navegadores para reconciliação ponta a ponta.
                      </p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      Conexão em 1 linha de código
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                      <span className="text-xs font-semibold text-foreground">1. Clique & Sessão</span>
                      <p className="text-xs text-muted-foreground">
                        Captura parâmetros UTM e SessionID único sem depender de cookies de terceiros.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                      <span className="text-xs font-semibold text-foreground">2. Evento de Checkout</span>
                      <p className="text-xs text-muted-foreground">
                        Vincula o carrinho ao LeadID antes do direcionamento ao gateway.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                      <span className="text-xs font-semibold text-foreground">3. Venda Reconciliada</span>
                      <p className="text-xs text-muted-foreground">
                        Webhook do processador confirma pagamento e fecha a atribuição do anúncio exato.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcase === "analytics" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Analytics & Retenção Operacional
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Relatórios consolidados para tomada de decisão diária sem perda de tempo com planilhas manuais.
                      </p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      Atualização Contínua
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">LTV Médio (90 dias)</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">R$ 412,00</div>
                      <span className="text-[11px] text-muted-foreground">2,35 compras por cliente</span>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">CAC Médio Blended</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">R$ 42,10</div>
                      <span className="text-[11px] text-emerald-600 font-medium">LTV/CAC: 9,7x</span>
                    </div>
                    <div className="rounded-lg border border-border p-4 bg-background">
                      <span className="text-xs text-muted-foreground">Margem de Contribuição</span>
                      <div className="text-2xl font-bold text-foreground font-mono mt-1">66,2%</div>
                      <span className="text-[11px] text-muted-foreground">Após deduções de venda</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            4. STORYTELLING — 3 blocos grandes alternados (Produto > Texto)
            ================================================== */}
        <section id="storytelling" className="border-b border-border/60 bg-background py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
            {/* BLOCO 1: "Entenda de onde o dinheiro vem." (Marketing + Sales) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Origem da Receita
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Entenda de onde o dinheiro vem.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conecte campanhas de tráfego aos pedidos aprovados no checkout. Identifique qual criativo e canal gerou cada venda com ROAS real e atribuição direta.
                </p>
                <div className="pt-1 space-y-1.5 text-xs font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Visão unificada de Meta Ads, Google Ads e TikTok Ads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Rastreamento desde o clique inicial até o webhook da compra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Identificação de criativos com maior volume e margem</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="text-xs font-semibold text-foreground">
                      Pedidos Recentes Atribuídos à Mídia
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">Tempo Real</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        sku: "Plano Anual Premium",
                        canal: "Meta Ads",
                        campanha: "[Escala] Lookalike 1%",
                        valor: "R$ 497,00",
                        tempo: "há 3 min",
                      },
                      {
                        sku: "Mentoria Individual",
                        canal: "Google Ads",
                        campanha: "[Search] Fundo de Funil",
                        valor: "R$ 1.200,00",
                        tempo: "há 12 min",
                      },
                      {
                        sku: "Acesso Vitalício Pro",
                        canal: "Meta Ads",
                        campanha: "[Advantage+] Criativos UGC",
                        valor: "R$ 297,00",
                        tempo: "há 21 min",
                      },
                    ].map((order, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-border/80 bg-background text-xs"
                      >
                        <div>
                          <span className="font-semibold text-foreground block">{order.sku}</span>
                          <span className="text-muted-foreground text-[11px]">
                            {order.canal} · {order.campanha}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold text-foreground block">
                            {order.valor}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{order.tempo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCO 2: "Saiba para onde ele vai." (Financeiro + DRE + margem) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="text-xs font-semibold text-foreground">
                      Decomposição Analítica de Custos (DRE Operacional)
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">Por SKU</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Produto: Kit Skincare Avançado (SKU-102)</span>
                        <span className="font-mono">R$ 197,00</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[11px] text-muted-foreground font-mono pt-1">
                        <div>CMV: R$ 42,00</div>
                        <div>Taxa: R$ 13,80</div>
                        <div>Mídia: R$ 51,20</div>
                        <div className="text-emerald-600 font-semibold">Lucro: R$ 90,00</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Produto: Assinatura Trimestral (SKU-205)</span>
                        <span className="font-mono">R$ 349,00</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[11px] text-muted-foreground font-mono pt-1">
                        <div>CMV: R$ 0,00</div>
                        <div>Taxa: R$ 24,40</div>
                        <div>Mídia: R$ 78,60</div>
                        <div className="text-emerald-600 font-semibold">Lucro: R$ 246,00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2 space-y-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Destino do Caixa
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Saiba para onde ele vai.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Faturamento bruto não paga contas. O Costfy deduz automaticamente CMV por SKU, taxas de gateway, impostos e mídia paga para exibir a margem líquida real em caixa.
                </p>
                <div className="pt-1 space-y-1.5 text-xs font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Deduções automáticas de taxas por gateway de pagamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Cadastro de CMV real para produtos físicos e infoprodutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>DRE gerencial em cascata atualizada sem esforço manual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCO 3: "Saiba o que fazer em seguida." (Brain com destaque operacional) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 space-y-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Ação Operacional
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Saiba o que fazer em seguida.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Inteligência contextual que cruza mídia e financeiro. O Brain detecta desvios de CPA e margem antes que drenem o caixa, formulando a correção exata pronta para execução.
                </p>
                <div className="pt-1 space-y-1.5 text-xs font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Detecção contínua de anomalias em CPA, CPC e margem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Guardrails ativos: nenhuma ação roda sem seu comando explícito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Propostas com impacto financeiro auditado e reversível</span>
                  </div>
                </div>
              </div>

              {/* Card com Alto Destaque Visual para Problema, Contexto, Ação e Botões */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-semibold tracking-wide uppercase text-foreground">
                        Anomalia Operacional Detectada
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Últimos 7 dias · Guardrail Ativo
                    </span>
                  </div>

                  {/* Problema Detectado */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Problema Detectado
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                      CPA aumentou 32% nos últimos 7 dias.
                    </h3>
                  </div>

                  {/* Contexto Estruturado */}
                  <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-xs space-y-1">
                    <span className="font-semibold text-foreground block">
                      Contexto Operacional:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      A alta está concentrada em duas campanhas com fadiga de criativos e queda de 18% na conversão do checkout.
                    </p>
                  </div>

                  {/* Ação Recomendada */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-1">
                    <span className="font-semibold text-primary block">
                      Ação Recomendada:
                    </span>
                    <p className="text-foreground/90 leading-relaxed">
                      Pausar criativo com fadiga e redistribuir R$ 450/dia para o conjunto de melhor ROAS (4,60x).
                    </p>
                  </div>

                  {/* Botões e Micro-Garantia */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-muted-foreground">
                      Ação reversível em 1 clique · Sem automação cega
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        className="inline-flex h-9 flex-1 sm:flex-initial items-center justify-center rounded-md border border-border bg-background px-3.5 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
                      >
                        Ver análise
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 flex-1 sm:flex-initial items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                      >
                        Preparar ajuste
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            5. INTEGRAÇÕES — Layout horizontal limpo com logos oficiais
            ================================================== */}
        <section id="recursos" className="border-b border-border/60 bg-background py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Conectividade Nativa
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mt-0.5">
                Integrado às principais plataformas de tráfego, checkout e pagamentos
              </h2>
            </div>

            {/* Linha horizontal limpa com logos vetorizados */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 max-w-5xl mx-auto pt-2">
              {INTEGRATIONS.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors group cursor-default"
                  >
                    <IconComponent className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-semibold tracking-tight">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================
            6. CTA FINAL — Seção final visualmente forte, mas limpa
            ================================================== */}
        <section className="border-b border-border/60 bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Veja seu negócio com clareza.
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Elimine o ruído das planilhas manuais e opere com controle centralizado de mídia, vendas e margem real.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
              >
                <span>Começar agora</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Entrar
              </Link>
            </div>

            <div className="pt-0.5 text-xs text-muted-foreground font-medium">
              14 dias grátis · sem cartão
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================
          7. FOOTER — Simples e empresarial
          ================================================== */}
      <footer id="sobre" className="bg-card py-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <CostfyLogo markSize={22} />
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium text-foreground">
              <a href="#showcase" className="hover:underline">
                Produto
              </a>
              <a href="#storytelling" className="hover:underline">
                Soluções
              </a>
              <a href="#recursos" className="hover:underline">
                Recursos
              </a>
              <Link to="/pricing" className="hover:underline">
                Preços
              </Link>
              <span className="hover:underline cursor-pointer">Privacidade</span>
              <span className="hover:underline cursor-pointer">Termos</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <span>© {new Date().getFullYear()} Costfy Inc. Todos os direitos reservados.</span>
            <span>Sistema Operacional para Negócios Digitais</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
