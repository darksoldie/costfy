import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

/** Casca das páginas públicas — mantém header, largura e ritmo consistentes. */
export function MarketingPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

/** Abertura padrão de página interna: eyebrow, título e um parágrafo. */
export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <p className="type-caption text-primary">{eyebrow}</p>
        <h1 className="type-h1 mt-3 max-w-3xl text-foreground">{title}</h1>
        <p className="type-body mt-4 max-w-2xl text-muted-foreground">{description}</p>
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

/** Bloco de conteúdo com título opcional e espaçamento generoso. */
export function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        {title && <h2 className="type-h2 text-foreground">{title}</h2>}
        {description && (
          <p className="type-body mt-3 max-w-2xl text-muted-foreground">{description}</p>
        )}
        <div className={title || description ? "mt-8" : undefined}>{children}</div>
      </div>
    </section>
  );
}
