import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações do workspace — Costfy" },
      {
        name: "description",
        content:
          "Revise identidade, moeda, fuso horário e estado do plano do seu workspace no Costfy.",
      },
      { property: "og:title", content: "Configurações do workspace — Costfy" },
      {
        property: "og:description",
        content: "Identidade, moeda, fuso e plano do workspace.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <SettingsPage />
    </WorkspaceProvider>
  ),
});

const STATUS_LABEL: Record<string, string> = {
  trial: "Em teste",
  active: "Ativo",
  read_only: "Somente leitura",
  suspended: "Suspenso",
};

function SettingsPage() {
  const { active } = useWorkspace();

  const rows = active
    ? [
        { label: "Nome", value: active.workspace.name },
        { label: "Identificador", value: active.workspace.slug },
        { label: "Seu papel", value: active.role },
        { label: "Moeda base", value: active.workspace.base_currency },
        { label: "Fuso horário", value: active.workspace.timezone },
        {
          label: "Plano",
          value: STATUS_LABEL[active.workspace.status] ?? active.workspace.status,
        },
        {
          label: "Teste termina em",
          value: new Date(active.workspace.trial_ends_at).toLocaleDateString("pt-BR"),
        },
      ]
    : [];

  return (
    <AppShell title="Configurações" description="Dados do workspace ativo.">
      {!active ? (
        <p className="type-body-sm text-muted-foreground">
          Nenhum workspace ativo.
        </p>
      ) : (
        <dl className="max-w-2xl divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-[13px] text-muted-foreground">{row.label}</dt>
              <dd className="text-[13.5px] font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </AppShell>
  );
}
