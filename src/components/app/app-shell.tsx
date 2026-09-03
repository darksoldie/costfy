import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Command,
  CreditCard,
  FileSpreadsheet,
  FileText,
  History,
  LineChart,
  LogOut,
  Menu,
  MoonStar,
  Plug,
  Search,
  Settings,
  Cpu,
  Sun,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { CommandBar } from "@/components/app/command-bar";
import { useWorkspace } from "@/components/app/workspace-context";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { CostfyLogo, CostfyMark } from "@/components/brand/costfy-mark";
import { QuickBrainDrawer } from "@/components/brain/quick-brain-drawer";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    title: "Principal",
    items: [
      { to: "/dashboard", label: "Visão Geral", icon: BarChart3 },
      { to: "/analytics", label: "Analytics", icon: Activity },
    ],
  },
  {
    title: "Operação",
    items: [
      { to: "/marketing", label: "Marketing & Mídia", icon: LineChart },
      { to: "/sales", label: "Vendas & Catálogo", icon: Boxes },
      { to: "/finance", label: "Financeiro & DRE", icon: FileSpreadsheet },
      { to: "/tracking", label: "Tracking & UTMs", icon: Workflow },
    ],
  },
  {
    title: "Inteligência",
    items: [
      { to: "/brain", label: "Brain Hub", icon: Cpu },
      { to: "/automations", label: "Automações", icon: Zap },
      { to: "/reports", label: "Relatórios", icon: FileText },
    ],
  },
  {
    title: "Sistema",
    items: [
      { to: "/integrations", label: "Integrações", icon: Plug },
      { to: "/team", label: "Time & Papéis", icon: Users },
      { to: "/billing", label: "Faturamento", icon: CreditCard },
      { to: "/audit", label: "Auditoria", icon: History },
      { to: "/settings", label: "Configurações", icon: Settings },
    ],
  },
] as const;

export interface AppShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Casca do app autenticado: sidebar global, topo contextual, Quick Brain e Command Bar. */
export function AppShell({ title, description, actions, children }: AppShellProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { active } = useWorkspace();
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const [brainOpen, setBrainOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setBrainOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/login", replace: true });
  }

  const renderNavContent = () => (
    <>
      <div className="flex h-14 items-center justify-between px-4 hairline-b">
        <Link to="/dashboard" aria-label="Costfy — visão geral" className="flex items-center">
          <CostfyLogo />
        </Link>
        {mobileNavOpen && (
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-secondary md:hidden"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="p-3">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2" aria-label="Navegação do app">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-2.5 text-[10.5px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              {section.title}
            </p>
            {section.items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                activeProps={{
                  className:
                    "bg-primary text-primary-foreground font-semibold shadow-xs",
                }}
              >
                <Icon
                  className="size-4 shrink-0 transition-transform group-hover:scale-105"
                  aria-hidden
                />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="space-y-1 hairline-t p-2.5 bg-sidebar/50">
        <button
          type="button"
          onClick={() => setBrainOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent/10"
        >
          <CostfyMark size={16} className="text-accent shrink-0" />
          <span>Quick Brain</span>
          <kbd className="ml-auto rounded border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘B
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Command className="size-4 shrink-0" aria-hidden />
          <span>Comandos</span>
          <kbd className="ml-auto rounded border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1 pt-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-3.5" aria-hidden />
            ) : (
              <MoonStar className="size-3.5" aria-hidden />
            )}
            <span>{resolvedTheme === "dark" ? "Claro" : "Escuro"}</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-3.5" aria-hidden />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="flex h-full w-72 flex-col border-r border-border bg-sidebar shadow-2xl animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 sm:px-6 backdrop-blur-md">
          {/* Lado Esquerdo: Mobile Trigger & Breadcrumb / Título */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium text-foreground">
                  {active?.workspace.name ?? "Costfy"}
                </span>
                <span>/</span>
                <span className="truncate">{title}</span>
              </div>
              {description && (
                <p className="hidden text-[12px] text-muted-foreground sm:block truncate max-w-xl">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Lado Direito: Global Search Trigger, Quick Brain, Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command Trigger */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden lg:flex items-center gap-2 h-8 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground hover:border-border-strong hover:text-foreground transition-colors"
            >
              <Search className="size-3.5" />
              <span>Buscar ou comando...</span>
              <kbd className="ml-1 rounded border border-border bg-background px-1 py-0.5 font-mono text-[9.5px]">
                ⌘K
              </kbd>
            </button>

            {actions}

            <button
              type="button"
              onClick={() => setBrainOpen(true)}
              className={cn(
                buttonClass("secondary", "sm"),
                "border-accent/30 text-accent hover:bg-accent/10 gap-1.5 h-8 px-2.5",
              )}
            >
              <CostfyMark size={14} className="text-accent shrink-0" />
              <span className="hidden sm:inline text-[12.5px]">Brain</span>
              <kbd className="hidden lg:inline-block rounded border border-accent/20 bg-background px-1 py-0.2 font-mono text-[9px] text-accent">
                ⌘B
              </kbd>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-20 sm:px-6 sm:py-6 md:pb-6">
          {active?.workspace.status === "read_only" && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-[13px] text-destructive">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  <strong>Período de testes finalizado:</strong> Seu workspace está em modo somente leitura. A criação de campanhas, automações e ações está bloqueada.
                </span>
              </div>
              <Link to="/billing" className={buttonClass("primary", "sm", "h-7 text-[12px] gap-1 shrink-0")}>
                <CreditCard className="size-3.5" />
                <span>Reativar no Mercado Pago</span>
              </Link>
            </div>
          )}
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (iOS / Android Native OS Feel) */}
        <nav
          aria-label="Navegação rápida mobile"
          className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background/90 px-2 backdrop-blur-lg md:hidden"
        >
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            <BarChart3 className="size-4" />
            <span className="text-[10px]">Cockpit</span>
          </Link>
          <Link
            to="/finance"
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            <FileSpreadsheet className="size-4" />
            <span className="text-[10px]">Financeiro</span>
          </Link>
          <Link
            to="/sales"
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            <Boxes className="size-4" />
            <span className="text-[10px]">Vendas</span>
          </Link>
          <Link
            to="/marketing"
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            <LineChart className="size-4" />
            <span className="text-[10px]">Mídia</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Menu className="size-4" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>
      </div>

      <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
      <QuickBrainDrawer open={brainOpen} onOpenChange={setBrainOpen} />
    </div>
  );
}
