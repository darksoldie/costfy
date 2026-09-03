import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider } from "@/components/app/workspace-context";
import { TextField } from "@/components/ui-kit/text-field";
import { buttonClass, inputClass, selectClass } from "@/lib/ui";
import { useCreateWorkspace, type BusinessType } from "@/lib/workspaces";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Configurar Workspace — Costfy" },
      {
        name: "description",
        content:
          "Inicialize o ambiente operacional do seu negócio digital: configure o nome e o modelo de negócio para calibrar o Costfy Brain.",
      },
      { property: "og:title", content: "Configurar Workspace — Costfy" },
      {
        property: "og:description",
        content: "Inicialize o ambiente operacional do seu negócio digital.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <OnboardingPage />
    </WorkspaceProvider>
  ),
});

const BUSINESS_TYPES: ReadonlyArray<{ value: BusinessType; label: string }> = [
  { value: "ecommerce", label: "E-commerce & D2C" },
  { value: "saas", label: "SaaS & Software" },
  { value: "infoproduct", label: "Infoproduto & Cursos" },
  { value: "affiliate", label: "Afiliado Profissional" },
  { value: "agency", label: "Agência de Performance" },
  { value: "creator", label: "Criador de Conteúdo" },
  { value: "freelancer", label: "Serviços Digitais" },
  { value: "other", label: "Outro Modelo Digital" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("ecommerce");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createWorkspace.mutateAsync({ name, businessType });
      await navigate({ to: "/dashboard", replace: true });
    } catch {
      /* o erro é exibido a partir do estado da mutação */
    }
  }

  return (
    <AppShell
      title="Configuração do Workspace"
      description="Inicialize o ambiente operacional do seu negócio digital."
    >
      <div className="max-w-xl mx-auto pt-4 sm:pt-8">
        <div className="editorial-card p-6 sm:p-8 space-y-6 shadow-[var(--shadow-raised)]">
          <div className="space-y-1.5 border-b border-border pb-4">
            <h2 className="type-h2 text-foreground">Novo Workspace</h2>
            <p className="type-body-sm text-muted-foreground">
              O tipo de negócio calibra os diagnósticos, taxas padrão e guardrails de automação do Costfy Brain.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <TextField
              label="Nome do negócio ou operação"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Aurora Digital / Operação Alpha"
              hint="Identificador do seu workspace corporativo. Editável a qualquer momento."
            />

            <div className="space-y-1.5">
              <label htmlFor="business-type" className="block text-[13px] font-medium text-foreground">
                Tipo de operação
              </label>
              <select
                id="business-type"
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value as BusinessType)}
                className={selectClass}
              >
                {BUSINESS_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {createWorkspace.error instanceof Error && (
              <p role="alert" className="text-[12.5px] text-destructive bg-destructive/5 p-3 rounded-md border border-destructive/20">
                {createWorkspace.error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={createWorkspace.isPending || !name.trim()}
              className={buttonClass("primary", "lg", "w-full mt-2")}
            >
              {createWorkspace.isPending ? "Configurando ambiente…" : "Inicializar Workspace"}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
