import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Costfy" },
      {
        name: "description",
        content:
          "Acompanhe receita, investimento, lucro e margem do seu negócio digital em um único painel.",
      },
      { property: "og:title", content: "Visão geral — Costfy" },
      { property: "og:description", content: "O painel do seu negócio digital." },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <DashboardPage />
    </WorkspaceProvider>
  ),
});

const METRICS = [
  { label: "Receita", hint: "Conecte vendas para calcular" },
  { label: "Investimento", hint: "Conecte mídia para calcular" },
  { label: "Lucro", hint: "Receita − custos e taxas" },
  { label: "Margem", hint: "Lucro sobre receita" },
] as const;

function DashboardPage() {
  const { active, loading, error } = useWorkspace();

  return (
    <AppShell
      title={active ? active.workspace.name : "Visão geral"}
      description="Receita não é lucro. O Costfy mostra o que sobra."
      actions={
        <Link to="/integrations" className={buttonClass("primary", "sm")}>
          Conectar dados
        </Link>
      }
    >
      {error && (
        <p role="alert" className="type-body-sm text-destructive">
          Não foi possível carregar seus workspaces: {error.message}
        </p>
      )}

      {!loading && !active && <EmptyWorkspaceState />}

      {active && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="type-caption text-muted-foreground">{metric.label}</p>
                <p className="type-numeric mt-2 text-foreground">—</p>
                <p className="mt-1 text-[12px] text-subtle-foreground">{metric.hint}</p>
              </div>
            ))}
          </div>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="type-h3 text-foreground">Brain</h2>
            <p className="type-body-sm mt-2 max-w-2xl text-muted-foreground">
              O Brain começa a gerar leituras assim que houver dados de mídia e de
              vendas conectados. Sem fonte de dados, qualquer número aqui seria
              invenção — por isso o painel permanece vazio.
            </p>
            <Link to="/integrations" className={buttonClass("secondary", "sm", "mt-4")}>
              Ver integrações
            </Link>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function EmptyWorkspaceState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <h2 className="type-h3 text-foreground">Crie seu primeiro workspace</h2>
      <p className="type-body-sm mx-auto mt-2 max-w-md text-muted-foreground">
        Um workspace concentra integrações, times e histórico de um negócio.
      </p>
      <Link to="/onboarding" className={buttonClass("primary", "md", "mt-5")}>
        Criar workspace
      </Link>
    </div>
  );
}
