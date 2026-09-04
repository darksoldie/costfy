import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/features/analytics/analytics-view";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Multidimensional — Costfy" },
      {
        name: "description",
        content:
          "Exploração analítica com filtros temporais, comparações e quebras por canal, campanha e produto.",
      },
    ],
  }),
  component: AnalyticsView,
});
