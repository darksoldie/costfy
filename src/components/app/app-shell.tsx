import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  Command,
  FileSpreadsheet,
  FileText,
  History,
  LineChart,
  LogOut,
  MoonStar,
  Plug,
  Settings,
  Sparkles,
  Sun,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { CommandBar } from "@/components/app/command-bar";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { CostfyLogo, CostfyMark } from "@/components/brand/costfy-mark";
import { QuickBrainDrawer } from "@/components/brain/quick-brain-drawer";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    title: "PRINCIPAL",
    items: [
      { to: "/dashboard", label: "Visão geral", icon: BarChart3 },
      { to: "/analytics", label: "Analytics", icon: Activity },
    ],
  },
  {
    title: "OPERAÇÃO",
    items: [
      { to: "/marketing", label: "Marketing", icon: LineChart },
      { to: "/sales", label: "Vendas & Produtos", icon: Boxes },
      { to: "/finance", label: "Financeiro (DRE)", icon: FileSpreadsheet },
      { to: "/tracking", label: "Tracking & UTMs", icon: Workflow },
    ],
  },
  {
    title: "INTELIGÊNCIA",
    items: [
      { to: "/brain", label: "Brain Hub", icon: Sparkles },
      { to: "/automations", label: "Automações", icon: Zap },
      { to: "/reports", label: "Relatórios", icon: FileText },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { to: "/integrations", label: "Integrações", icon: Plug },
      { to: "/team", label: "Time", icon: Users },
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
  const [commandOpen, setCommandOpen] = useState(false);
  const [brainOpen, setBrainOpen] = useState(false);
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

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/login", replace: true });
  }

  return (
    <div className="flex min-h-svh bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-14 items-center px-4">
          <Link to="/dashboard" aria-label="Costfy — visão geral">
            <CostfyLogo />
          </Link>
        </div>

        <div className="px-3 pb-3">
          <WorkspaceSwitcher />
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-1" aria-label="Navegação do app">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <p className="px-2.5 text-[10px] font-semibold tracking-wider text-subtle-foreground/80 uppercase">
                {section.title}
              </p>
              {section.items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="space-y-1 border-t border-border p-2">
          <button
            type="button"
            onClick={() => setBrainOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-accent font-medium transition-colors hover:bg-accent/10"
          >
            <CostfyMark size={16} className="text-accent" />
            Quick Brain
            <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ⌘B
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Command className="size-4" aria-hidden />
            Comandos
            <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <MoonStar className="size-4" aria-hidden />
            )}
            Tema
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3.5 backdrop-blur-md sticky top-0 z-30">
          <div className="min-w-0">
            <h1 className="type-h2 truncate text-foreground">{title}</h1>
            {description && (
              <p className="type-body-sm mt-0.5 text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={() => setBrainOpen(true)}
              className={cn(
                buttonClass("secondary", "sm"),
                "border-accent/30 text-accent hover:bg-accent/10 gap-1.5",
              )}
            >
              <Sparkles className="size-3.5" />
              <span className="hidden sm:inline">Brain</span>
            </button>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className={buttonClass("outline", "sm", "md:hidden")}
            >
              ⌘K
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-6">{children}</main>
      </div>

      <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
      <QuickBrainDrawer open={brainOpen} onOpenChange={setBrainOpen} />
    </div>
  );
}
