import { createFileRoute, Link } from "@tanstack/react-router";

import { MarketingPage, PageIntro, Section } from "@/components/marketing/marketing-page";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Soluções — Costfy para e-commerce, infoprodutos e agências" },
      {
        name: "description",
        content:
          "Como o Costfy se adapta a e-commerce, infoprodutos, SaaS, afiliados e agências: mesmo modelo de dados, perguntas diferentes.",
      },
      { property: "og:title", content: "Soluções — Costfy" },
      {
        property: "og:description",
        content:
          "Um sistema que entende o seu tipo de operação e responde às perguntas que importam para ela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SolutionsPage,
});

const SOLUTIONS = [
  {
    name: "E-commerce",
    question: "Qual produto realmente dá lucro depois de frete, taxas e mídia?",
    text: "Margem por produto e por pedido, com custo de aquisição atribuído à venda correta.",
  },
  {
    name: "Infoprodutos",
    question: "Qual criativo sustenta a escala sem derrubar o ROAS?",
    text: "Leitura de campanha, checkout e reembolso no mesmo recorte de tempo.",
  },
  {
    name: "SaaS",
    question: "Quanto custa adquirir um cliente que permanece?",
    text: "Aquisição conectada à receita recorrente e ao comportamento de retenção.",
  },
  {
    name: "Afiliados",
    question: "Qual origem entrega volume com margem?",
    text: "Atribuição por origem, campanha e link, com UTMs padronizadas.",
  },
  {
    name: "Agências",
    question: "Como manter várias operações sob controle sem perder contexto?",
    text: "Workspaces isolados, papéis por pessoa e auditoria de tudo que foi executado.",
  },
  {
    name: "Criadores",
    question: "O que converte, e não apenas o que engaja?",
    text: "Conteúdo e tráfego avaliados pelo resultado financeiro, não por métricas de vaidade.",
  },
];

function SolutionsPage() {
  return (
    <MarketingPage>
      <PageIntro
        eyebrow="Soluções"
        title="O mesmo sistema, adaptado ao seu tipo de operação"
        description="O modelo de dados é único. O que muda é o contexto: quais perguntas o Brain prioriza e quais métricas definem sucesso no seu negócio."
      >
        <Link to="/signup" className={buttonClass("primary", "lg")}>
          Criar workspace
        </Link>
      </PageIntro>

      <Section>
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <article key={s.name} className="bg-background p-6">
              <h2 className="type-h3 text-foreground">{s.name}</h2>
              <p className="mt-3 text-[14px] font-medium leading-snug text-primary">{s.question}</p>
              <p className="type-body-sm mt-2 text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </MarketingPage>
  );
}
