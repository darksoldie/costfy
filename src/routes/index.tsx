import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Boxes,
  Check,
  Fingerprint,
  Layers,
  Lock,
  Radar,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { CostfyMark } from "@/components/brand/costfy-mark";
import { HeroProduct } from "@/components/marketing/hero-product";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TITLE = "Costfy — Sistema operacional inteligente para negócios digitais";
const DESCRIPTION =
  "Um único sistema para entender, otimizar e operar seu negócio digital: dados, campanhas, vendas, financeiro, tracking e inteligência em um só lugar.";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="type-caption text-primary">{children}</p>;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <IntegrationEcosystem />
        <ProblemSolution />
        <BrainSection />
        <Capabilities />
        <SecuritySection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="grid-field pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground">
            <CostfyMark size={13} className="text-primary" />
            Intelligent Operating System for Digital Businesses
          </span>
          <h1 className="type-display mt-6 text-foreground">
            Seu negócio digital.
            <br />
            <span className="text-primary">Movido por inteligência.</span>
          </h1>
          <p className="type-body mx-auto mt-5 max-w-xl text-muted-foreground">
            Um sistema operacional inteligente para entender, otimizar e operar seu negócio digital
            — dados, aquisição, vendas, financeiro e execução no mesmo lugar.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Iniciar teste de 14 dias
            </Link>
            <Link
              to="/product"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Ver como funciona
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-subtle-foreground">
            Sem cartão de crédito para começar.
          </p>
        </div>

        <div className="mt-14">
          <HeroProduct />
        </div>
      </div>
    </section>
  );
}

const INTEGRATIONS = [
  { group: "Aquisição", items: ["Meta Ads", "Google Ads", "TikTok Ads", "Kwai"] },
  {
    group: "Vendas",
    items: ["Shopify", "Hotmart", "Kiwify", "Eduzz", "Cartpanda", "Yampi"],
  },
  { group: "Pagamentos", items: ["Stripe", "Mercado Pago"] },
  { group: "Social", items: ["Instagram", "Facebook", "TikTok", "YouTube"] },
];

