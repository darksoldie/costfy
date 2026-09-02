import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, MoonStar, Sun } from "lucide-react";
import { useState } from "react";

import { CostfyLogo } from "@/components/brand/costfy-mark";
import { useTheme } from "@/components/theme-provider";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Produto", to: "/product" },
  { label: "Soluções", to: "/solutions" },
  { label: "Preços", to: "/pricing" },
  { label: "Recursos", to: "/resources" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { session, ready } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Ordem importa: cancelar consultas, limpar cache, encerrar sessão, navegar.
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setOpen(false);
    await navigate({ to: "/login", replace: true });
  }


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link to="/" aria-label="Costfy — início">
          <CostfyLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              resolvedTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            }
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <MoonStar className="size-4" />
            )}
          </button>
          {ready && session ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex h-8 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Abrir app
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Sair
              </button>
            </>
          ) : (

            <>
              <Link
                to="/login"
                className="hidden h-8 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-8 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Começar
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border md:hidden",
          open ? "max-h-64" : "max-h-0 border-t-0",
        )}
        style={{ transition: "max-height 220ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <nav className="flex flex-col gap-0.5 px-4 py-3" aria-label="Principal (mobile)">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {ready && session ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                Abrir app
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Sair
              </button>
            </>
          ) : (

            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Entrar
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}
