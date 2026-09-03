import { Link } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

import { useWorkspace } from "@/components/app/workspace-context";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gestor",
  analyst: "Analista",
  media_buyer: "Mídia",
  finance: "Financeiro",
  viewer: "Leitura",
};

/** Seletor de workspace — a identidade do contexto atual, sempre visível. */
export function WorkspaceSwitcher() {
  const { memberships, active, setActiveId, loading } = useWorkspace();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="h-11 animate-pulse rounded-md border border-border bg-secondary/60" />;
  }

  if (!active) {
    return (
      <Link
        to="/onboarding"
        className="flex h-11 items-center gap-2 rounded-md border border-dashed border-border px-3 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden />
        Criar workspace
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-11 w-full items-center gap-2 rounded-md border border-border bg-background px-3 text-left transition-colors hover:border-border-strong"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded bg-primary text-[11px] font-semibold text-primary-foreground">
          {active.workspace.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-foreground">
            {active.workspace.name}
          </span>
          <span className="block text-[11px] text-subtle-foreground">
            {ROLE_LABEL[active.role] ?? active.role}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 rounded-md border border-border bg-card p-1 shadow-[var(--shadow-raised)]">
          {memberships.map((membership) => (
            <button
              key={membership.workspace.id}
              type="button"
              onClick={() => {
                setActiveId(membership.workspace.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-secondary",
                membership.workspace.id === active.workspace.id
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span className="truncate">{membership.workspace.name}</span>
              {membership.workspace.id === active.workspace.id && (
                <Check className="ml-auto size-3.5 text-primary" aria-hidden />
              )}
            </button>
          ))}
          <Link
            to="/onboarding"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded border-t border-border px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Plus className="size-3.5" aria-hidden />
            Novo workspace
          </Link>
        </div>
      )}
    </div>
  );
}
