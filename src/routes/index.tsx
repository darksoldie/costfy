import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ShadcnNavbar } from "@/components/marketing/shadcn-navbar";
import { ShadcnHero } from "@/components/marketing/shadcn-hero";
import { ShadcnStats } from "@/components/marketing/shadcn-stats";
import { ShadcnFeatures } from "@/components/marketing/shadcn-features";
import { ShadcnCTA } from "@/components/marketing/shadcn-cta";
import { ShadcnFooter } from "@/components/marketing/shadcn-footer";

const TITLE = "Costfy — O Sistema Operacional para Negócios Digitais";
const DESCRIPTION =
  "Centralize tráfego, vendas, CMV real de produto, DRE gerencial, tracking first-party e um copilot executivo que prepara ações com aprovação em 1 clique.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: LandingPage,
});

const FAQ_ITEMS = [
  {
    q: "Como o Costfy calcula o lucro líquido real?",
    a: "O Costfy integra diretamente seus canais de venda (Hotmart, Kiwify, Stripe, Mercado Pago) e anúncios (Meta Ads, Google Ads). Ele desconta o Custo de Mercadoria Vendida (CMV) por SKU cadastrado, as taxas percentuais e fixas de cada gateway, impostos e o investimento diário de mídia, exibindo a DRE exata em cascata.",
  },
  {
    q: "Preciso cadastrar cartão de crédito para iniciar o teste?",
    a: "Não. Você ganha 14 dias de teste completo sem fornecer nenhum dado de pagamento. É só criar sua conta, calibrar suas primeiras integrações e começar a operar.",
  },
  {
    q: "O Brain Copilot executa ações sozinho?",
    a: "Por padrão, não. O Brain segue o princípio estrito de Guardrails: ele analisa os dados 24/7, detecta anomalias ou oportunidades e formula a proposta de ação pronta com justificativa. A execução exige seu clique explícito e é auditada em log imutável.",
  },
  {
    q: "Como funciona o Tracking First-Party?",
    a: "Disponibilizamos um script ultraleve (3KB) que roda no seu domínio. As sessões e eventos são gravados em cookies first-party que não sofrem restrições do Safari/iOS nem de AdBlockers convencionais, permitindo reconciliação precisa com as vendas que chegam via webhook.",
  },
  {
    q: "Como meus dados são protegidos?",
    a: "Cada workspace possui isolamento rigoroso no PostgreSQL via Row Level Security (RLS). Nenhum outro cliente ou membro fora da sua organização tem acesso aos seus relatórios, faturamento ou clientes.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. Header & Navigation */}
      <ShadcnNavbar />

      {/* 2. Main Content */}
      <main>
        {/* Hero Section with Interactive Cockpit Frame */}
        <ShadcnHero />

        {/* Stats Grid */}
        <ShadcnStats />

        {/* Bento Grid Features */}
        <ShadcnFeatures />

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-28 bg-surface/40 border-t border-border/60">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[12px] font-semibold text-primary uppercase tracking-wider">
                Dúvidas Frequentes
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
                Perguntas e Respostas sobre o Costfy
              </h2>
              <p className="mt-3 text-[14px] text-muted-foreground">
                Tudo o que você precisa saber sobre o sistema, segurança e modelo operacional.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-border/80 bg-background/80 px-5 backdrop-blur-sm shadow-xs"
                >
                  <AccordionTrigger className="text-[14.5px] font-semibold text-foreground hover:no-underline py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13.5px] text-muted-foreground leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final High-Converting CTA */}
        <ShadcnCTA />
      </main>

      {/* 3. Footer */}
      <ShadcnFooter />
    </div>
  );
}
