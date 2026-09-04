import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Zap, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";

import { MarketingPage, PageIntro, Section } from "@/components/marketing/marketing-page";
import { CostfyMark } from "@/components/brand/costfy-mark";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { PlanInterval } from "@/lib/billing-types";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Preços Oficiais — Costfy | Planos para Operações Digitais" },
      {
        name: "description",
        content:
          "Planos oficiais do Costfy com 14 dias de teste grátis: Starter (R$ 59,90), Growth (R$ 149,90) e Scale (R$ 299,90). Cobrança segura via Mercado Pago.",
      },
      { property: "og:title", content: "Preços Oficiais — Costfy" },
      {
        property: "og:description",
        content: "14 dias de teste sem cartão. Escolha o estágio da sua operação digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const OFFICIAL_PLANS = [
  {
    slug: "starter",
    name: "Starter",
    intent: "Para quem está organizando a operação e consolidando métricas",
    monthlyPrice: "R$ 59,90",
    annualPrice: "R$ 575,00",
    monthlyPriceCents: 5990,
    annualPriceCents: 57500,
    annualMonthlyEquivalent: "R$ 47,91/mês",
    limits: [
      "1 workspace",
      "1 membro do time",
      "2 contas de anúncio",
      "5 integrações de checkout",
      "Até 50 campanhas ativas",
      "5 automações operacionais",
    ],
    features: [
      "Visão Geral, Vendas e Financeiro essencial",
      "DRE básica de faturamento",
      "Brain com diagnósticos diários",
      "Histórico de dados por 90 dias",
    ],
    highlight: false,
    cta: "Começar teste grátis",
  },
  {
    slug: "growth",
    name: "Growth",
    intent: "Para operações que escalam tráfego pago e exigem DRE real",
    monthlyPrice: "R$ 149,90",
    annualPrice: "R$ 1.439,00",
    monthlyPriceCents: 14990,
    annualPriceCents: 143900,
    annualMonthlyEquivalent: "R$ 119,91/mês",
    limits: [
      "1 workspace",
      "Até 3 membros do time",
      "5 contas de anúncio",
      "15 integrações de checkout",
      "Até 250 campanhas",
      "25 automações operacionais",
    ],
    features: [
      "Tudo do plano Starter",
      "DRE Completa em cascata com CMV por SKU",
      "Pixel First-Party e atribuição multicanal",
      "Ações do Brain com aprovação em 1 clique",
      "Detecção de anomalias e forecasting",
      "API pública e webhooks dedicados",
      "Histórico de dados por 365 dias",
    ],
    highlight: true,
    tag: "Mais Popular",
    cta: "Começar teste grátis",
  },
  {
    slug: "scale",
    name: "Scale",
    intent: "Para múltiplos negócios, agências e times em rápida expansão",
    monthlyPrice: "R$ 299,90",
    annualPrice: "R$ 2.879,00",
    monthlyPriceCents: 29990,
    annualPriceCents: 287900,
    annualMonthlyEquivalent: "R$ 239,91/mês",
    limits: [
      "Até 3 workspaces inclusos",
      "Até 10 membros com RBAC granular",
      "15 contas de anúncio",
      "Integrações ilimitadas",
      "Campanhas ilimitadas",
      "Automações ilimitadas",
    ],
    features: [
      "Tudo do plano Growth",
      "Execução automática assistida no Action Engine",
      "Inteligência heurística avançada em tempo real",
      "Auditoria corporativa com retenção ilimitada",
      "Suporte prioritário via canal direto",
      "Histórico de dados ilimitado",
    ],
    highlight: false,
    cta: "Começar teste grátis",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    intent: "Para grandes marcas, ecossistemas complexos e holdings",
    monthlyPrice: "Sob medida",
    annualPrice: "Sob medida",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    limits: [
      "Workspaces ilimitados",
      "Membros ilimitados",
      "Contas de anúncio ilimitadas",
      "Integrações dedicadas",
      "Campanhas ilimitadas",
      "Automações customizadas",
    ],
    features: [
      "Tudo do plano Scale",
      "Infraestrutura e banco isolado dedicado",
      "SLA de 99,9% com suporte 24/7",
      "Gerente de conta e CS exclusivo",
      "Modelos de inteligência sob demanda",
      "Contrato empresarial e faturamento via boleto",
    ],
    highlight: false,
    cta: "Falar com especialista",
  },
];

