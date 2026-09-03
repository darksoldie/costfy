import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { MarketingPage, PageIntro, Section } from "@/components/marketing/marketing-page";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Preços — Costfy | Planos para operações digitais" },
      {
        name: "description",
        content:
          "Planos do Costfy com 14 dias de teste: Starter, Growth e Scale. Integrações, Brain, automações e auditoria conforme a maturidade da operação.",
      },
      { property: "og:title", content: "Preços — Costfy" },
      {
        property: "og:description",
        content: "Comece com 14 dias de teste. Sem cartão para criar o workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Starter",
    intent: "Para quem está organizando a operação",
    features: [
      "1 workspace",
      "Integrações essenciais",
      "Overview, Analytics e Vendas",
      "Brain com insights diários",
      "Até 3 pessoas",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    intent: "Para operações que escalam mídia",
    features: [
      "Tudo do Starter",
      "Financeiro com margem por produto",
      "Tracking e atribuição",
      "Ações do Brain com aprovação",
      "Automações com guardrails",
      "Até 10 pessoas",
    ],
    highlight: true,
  },
  {
    name: "Scale",
    intent: "Para múltiplas operações e times",
    features: [
      "Tudo do Growth",
      "Múltiplos workspaces",
      "Papéis e permissões granulares",
      "Auditoria completa",
      "Limites de execução por papel",
      "Pessoas ilimitadas",
    ],
    highlight: false,
  },
];

function PricingPage() {
  return (
    <MarketingPage>
      <PageIntro
        eyebrow="Preços"
        title="Escolha pelo estágio da sua operação"
        description="Todos os planos começam com 14 dias de teste. Os valores estão sendo definidos com os primeiros workspaces — crie sua conta para acompanhar."
      />

      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex flex-col rounded-xl border bg-background p-6",
                plan.highlight
                  ? "border-primary/40 shadow-[var(--shadow-raised)]"
                  : "border-border",
              )}
            >
              <div className="flex items-center gap-2">
                <h2 className="type-h3 text-foreground">{plan.name}</h2>
                {plan.highlight && (
                  <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{plan.intent}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13.5px] text-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={buttonClass(plan.highlight ? "primary" : "outline", "md", "mt-7 w-full")}
              >
                Começar teste de 14 dias
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Perguntas frequentes">
        <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          {[
            ["Preciso de cartão para testar?", "Não. O workspace é criado com 14 dias de teste."],
            [
              "O Brain executa ações sozinho?",
              "Não. Toda ação exige aprovação explícita e fica registrada em auditoria.",
            ],
            [
              "Meus dados ficam isolados?",
              "Sim. Cada workspace é isolado no banco por regras de acesso por linha.",
            ],
            ["Posso convidar meu time?", "Sim, com papéis e permissões definidos por pessoa."],
          ].map(([q, a]) => (
            <div key={q} className="bg-background p-5">
              <dt className="text-[14px] font-medium text-foreground">{q}</dt>
              <dd className="type-body-sm mt-1.5 text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </MarketingPage>
  );
}
