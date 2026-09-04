import { createFileRoute } from "@tanstack/react-router";
import { MarketingView } from "@/features/marketing/marketing-view";

export const Route = createFileRoute("/_authenticated/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing / Campanhas — Costfy" },
      {
        name: "description",
        content:
          "Gerenciamento operacional de campanhas, conjuntos de anúncios, anúncios e criativos.",
      },
    ],
  }),
  component: MarketingView,
});
