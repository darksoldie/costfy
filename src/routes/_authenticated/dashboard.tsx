import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Cockpit Executivo — Costfy" },
      {
        name: "description",
        content:
          "Centro operacional do seu negócio digital: lucro líquido real, ROAS, CPA e inteligência contextual.",
      },
      { property: "og:title", content: "Cockpit Executivo — Costfy" },
      {
        property: "og:description",
        content: "O Intelligent Operating System do seu negócio digital.",
      },
    ],
  }),
  component: DashboardView,
});
