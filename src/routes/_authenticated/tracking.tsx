import { createFileRoute } from "@tanstack/react-router";
import { TrackingView } from "@/features/tracking/tracking-view";

export const Route = createFileRoute("/_authenticated/tracking")({
  head: () => ({
    meta: [
      { title: "Tracking & Gerador de UTMs — Costfy" },
      {
        name: "description",
        content:
          "Crie e valide URLs rastreáveis com parâmetros UTM padronizados e rastreie sessões de tráfego.",
      },
    ],
  }),
  component: TrackingView,
});
