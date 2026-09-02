import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Command,
  LogOut,
  MoonStar,
  Plug,
  Settings,
  Sun,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { CommandBar } from "@/components/app/command-bar";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { CostfyLogo } from "@/components/brand/costfy-mark";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";

const NAV = [
  { to: "/dashboard", label: "Visão geral", icon: BarChart3 },
  { to: "/integrations", label: "Integrações", icon: Plug },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

export interface AppShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Casca do app autenticado: sidebar global, topo contextual e Command Bar. */
export function AppShell({ title, description, actions, children }: AppShellProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
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
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-14 items-center px-4">
          <Link to="/dashboard" aria-label="Costfy — visão geral">
            <CostfyLogo />
          </Link>
        </div>

        <div className="px-3 pb-3">
          <WorkspaceSwitcher />
        </div>

        <nav className="flex-1 space-y-0.5 px-2" aria-label="Navegação do app">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border p-2">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h1 className="type-h2 truncate text-foreground">{title}</h1>
            {description && (
              <p className="type-body-sm mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {actions}
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
    </div>
  );
}
