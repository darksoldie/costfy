import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider } from "@/components/app/workspace-context";
import { TextField } from "@/components/ui-kit/text-field";
import { buttonClass, inputClass } from "@/lib/ui";
import { useCreateWorkspace, type BusinessType } from "@/lib/workspaces";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Criar workspace — Costfy" },
      {
        name: "description",
        content:
          "Configure seu workspace no Costfy: nome do negócio e tipo de operação para calibrar o Brain.",
      },
      { property: "og:title", content: "Criar workspace — Costfy" },
      {
        property: "og:description",
        content: "Configure o contexto do seu negócio em menos de um minuto.",
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
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "infoproduct", label: "Infoproduto" },
  { value: "affiliate", label: "Afiliado" },
  { value: "agency", label: "Agência" },
  { value: "creator", label: "Criador de conteúdo" },
  { value: "freelancer", label: "Freelancer" },
  { value: "other", label: "Outro" },
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
      title="Criar workspace"
      description="O tipo de negócio calibra métricas e leituras do Brain."
    >
      <form onSubmit={handleSubmit} className="max-w-lg space-y-5" noValidate>
        <TextField
          label="Nome do negócio"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Loja Aurora"
          hint="Você poderá renomear depois."
        />

        <div className="space-y-1.5">
          <label htmlFor="business-type" className="block text-[13px] font-medium text-foreground">
            Tipo de negócio
          </label>
          <select
            id="business-type"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value as BusinessType)}
            className={inputClass}
          >
            {BUSINESS_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {createWorkspace.error instanceof Error && (
          <p role="alert" className="text-[12.5px] text-destructive">
            {createWorkspace.error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={createWorkspace.isPending}
          className={buttonClass("primary", "lg", "w-full")}
        >
          {createWorkspace.isPending ? "Criando…" : "Criar workspace"}
        </button>
      </form>
    </AppShell>
  );
}
