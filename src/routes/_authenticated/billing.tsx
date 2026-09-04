import { createFileRoute } from "@tanstack/react-router";
import { BillingManager } from "@/components/billing/billing-manager";

export interface BillingSearchParams {
  plan?: string | undefined;
  interval?: "monthly" | "annual" | undefined;
}

export const Route = createFileRoute("/_authenticated/billing")({
  validateSearch: (search: Record<string, unknown>): BillingSearchParams => {
    const rawPlan = search["plan"];
    const rawInterval = search["interval"];
    return {
      plan: typeof rawPlan === "string" ? rawPlan : undefined,
      interval: rawInterval === "annual" || rawInterval === "monthly" ? rawInterval : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Faturamento & Assinatura — Costfy" },
      {
        name: "description",
        content: "Gerencie seu plano, faturas e limites operacionais via Mercado Pago.",
      },
    ],
  }),
  component: BillingManager,
});
