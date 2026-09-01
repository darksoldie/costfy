import { useEffect, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

import { CostfyMark } from "@/components/brand/costfy-mark";
import { cn } from "@/lib/utils";

/**
 * Composição do hero: uma superfície de produto realista do Costfy.
 *
 * A animação existe para comunicar o loop do produto
 * (dado → compreensão → insight → recomendação), não para decorar.
 * Todos os valores exibidos são ilustrativos e marcados como demonstração.
 */

const BRAIN_STAGES = [
  "Lendo campanhas ativas",
  "Cruzando vendas e investimento",
  "Calculando margem por produto",
  "Identificando oportunidades",
] as const;

/** Valores de demonstração — não representam dados reais de nenhuma operação. */
const DEMO_REVENUE = 184_20;
const DEMO_SERIES = [38, 44, 41, 52, 49, 61, 58, 72, 68, 81, 77, 92];

export function HeroProduct() {
  const [stage, setStage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [revenue, setRevenue] = useState(0);

  // Progressão do Brain: cada etapa é um estado real da composição.
  useEffect(() => {
    if (stage >= BRAIN_STAGES.length) {
      const done = window.setTimeout(() => setRevealed(true), 420);
      return () => window.clearTimeout(done);
    }
    const timer = window.setTimeout(() => setStage((s) => s + 1), 780);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // Contador de receita: comunica atualização de dado, com duração curta.
  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setRevenue(Math.round(DEMO_REVENUE * 100 * eased) / 100);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const max = Math.max(...DEMO_SERIES);

  return (
    <div className="surface-panel overflow-hidden shadow-[var(--shadow-overlay)]">
      {/* Barra de janela */}
      <div className="flex items-center gap-3 border-b border-border bg-elevated px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CostfyMark size={16} className="text-primary" />
          <span className="text-[12px] font-medium text-foreground">Overview</span>
        </div>
        <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Demonstração
        </span>
        <span className="ml-auto text-[11px] text-subtle-foreground">
          Últimos 30 dias
        </span>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-[1.35fr_1fr]">
        {/* Painel de dados */}
        <div className="bg-background p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="type-caption text-subtle-foreground">Receita</p>
              <p className="type-numeric mt-1 text-3xl text-foreground">
                R$&nbsp;
                {revenue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[12px] font-medium text-success">
              <ArrowUpRight className="size-3.5" />
              12,4%
            </span>
          </div>

          <div className="mt-5 flex h-24 items-end gap-1.5" aria-hidden>
            {DEMO_SERIES.map((value, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-primary/15"
                style={{
                  height: `${(value / max) * 100}%`,
                  animation: `costfy-rise 520ms cubic-bezier(0.22,1,0.36,1) ${i * 45}ms both`,
                }}
              >
                <div
                  className="h-full w-full rounded-sm bg-primary"
                  style={{ opacity: i === DEMO_SERIES.length - 1 ? 1 : 0.35 }}
                />
              </div>
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {[
              { label: "Investimento", value: "R$ 41.780" },
              { label: "Lucro", value: "R$ 62.140" },
              { label: "Margem", value: "33,7%" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-surface px-3 py-2.5">
                <dt className="text-[10px] uppercase tracking-wide text-subtle-foreground">
                  {kpi.label}
                </dt>
                <dd className="type-numeric mt-0.5 text-sm text-foreground">
                  {kpi.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Painel do Brain */}
        <div className="bg-surface p-5">
          <div className="flex items-center gap-2">
            <CostfyMark
              size={16}
              state={revealed ? "idle" : "thinking"}
              className="text-accent"
            />
            <span className="text-[12px] font-medium text-foreground">Brain</span>
          </div>

          <ul className="mt-4 space-y-2" aria-live="polite">
            {BRAIN_STAGES.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-2 text-[12.5px] transition-colors",
                    done
                      ? "text-muted-foreground"
                      : active
                        ? "text-foreground"
                        : "text-subtle-foreground/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border",
                      done
                        ? "border-success/40 bg-success/10 text-success"
                        : active
                          ? "border-accent/50 bg-accent/10"
                          : "border-border",
                    )}
                  >
                    {done ? (
                      <Check className="size-2.5" />
                    ) : active ? (
                      <span className="animate-core size-1.5 rounded-full bg-accent" />
                    ) : null}
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>

          {revealed && (
            <div className="animate-rise mt-4 rounded-lg border border-accent/25 bg-accent/[0.06] p-3">
              <p className="type-caption text-accent">Oportunidade</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                Uma campanha manteve ROAS acima de 4,5x nas últimas 12 horas com
                orçamento limitado.
              </p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Recomendação: revisar o orçamento diário — a execução exige sua
                aprovação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
