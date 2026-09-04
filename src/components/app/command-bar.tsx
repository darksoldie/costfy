import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

/**
 * Command Bar (Cmd/Ctrl+K).
 * Centro de controle operacional e navegação rápida do Costfy.
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
      // Navegação Principal
      {
        id: "dashboard",
        label: "Ir para Cockpit Executivo (Visão geral)",
        hint: "Principal",
        run: () => void navigate({ to: "/dashboard" }),
      },
      {
        id: "analytics",
        label: "Ir para Analytics Multidimensional",
        hint: "Principal",
        run: () => void navigate({ to: "/analytics" }),
      },
      {
        id: "marketing",
        label: "Ir para Marketing & Campanhas de Mídia",
        hint: "Operação",
        run: () => void navigate({ to: "/marketing" }),
      },
      {
        id: "sales",
        label: "Ir para Vendas, Pedidos & Catálogo",
        hint: "Operação",
        run: () => void navigate({ to: "/sales" }),
      },
      {
        id: "finance",
        label: "Ir para Financeiro & DRE Gerencial",
        hint: "Operação",
        run: () => void navigate({ to: "/finance" }),
      },
      {
        id: "tracking",
        label: "Ir para Tracking, UTMs & Atribuição",
        hint: "Operação",
        run: () => void navigate({ to: "/tracking" }),
      },
      {
        id: "brain",
        label: "Ir para Costfy Brain Hub",
        hint: "Inteligência",
        run: () => void navigate({ to: "/brain" }),
      },
      {
        id: "automations",
        label: "Ir para Automações & Regras",
        hint: "Inteligência",
        run: () => void navigate({ to: "/automations" }),
      },
      {
        id: "reports",
        label: "Ir para Relatórios Executivos",
        hint: "Inteligência",
        run: () => void navigate({ to: "/reports" }),
      },
      {
        id: "integrations",
        label: "Ir para Conexões & Integrações",
        hint: "Sistema",
        run: () => void navigate({ to: "/integrations" }),
      },
      {
        id: "team",
        label: "Ir para Gestão de Time & Papéis",
        hint: "Sistema",
        run: () => void navigate({ to: "/team" }),
      },
      {
        id: "audit",
        label: "Ir para Registro de Auditoria Imutável",
        hint: "Sistema",
        run: () => void navigate({ to: "/audit" }),
      },
      {
        id: "settings",
        label: "Ir para Configurações do Workspace",
        hint: "Sistema",
        run: () => void navigate({ to: "/settings" }),
      },
      // Ações Rápidas
      {
        id: "action-order",
        label: "Lançar novo pedido manualmente",
        hint: "Ação Rápida",
        run: () => void navigate({ to: "/sales" }),
      },
      {
        id: "action-campaign",
        label: "Cadastrar nova campanha de tráfego",
        hint: "Ação Rápida",
        run: () => void navigate({ to: "/marketing" }),
      },
      {
        id: "action-cost",
        label: "Adicionar lançamento de custo fixo",
        hint: "Ação Rápida",
        run: () => void navigate({ to: "/finance" }),
      },
      {
        id: "action-utm",
        label: "Gerar novo link rastreado com UTM",
        hint: "Ação Rápida",
        run: () => void navigate({ to: "/tracking" }),
      },
      {
        id: "action-cron",
        label: "Executar e testar regras de automação agora",
        hint: "Ação Rápida",
        run: () => void navigate({ to: "/automations" }),
      },
      {
        id: "onboarding",
        label: "Criar novo workspace",
        hint: "Ação",
        run: () => void navigate({ to: "/onboarding" }),
      },
      {
        id: "pricing",
        label: "Ver planos e limites do workspace",
        hint: "Conta",
        run: () => void navigate({ to: "/pricing" }),
      },
      {
        id: "site",
        label: "Ver página inicial do produto",
        hint: "Início",
        run: () => void navigate({ to: "/" }),
      },
    ],
    [navigate],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.hint.toLowerCase().includes(term) ||
        item.id.includes(term),
    );
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  function choose(item: CommandItem | undefined) {
    if (!item) return;
    onOpenChange(false);
    item.run();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-background/70 px-4 pt-[12vh] backdrop-blur-xs"
          onClick={() => onOpenChange(false)}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Costfy Control Center"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-overlay)]"
            onClick={(event) => event.stopPropagation()}
          >
        <div className="flex items-center border-b border-border px-3.5 bg-surface/50">
          <Search className="size-4 text-muted-foreground shrink-0 mr-2.5" aria-hidden />
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
            placeholder="Buscar comandos, telas, atalhos e ações…"
            className="h-12 w-full bg-transparent text-[14px] text-foreground placeholder:text-subtle-foreground focus:outline-none"
          />
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 && (
            <li className="px-3 py-8 text-center text-[13px] text-muted-foreground">
              Nenhum comando ou tela encontrado para &ldquo;{query}&rdquo;.
            </li>
          )}
          {filtered.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setIndex(i)}
                onClick={() => choose(item)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                  i === index
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <span className="truncate pr-2">{item.label}</span>
                <span className="shrink-0 rounded border border-border/80 bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                  {item.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>

          <div className="flex items-center justify-between border-t border-border px-3.5 py-2 bg-surface/50 text-[11px] text-muted-foreground">
            <span>Costfy Operating System</span>
            <div className="flex items-center gap-2">
              <span>Navegar: <kbd className="font-mono text-[10px]">↑↓</kbd></span>
              <span>Executar: <kbd className="font-mono text-[10px]">↵</kbd></span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
