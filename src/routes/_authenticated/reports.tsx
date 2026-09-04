import { createFileRoute } from "@tanstack/react-router";
import { ReportsView } from "@/features/reports/reports-view";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios & DRE — Costfy" },
      {
        name: "description",
        content: "Relatórios executivos auditados, DRE gerencial, performance por campanha e canais de aquisição.",
      },
    ],
  }),
  component: ReportsRouteComponent,
});

function ReportsRouteComponent() {
  return <ReportsView />;
}