function IntegrationEcosystem() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionLabel>Ecossistema</SectionLabel>
        <h2 className="type-h1 mt-3 max-w-2xl text-foreground">
          Sua operação inteira, conectada em uma camada só.
        </h2>
        <p className="type-body mt-3 max-w-2xl text-muted-foreground">
          Cada integração tem estado explícito: conectada, sincronizando, com atraso ou
          desconectada. Nada é apresentado como real antes de existir.
        </p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((cat) => (
            <div key={cat.group} className="bg-background p-5">
              <h3 className="type-caption text-subtle-foreground">{cat.group}</h3>
              <ul className="mt-3 space-y-2">
                {cat.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-foreground">
                    <span className="size-1.5 rounded-full bg-border-strong" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    problem: "Dados espalhados entre gerenciador de anúncios, checkout e planilha.",
    solution: "Uma camada normalizada única, com origem e horário de cada número.",
  },
  {
    problem: "Receita alta e lucro incerto, porque taxas e reembolsos ficam de fora.",
    solution: "Financeiro que separa receita de lucro, taxa a taxa.",
  },
  {
    problem: "Painéis que mostram o que aconteceu, mas não o que fazer.",
    solution: "Dado → interpretação → recomendação → ação aprovada por você.",
  },
];

function ProblemSolution() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionLabel>Problema e solução</SectionLabel>
        <h2 className="type-h1 mt-3 max-w-2xl text-foreground">
          Operação digital não falha por falta de dado. Falha por falta de leitura.
        </h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {PROBLEMS.map((row) => (
            <div key={row.problem} className="grid gap-4 py-5 md:grid-cols-2 md:gap-10">
              <p className="type-body text-muted-foreground">{row.problem}</p>
              <p className="type-body flex items-start gap-2.5 text-foreground">
                <Check className="mt-1 size-4 shrink-0 text-primary" />
                {row.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const BRAIN_LOOP = [
  { step: "Observa", detail: "Lê campanhas, vendas, custos e eventos." },
  { step: "Compreende", detail: "Contextualiza com o histórico do seu workspace." },
  { step: "Recomenda", detail: "Aponta o que importa e por quê." },
  { step: "Prepara", detail: "Monta a ação com valores, impacto e risco." },
  { step: "Executa", detail: "Somente após sua aprovação explícita." },
  { step: "Verifica", detail: "Confirma o resultado na plataforma de destino." },
];

function BrainSection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Costfy Brain</SectionLabel>
            <h2 className="type-h1 mt-3 text-foreground">A camada de inteligência operacional.</h2>
            <p className="type-body mt-3 text-muted-foreground">
              O Brain entende o contexto da tela em que você está. Em uma campanha, &ldquo;por que
              ela caiu?&rdquo; se refere àquela campanha. Em um produto, &ldquo;como melhorar
              isso?&rdquo; se refere àquele produto.
            </p>
            <p className="type-body mt-3 text-muted-foreground">
              Ele nunca gasta dinheiro por conta própria. Toda ação de impacto passa por permissão,
              guardrails e aprovação.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {BRAIN_LOOP.map((item, i) => (
              <li key={item.step} className="bg-background p-5">
                <span className="type-numeric text-[11px] text-subtle-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h3 mt-1 text-foreground">{item.step}</h3>
                <p className="type-body-sm mt-1 text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const CAPABILITIES = [
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Investigação profunda com filtros, comparações de período e gráficos interativos.",
  },
  {
    icon: Workflow,
    title: "Automações",
    body: "Regras visuais ou em linguagem natural, convertidas em gatilhos auditáveis.",
  },
  {
    icon: Sparkles,
    title: "Creative Studio",
    body: "Conceitos, ângulos e variações ligados à performance real de cada criativo.",
  },
  {
    icon: RouteIcon,
    title: "Tracking e atribuição",
    body: "UTMs, eventos e atribuição de primeiro e último clique, com saúde de tracking visível.",
  },
  {
    icon: Layers,
    title: "Inteligência de negócio",
    body: "Receita, custo, margem e LTV calculados por uma única engine de métricas.",
  },
  {
    icon: Radar,
    title: "Social",
    body: "Calendário e publicação preparados — sempre com autorização explícita.",
  },
];

function Capabilities() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionLabel>Plataforma</SectionLabel>
        <h2 className="type-h1 mt-3 max-w-2xl text-foreground">
          Um sistema. Não vinte ferramentas costuradas.
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <div key={item.title} className="bg-background p-6">
              <item.icon className="size-4.5 text-primary" strokeWidth={1.6} />
              <h3 className="type-h3 mt-3 text-foreground">{item.title}</h3>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SECURITY = [
  { icon: Lock, label: "Isolamento por workspace com Row Level Security." },
  { icon: ShieldCheck, label: "Credenciais de integração guardadas no servidor." },
  { icon: Fingerprint, label: "Papéis e permissões granulares por usuário." },
  { icon: Activity, label: "Log de auditoria de toda ação relevante." },
];

function SecuritySection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionLabel>Segurança</SectionLabel>
            <h2 className="type-h1 mt-3 text-foreground">Controle antes de autonomia.</h2>
            <p className="type-body mt-3 text-muted-foreground">
              O Brain respeita limites de workspace, permissões do usuário e guardrails
              configuráveis. Nenhuma ação externa acontece sem registro.
            </p>
          </div>
          <ul className="space-y-px overflow-hidden rounded-xl border border-border bg-border">
            {SECURITY.map((item) => (
              <li key={item.label} className="flex items-center gap-3 bg-background px-5 py-4">
                <item.icon className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
                <span className="type-body-sm text-foreground">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: "Starter",
    for: "Quem está estruturando a operação.",
    includes: ["1 workspace", "Integrações essenciais", "Brain em modo análise"],
  },
  {
    name: "Growth",
    for: "Operações que já investem em aquisição.",
    includes: ["Múltiplos workspaces", "Automações", "Brain com recomendações"],
    featured: true,
  },
  {
    name: "Scale",
    for: "Times e agências com várias contas.",
    includes: ["Times e permissões", "Histórico estendido", "Brain com execução"],
  },
  {
    name: "Enterprise",
    for: "Necessidades específicas de volume e governança.",
    includes: ["Limites sob medida", "Governança avançada", "Suporte dedicado"],
  },
];

function PricingSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionLabel>Planos</SectionLabel>
        <h2 className="type-h1 mt-3 text-foreground">Proporcional ao valor gerado.</h2>
        <p className="type-body mt-3 max-w-2xl text-muted-foreground">
          Teste de 14 dias com acesso completo. Valores em definição — os limites de cada plano são
          configuráveis por volume de dados, integrações, usuários e capacidade de execução.
        </p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={plan.featured ? "bg-primary-soft p-6" : "bg-background p-6"}
            >
              <div className="flex items-center justify-between">
                <h3 className="type-h3 text-foreground">{plan.name}</h3>
                {plan.featured && (
                  <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Popular
                  </span>
                )}
              </div>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{plan.for}</p>
              <ul className="mt-4 space-y-2">
                {plan.includes.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-background text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Começar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "O Costfy pode executar ações nas plataformas conectadas?",
    a: "Sim, quando a integração estiver conectada e a ação for aprovada por você. Toda ação de impacto exibe valor atual, valor proposto, motivo e risco antes da execução, e é registrada no log de auditoria.",
  },
  {
    q: "O que acontece antes de conectar uma integração?",
    a: "A plataforma mostra estados vazios explicativos. Nenhuma métrica fictícia é apresentada como se fosse dado real da sua operação.",
  },
  {
    q: "Como funciona o isolamento entre workspaces?",
    a: "Cada workspace tem seus próprios dados, membros, integrações e memória do Brain. O isolamento é aplicado no banco via Row Level Security, não apenas na interface.",
  },
  {
    q: "O Brain pode aumentar orçamento sozinho?",
    a: "Não sem autorização. O Brain nunca tem permissão implícita para gastar dinheiro, e guardrails definem limites máximos, ações permitidas e o que sempre exige aprovação.",
  },
  {
    q: "Quais moedas são suportadas?",
    a: "Cada transação preserva valor e moeda originais, taxa de câmbio, valor convertido e a moeda base do workspace. O valor original nunca é sobrescrito.",
  },
];

function FaqSection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <SectionLabel>Perguntas frequentes</SectionLabel>
        <h2 className="type-h1 mt-3 text-foreground">O que costumam perguntar.</h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-[15px]">{item.q}</AccordionTrigger>
              <AccordionContent className="type-body text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="grid-field pointer-events-none absolute inset-0 opacity-40"
        style={{
          maskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black, transparent)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
        <Boxes className="mx-auto size-5 text-primary" strokeWidth={1.5} />
        <h2 className="type-h1 mt-4 text-foreground">Seu negócio. Compreendido.</h2>
        <p className="type-body mx-auto mt-3 max-w-lg text-muted-foreground">
          Conecte sua operação e veja o que está acontecendo, por quê, o que importa e o que fazer a
          seguir.
        </p>
        <Link
          to="/signup"
          className="mt-7 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Iniciar teste de 14 dias
        </Link>
      </div>
    </section>
  );
}
