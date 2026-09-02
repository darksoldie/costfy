import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

/**
 * Command Bar (Cmd/Ctrl+K).
 *
 * Navegação por teclado é o caminho primário do operador; o mouse é o atalho
 * secundário. Por isso o componente é controlado apenas por estado local.
 */
export function CommandBar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const items = useMemo<CommandItem[]>(
    () => [
      { id: "dashboard", label: "Ir para Visão geral", hint: "Painel", run: () => void navigate({ to: "/dashboard" }) },
      { id: "integrations", label: "Ir para Integrações", hint: "Dados", run: () => void navigate({ to: "/integrations" }) },
      { id: "settings", label: "Ir para Configurações", hint: "Workspace", run: () => void navigate({ to: "/settings" }) },
      { id: "onboarding", label: "Criar novo workspace", hint: "Ação", run: () => void navigate({ to: "/onboarding" }) },
      { id: "site", label: "Ver site público", hint: "Marketing", run: () => void navigate({ to: "/" }) },
    ],
    [navigate],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  if (!open) return null;

  function choose(item: CommandItem | undefined) {
    if (!item) return;
    onOpenChange(false);
    item.run();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/70 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Barra de comandos"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-raised)] animate-rise"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(filtered[index]);
            } else if (event.key === "Escape") {
              onOpenChange(false);
            }
          }}
          placeholder="Buscar comandos, telas e ações…"
          className="h-12 w-full border-b border-border bg-transparent px-4 text-[14px] text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              Nenhum comando encontrado.
            </li>
          )}
          {filtered.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setIndex(i)}
                onClick={() => choose(item)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13.5px] transition-colors",
                  i === index
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <span>{item.label}</span>
                <span className="text-[11px] uppercase tracking-wide text-subtle-foreground">
                  {item.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
