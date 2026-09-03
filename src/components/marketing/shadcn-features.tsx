import {
  Workflow,
  FileSpreadsheet,
  Cpu,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { CostfyMark } from "@/components/brand/costfy-mark";

const FEATURES = [
  {
    icon: Workflow,
    title: "Tracking First-Party & Pixel Próprio",
    tag: "Atribuição Confiável",
    description:
      "Rastreie visitantes e conversões com script próprio de 3KB sem ser bloqueado por AdBlockers ou atualizações do Safari/iOS. Tenha 100% de clareza de qual criativo realmente vendeu.",
    highlight: "Zero dependência de cookies de terceiros",
    colSpan: "lg:col-span-2",
  },
  {
    icon: FileSpreadsheet,
    title: "DRE Gerencial em Cascata & CMV Real",
    tag: "Lucro Líquido Real",
    description:
      "Pare de comemorar faturamento bruto ilusório. O Costfy desconta CMV por SKU, taxas de checkout (Hotmart, Kiwify, Mercado Pago), impostos e gastos com anúncios para revelar seu lucro no bolso.",
    highlight: "Visão diária e mensal consolidada",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Cpu,
    title: "Brain Copilot: IA com Guardrails",
    tag: "Inteligência Operacional",
    description:
      "O Brain monitora anomalias de CPC, CPA e margem 24/7. Quando identifica um problema ou oportunidade, ele formula a ação pronta e exige aprovação explícita com 1 clique.",
    highlight: "Nenhuma ação roda sem seu consentimento",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Zap,
    title: "Automações de Mídia & Alertas Preventivos",
    tag: "Proteção de Budget",
    description:
      "Defina regras automatizadas como 'Pausar anúncio se gasto > R$ 150 e 0 vendas' ou 'Alertar no Slack quando ROAS cair abaixo de 2.0x'. Proteja seu caixa enquanto dorme.",
    highlight: "Execução avaliada continuamente",
    colSpan: "lg:col-span-2",
  },
];

export function ShadcnFeatures() {
  return (
    <section id="features" className="py-24 sm:py-32 relative bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-[12px] font-medium text-primary mb-4">
            <CostfyMark size={14} />
            <span>Infraestrutura Completa de Operação</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Tudo o que seu negócio digital precisa em uma única tela
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
            Desenvolvido para infoprodutores, agências, SaaS e e-commerces que precisam de números exatos para escalar com margem positiva.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, index) => (
            <div
              key={index}
              className={`rounded-2xl border border-border/80 bg-card p-7 flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-[var(--shadow-raised)] relative overflow-hidden group ${feat.colSpan}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feat.icon className="size-6" />
                  </div>
                  <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  {feat.title}
                </h3>

                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="size-3.5 text-success" />
                  {feat.highlight}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                  Saiba mais <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
