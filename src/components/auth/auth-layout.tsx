import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CostfyLogo } from "@/components/brand/costfy-mark";

/**
 * Casca das telas de autenticação.
 *
 * Duas colunas no desktop: formulário à esquerda (foco), assinatura da marca
 * à direita. Uma coluna no mobile. Sem decoração além do necessário.
 */
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[1fr_0.85fr]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" aria-label="Costfy — início" className="w-fit">
          <CostfyLogo />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="type-h1 text-foreground">{title}</h1>
          <p className="type-body-sm mt-2 text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-[13px] text-muted-foreground">{footer}</div>}
        </div>

        <p className="text-[12px] text-subtle-foreground">© {new Date().getFullYear()} Costfy</p>
      </div>

      <aside className="hidden flex-col justify-between border-l border-border bg-surface p-10 lg:flex">
        <span className="type-caption text-subtle-foreground">Sistema operacional inteligente</span>
        <div>
          <p className="type-h2 max-w-sm text-foreground">
            Dados conectados, margem real e decisões com contexto.
          </p>
          <p className="type-body-sm mt-3 max-w-sm text-muted-foreground">
            O Costfy interpreta mídia, vendas e finanças no mesmo modelo — e nenhuma ação acontece
            sem a sua aprovação.
          </p>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-subtle-foreground">
          Your business. Understood.
        </span>
      </aside>
    </div>
  );
}

/** Botão de entrada com Google, com o estado de carregamento explícito. */
export function GoogleButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-background text-[13.5px] font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-55"
    >
      <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.87Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
        />
      </svg>
      {label}
    </button>
  );
}
