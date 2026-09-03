import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Boxes,
  Gauge,
  LineChart,
  ShieldCheck,
  Cpu,
  Workflow,
} from "lucide-react";

import { MarketingPage, PageIntro, Section } from "@/components/marketing/marketing-page";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "Produto — Costfy | Sistema operacional inteligente" },
      {
        name: "description",
        content:
          "Conheça os módulos do Costfy: Overview, Analytics, Marketing, Vendas, Financeiro, Tracking, Brain e Automações em um único sistema.",
      },
      { property: "og:title", content: "Produto — Costfy" },
      {
        property: "og:description",
        content:
          "Um sistema que entende sua operação: dados conectados, margem real e ações com aprovação humana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

const MODULES = [
  {
    icon: Gauge,
    name: "Overview",
    text: "O estado da operação em uma tela: receita, investimento, lucro e margem no mesmo recorte de tempo.",
  },
  {
    icon: BarChart3,
    name: "Analytics",
    text: "Investigação livre com filtros, comparações e recortes por canal, campanha, produto e período.",
  },
  {
    icon: Activity,
    name: "Marketing",
    text: "Campanhas, conjuntos e anúncios lidos como uma hierarquia única, independentemente da plataforma.",
  },
  {
    icon: Boxes,
    name: "Vendas",
    text: "Pedidos, produtos e clientes conectados ao investimento que os originou.",
  },
  {
    icon: LineChart,
    name: "Financeiro",
    text: "Custos, taxas e impostos aplicados ao resultado — lucro real, não receita bruta.",
  },
  {
    icon: Workflow,
    name: "Tracking",
    text: "UTMs padronizadas, eventos e atribuição para saber de onde a venda realmente veio.",
  },
  {
    icon: Cpu,
    name: "Brain",
    text: "Leitura contínua do contexto, com insights priorizados e recomendações explicadas.",
  },
  {
    icon: ShieldCheck,
    name: "Automações",
    text: "Regras com guardrails e limites explícitos. Toda execução fica registrada em auditoria.",
  },
];

function ProductPage() {
  return (
    <MarketingPage>
      <PageIntro
        eyebrow="Produto"
        title="Um sistema operacional, não mais um painel"
        description="O Costfy conecta mídia, vendas e finanças em um único modelo de dados. A partir daí, o Brain interpreta o contexto e propõe decisões — que só acontecem com sua aprovação."
      >
        <div className="flex flex-wrap gap-2.5">
          <Link to="/signup" className={buttonClass("primary", "lg")}>
            Começar agora
          </Link>
          <Link to="/pricing" className={buttonClass("outline", "lg")}>
            Ver planos
          </Link>
        </div>
      </PageIntro>

      <Section
        title="Módulos"
        description="Cada módulo resolve uma pergunta específica da operação e compartilha o mesmo contexto."
      >
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <article key={m.name} className="bg-background p-5">
              <m.icon className="size-4 text-primary" aria-hidden />
              <h3 className="type-h3 mt-3 text-foreground">{m.name}</h3>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{m.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Como o Brain trabalha"
        description="O ciclo é sempre o mesmo, e sempre auditável."
      >
        <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          {[
            [
              "Coleta",
              "Integrações trazem dados de mídia, vendas e finanças com estado de sincronização explícito.",
            ],
            ["Compreensão", "Os dados são normalizados em um modelo único por workspace."],
            [
              "Insight",
              "O Brain identifica desvios, oportunidades e riscos com o contexto do seu negócio.",
            ],
            [
              "Ação",
              "A recomendação vem com impacto estimado e depende da sua aprovação para executar.",
            ],
          ].map(([title, text], i) => (
            <li key={title} className="bg-background p-5">
              <span className="type-numeric text-[12px] text-subtle-foreground">0{i + 1}</span>
              <h3 className="type-h3 mt-2 text-foreground">{title}</h3>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </Section>
    </MarketingPage>
  );
}
