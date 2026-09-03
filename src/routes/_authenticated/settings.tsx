import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Calendar,
  Check,
  CreditCard,
  Globe,
  Lock,
  Save,
  Shield,
  ArrowUpRight,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { BusinessType } from "@/lib/workspaces";
import { BillingManager } from "@/components/billing/billing-manager";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações do workspace — Costfy" },
      {
        name: "description",
        content:
          "Gerencie a identidade, moeda base, fuso horário, plano e permissões do seu workspace no Costfy.",
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
  trial: "Em teste gratuito",
  active: "Plano ativo",
  read_only: "Somente leitura",
  suspended: "Suspenso",
};

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

const CURRENCIES = [
  { value: "BRL", label: "BRL (R$) — Real Brasileiro" },
  { value: "USD", label: "USD ($) — Dólar Americano" },
  { value: "EUR", label: "EUR (€) — Euro" },
  { value: "GBP", label: "GBP (£) — Libra Esterlina" },
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Fortaleza", label: "Nordeste / Fortaleza (GMT-3)" },
  { value: "America/New_York", label: "Nova York (Eastern Time)" },
  { value: "America/Los_Angeles", label: "Los Angeles (Pacific Time)" },
  { value: "Europe/London", label: "Londres (GMT/BST)" },
  { value: "Europe/Lisbon", label: "Lisboa (WET/WEST)" },
  { value: "UTC", label: "UTC (Tempo Universal Coordenado)" },
];

function SettingsPage() {
  const { active, memberships } = useWorkspace();
  const queryClient = useQueryClient();

  const [name, setName] = useState(active?.workspace.name ?? "");
  const [businessType, setBusinessType] = useState<BusinessType>(
    (active?.workspace.business_type as BusinessType) ?? "ecommerce",
  );
  const [baseCurrency, setBaseCurrency] = useState(active?.workspace.base_currency ?? "BRL");
  const [timezone, setTimezone] = useState(active?.workspace.timezone ?? "America/Sao_Paulo");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManage = active?.role === "owner" || active?.role === "admin";

  const updateWorkspaceMutation = useMutation({
    mutationFn: async () => {
      if (!active) throw new Error("Nenhum workspace selecionado.");
      const trimmedName = name.trim();
      if (trimmedName.length < 2) throw new Error("O nome do workspace deve ter pelo menos 2 caracteres.");

      const { data, error } = await supabase
        .from("workspaces")
        .update({
          name: trimmedName,
          business_type: businessType,
          base_currency: baseCurrency,
          timezone: timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", active.workspace.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      setSavedSuccess(true);
      setErrorMessage(null);
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setTimeout(() => setSavedSuccess(false), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Erro ao atualizar workspace.";
      setErrorMessage(message);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    updateWorkspaceMutation.mutate();
  }

  if (!active) {
    return (
      <AppShell title="Configurações" description="Dados do workspace ativo.">
        <div className="editorial-card p-10 text-center bg-surface/40">
          <Building2 className="mx-auto size-8 text-muted-foreground" />
          <h3 className="type-h3 mt-3 text-foreground">Nenhum workspace ativo</h3>
          <p className="type-body-sm mx-auto mt-1 max-w-sm text-muted-foreground">
            Selecione ou crie um workspace para acessar as configurações.
          </p>
          <div className="mt-4">
            <Link to="/onboarding" className={buttonClass("primary", "sm")}>
              Criar workspace
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const trialEnds = new Date(active.workspace.trial_ends_at);
  const isTrialActive = active.workspace.status === "trial";
  const daysLeft = Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const [activeTab, setActiveTab] = useState<"general" | "billing">("general");

  return (
    <AppShell
      title="Configurações"
      description="Gerencie as propriedades operacionais, moeda base e plano do seu workspace."
    >
      <div className="space-y-6 max-w-4xl">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-colors",
              activeTab === "general"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            Dados do Negócio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("billing")}
            className={cn(
              "px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-1.5",
              activeTab === "billing"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <CreditCard className="size-3.5" />
            <span>Faturamento & Assinatura</span>
          </button>
        </div>

        {activeTab === "billing" ? (
          <BillingManager />
        ) : (
          <>
            {/* Banner de Feedback */}
            {savedSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-[13px] font-medium text-success"
              >
                <Check className="size-4 shrink-0" />
                Configurações salvas com sucesso!
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
              >
                {errorMessage}
              </div>
            )}

            {/* 1. Formulário de Informações Gerais */}
            <section className="editorial-card p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Dados do Negócio
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Esses dados calibram o Metrics Engine, fuso horário dos relatórios e moeda base.
              </p>
            </div>
            {!canManage && (
              <span className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Lock className="size-3" /> Somente leitura
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ws-name" className="block text-[12.5px] font-medium text-foreground mb-1">
                  Nome do Workspace
                </label>
                <input
                  id="ws-name"
                  type="text"
                  required
                  disabled={!canManage}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(inputClass, !canManage && "opacity-75 cursor-not-allowed")}
                />
              </div>

              <div>
                <label htmlFor="ws-slug" className="block text-[12.5px] font-medium text-foreground mb-1">
                  Identificador Único (Slug)
                </label>
                <input
                  id="ws-slug"
                  type="text"
                  readOnly
                  disabled
                  value={active.workspace.slug}
                  className={cn(inputClass, "bg-secondary/40 font-mono text-[12px] text-muted-foreground cursor-not-allowed")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ws-business-type" className="block text-[12.5px] font-medium text-foreground mb-1">
                  Tipo de Operação
                </label>
                <select
                  id="ws-business-type"
                  disabled={!canManage}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className={cn(inputClass, !canManage && "opacity-75 cursor-not-allowed")}
                >
                  {BUSINESS_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ws-currency" className="block text-[12.5px] font-medium text-foreground mb-1">
                  Moeda Base
                </label>
                <select
                  id="ws-currency"
                  disabled={!canManage}
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className={cn(inputClass, !canManage && "opacity-75 cursor-not-allowed")}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ws-timezone" className="block text-[12.5px] font-medium text-foreground mb-1">
                  Fuso Horário
                </label>
                <select
                  id="ws-timezone"
                  disabled={!canManage}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={cn(inputClass, !canManage && "opacity-75 cursor-not-allowed")}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {canManage && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateWorkspaceMutation.isPending}
                  className={buttonClass("primary", "sm", "gap-1.5")}
                >
                  <Save className="size-3.5" />
                  {updateWorkspaceMutation.isPending ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* 2. Seção de Assinatura & Plano */}
        <section className="editorial-card p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Plano & Assinatura
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Status da sua assinatura e limites operacionais do workspace.
              </p>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                isTrialActive
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-success/30 bg-success/10 text-success",
              )}
            >
              {STATUS_LABEL[active.workspace.status] ?? active.workspace.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <div className="rounded-lg border border-border bg-surface/50 p-4">
              <span className="type-label-subtle">Seu Papel</span>
              <p className="mt-1.5 font-semibold text-foreground capitalize">{active.role}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Controle de permissão RBAC
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface/50 p-4">
              <span className="type-label-subtle">Período de Testes</span>
              <p className="mt-1.5 font-semibold text-foreground">
                {isTrialActive ? `${daysLeft} dia(s) restante(s)` : "Encerrado"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Até {trialEnds.toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface/50 p-4">
              <span className="type-label-subtle">Workspaces Ativos</span>
              <p className="mt-1.5 font-semibold text-foreground">{memberships.length}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Vinculados ao seu usuário
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground border-t border-border mt-4">
            </div>
          </section>
        </>
      )}
    </div>
  </AppShell>
);
}
