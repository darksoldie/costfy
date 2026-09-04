import { createFileRoute } from "@tanstack/react-router";
import { FinanceView } from "@/features/finance/finance-view";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Financeiro & DRE Gerencial — Costfy" },
      {
        name: "description",
        content:
          "DRE em cascata: Receita Líquida − CMV − Taxas − Impostos − Tráfego − Custos Fixos = Lucro Real.",
      },
    ],
  }),
  component: FinanceView,
});