function PricingPage() {
  const [interval, setInterval] = useState<PlanInterval>("monthly");

  return (
    <MarketingPage>
      <PageIntro
        eyebrow="Planos e Preços"
        title="Comece seu teste de 14 dias sem cartão de crédito"
        description="Acesso completo ao ecossistema Costfy para estruturar métricas, DRE e inteligência operacional. Cancele a qualquer momento sem burocracia."
      />

      <Section>
        {/* Interval Selector Toggle */}
        <div className="flex flex-col items-center justify-center gap-3 mb-10">
          <div className="inline-flex items-center rounded-xl border border-border bg-surface p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={cn(
                "rounded-lg px-5 py-2 text-[13px] font-medium transition-all",
                interval === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Faturamento Mensal
            </button>
            <button
              type="button"
              onClick={() => setInterval("annual")}
              className={cn(
                "rounded-lg px-5 py-2 text-[13px] font-medium transition-all flex items-center gap-2",
                interval === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span>Faturamento Anual</span>
              <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-[11px] font-bold text-success">
                20% de economia
              </span>
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {interval === "annual"
              ? "Pagamento antecipado anual com 20% de economia real sobre 12 meses."
              : "Sem fidelidade. Cancele quando quiser com 1 clique."}
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {OFFICIAL_PLANS.map((plan) => (
            <article
              key={plan.slug}
              className={cn(
                "flex flex-col rounded-xl border p-6 transition-all relative",
                plan.highlight
                  ? "border-primary/50 bg-card shadow-[var(--shadow-raised)] ring-1 ring-primary/20"
                  : "border-border bg-background hover:border-border-strong",
              )}
            >
              {plan.tag && (
                <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10.5px] font-bold text-primary-foreground uppercase tracking-wider shadow-sm">
                  {plan.tag}
                </div>
              )}

              <div className="space-y-1.5">
                <h2 className="type-h3 text-foreground">{plan.name}</h2>
                <p className="text-[12px] text-muted-foreground leading-relaxed min-h-[36px]">
                  {plan.intent}
                </p>
              </div>

              {/* Price Tag */}
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                    {interval === "annual" ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPriceCents > 0 && (
                    <span className="text-[12.5px] text-muted-foreground">
                      {interval === "annual" ? "/ano" : "/mês"}
                    </span>
                  )}
                </div>
                {interval === "annual" && plan.monthlyPriceCents > 0 && (
                  <p className="text-[11.5px] text-success font-medium mt-1">
                    Equivalente a R$ {(plan.annualPriceCents / 1200).toFixed(2).replace(".", ",")}/mês
                  </p>
                )}
              </div>

              {/* Limits & Quotas */}
              <div className="mt-6 space-y-2">
                <p className="type-label-subtle">Limites Operacionais</p>
                <ul className="space-y-1.5 text-[12.5px] text-foreground">
                  {plan.limits.map((limit) => (
                    <li key={limit} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div className="mt-6 flex-1 space-y-2">
                <p className="type-label-subtle">Recursos Inclusos</p>
                <ul className="space-y-2 text-[13px] text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="mt-8 pt-4 border-t border-border">
                {plan.slug === "enterprise" ? (
                  <Link
                    to="/billing"
                    search={{ plan: "enterprise", interval }}
                    className={buttonClass("outline", "md", "w-full text-center")}
                  >
                    Falar com especialista
                  </Link>
                ) : (
                  <Link
                    to="/billing"
                    search={{ plan: plan.slug, interval }}
                    className={buttonClass(plan.highlight ? "primary" : "outline", "md", "w-full text-center gap-1.5")}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
                <p className="text-[11px] text-center text-subtle-foreground mt-2">
                  14 dias grátis • Sem cartão
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Trust Banner */}
      <div className="mx-auto max-w-4xl px-5 py-8 text-center border-y border-border my-10">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <span>Processamento Oficial Mercado Pago</span>
          </div>
          <span className="text-border-strong">•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>Criptografia de Ponta a Ponta (AES-256)</span>
          </div>
          <span className="text-border-strong">•</span>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <span>Ativação Imediata via Webhook</span>
          </div>
        </div>
      </div>

      <Section title="Perguntas Frequentes sobre Planos e Cobrança">
        <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          {[
            [
              "Preciso cadastrar cartão de crédito para iniciar o teste?",
              "Não. Ao criar sua conta e workspace, você recebe 14 dias de teste completo para calibrar integrações, métricas e DRE sem fornecer dados financeiros.",
            ],
            [
              "Como funciona a cobrança com o Mercado Pago?",
              "Utilizamos a infraestrutura de pagamentos e assinaturas recorrentes do Mercado Pago. Você pode pagar via Cartão de Crédito ou Pix com emissão automática de comprovantes.",
            ],
            [
              "O que acontece quando o período de teste de 14 dias termina?",
              "Se você não assinar um plano oficial, seu workspace entra no modo Somente Leitura (read-only). Todos os seus dados continuam 100% seguros e acessíveis para consulta e exportação, mas a criação de novas campanhas e automações fica pausada até a ativação.",
            ],
            [
              "Posso mudar de plano (upgrade ou downgrade) a qualquer momento?",
              "Sim. Na tela de Faturamento em Configurações, você pode migrar entre Starter, Growth e Scale instantaneamente, ajustando as cotas da sua operação.",
            ],
            [
              "Existe fidelidade ou multa de cancelamento?",
              "Nenhuma. No plano mensal, você pode cancelar a qualquer momento mantendo o acesso até o final dos 30 dias pagos. No anual, você aproveita o desconto de até 16% com cobrança anual única.",
            ],
            [
              "Como meus dados e integrações são protegidos?",
              "Cada workspace possui isolamento relacional rigoroso no PostgreSQL via Row Level Security (RLS). Nenhuma outra operação tem acesso às suas campanhas, vendas ou custos.",
            ],
          ].map(([q, a]) => (
            <div key={q} className="bg-background p-6">
              <dt className="text-[14px] font-semibold text-foreground">{q}</dt>
              <dd className="type-body-sm mt-2 text-muted-foreground leading-relaxed">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </MarketingPage>
  );
}
