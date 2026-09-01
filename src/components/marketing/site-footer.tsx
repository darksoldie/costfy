import { Link } from "@tanstack/react-router";

import { CostfyLogo } from "@/components/brand/costfy-mark";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Visão geral", to: "/product" },
      { label: "Soluções", to: "/solutions" },
      { label: "Preços", to: "/pricing" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Central de recursos", to: "/resources" },
      { label: "Entrar", to: "/login" },
      { label: "Criar conta", to: "/signup" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <CostfyLogo />
          <p className="type-body-sm mt-3 max-w-xs text-muted-foreground">
            Sistema operacional inteligente para negócios digitais. Seu negócio,
            compreendido.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="type-caption text-subtle-foreground">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="type-body-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-[12px] text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Costfy</span>
          <span>Seu negócio. Compreendido.</span>
        </div>
      </div>
    </footer>
  );
}
