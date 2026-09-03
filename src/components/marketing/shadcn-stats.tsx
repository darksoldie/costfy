import { ShieldCheck, TrendingUp, Zap, Clock } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";

const STATS = [
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Atribuição First-Party",
    description: "Sem perda de conversões por bloqueios iOS/Safari",
  },
  {
    icon: TrendingUp,
    value: "R$ 48M+",
    label: "Volume Rastreado",
    description: "Processado com reconciliação de CMV e DRE em cascata",
  },
  {
    icon: Zap,
    value: "3,88x",
    label: "ROAS Médio",
    description: "Otimização automática com guardrails de lucratividade",
  },
  {
    icon: Clock,
    value: "< 80ms",
    label: "Processamento Instantâneo",
    description: "Webhooks Hotmart, Kiwify, Stripe e Mercado Pago",
  },
];

export function ShadcnStats() {
  return (
    <section id="stats" className="py-16 sm:py-20 relative overflow-hidden border-y border-border/60 bg-surface/30">
      <DotPattern className="opacity-40" size="sm" fadeStyle="circle" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/80 bg-background/80 p-5 sm:p-6 backdrop-blur-sm shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">Métrica Real</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="mt-1 text-[13.5px] font-semibold text-foreground">
                {stat.label}
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
