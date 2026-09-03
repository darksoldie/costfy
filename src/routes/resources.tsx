import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, LifeBuoy, Plug, ShieldCheck } from "lucide-react";

import { MarketingPage, PageIntro, Section } from "@/components/marketing/marketing-page";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Recursos — Costfy | Documentação, integrações e segurança" },
      {
        name: "description",
        content:
          "Materiais do Costfy: como conectar integrações, como funciona o Brain, papéis e permissões, e como tratamos segurança e auditoria.",
      },
      { property: "og:title", content: "Recursos — Costfy" },
      {
        property: "og:description",
        content: "Documentação prática para colocar sua operação dentro do Costfy com segurança.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

const TOPICS = [
  {
    icon: Plug,
    title: "Integrações",
    text: "Cada conexão tem estado explícito: conectando, conectada, sincronizando, atrasada, com erro ou pausada. Você sempre sabe se o dado é confiável.",
  },
  {
    icon: BookOpen,
    title: "Como o Brain pensa",
    text: "Insight, contexto, impacto estimado e recomendação. Nenhuma sugestão aparece sem a explicação do porquê.",
  },
  {
    icon: ShieldCheck,
    title: "Papéis e permissões",
    text: "Owner, Admin, Manager, Analyst, Media Buyer, Finance e Viewer. Cada permissão é concedida por papel, dentro de um workspace.",
  },
  {
    icon: LifeBuoy,
    title: "Segurança e auditoria",
    text: "Isolamento por workspace no banco, registro de quem fez o quê e valores antes e depois de cada alteração.",
  },
];

function ResourcesPage() {
  return (
    <MarketingPage>
      <PageIntro
        eyebrow="Recursos"
        title="Tudo que você precisa para operar com confiança"
        description="A documentação acompanha o produto: o que existe hoje está descrito aqui. Nada de promessas sem implementação."
      >
        <Link to="/signup" className={buttonClass("primary", "lg")}>
          Criar conta
        </Link>
      </PageIntro>

      <Section>
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          {TOPICS.map((t) => (
            <article key={t.title} className="bg-background p-6">
              <t.icon className="size-4 text-primary" aria-hidden />
              <h2 className="type-h3 mt-3 text-foreground">{t.title}</h2>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{t.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </MarketingPage>
  );
}
