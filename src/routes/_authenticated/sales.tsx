import { createFileRoute } from "@tanstack/react-router";
import { SalesView } from "@/features/sales/sales-view";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Vendas, Produtos & Clientes — Costfy" },
      {
        name: "description",
        content:
          "Acompanhe pedidos, produtos e clientes com ticket médio, LTV e status de pagamento.",
      },
    ],
  }),
  component: SalesView,
});
