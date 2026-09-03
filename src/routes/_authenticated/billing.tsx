import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider } from "@/components/app/workspace-context";
import { BillingManager } from "@/components/billing/billing-manager";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Faturamento & Assinatura — Costfy" },
      {
        name: "description",
        content: "Gerencie seu plano, faturas e limites operacionais via Mercado Pago.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <AppShell
        title="Faturamento & Assinatura"
        description="Controle seu plano oficial, faturas emitidas e limites de processamento do workspace."
      >
        <BillingManager />
      </AppShell>
    </WorkspaceProvider>
  ),
});
