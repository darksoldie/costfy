import { cn } from "@/lib/utils";

/**
 * Símbolo oficial do Costfy.
 *
 * Construção (grid 24×24):
 * - Arco em "C" aberto à direita — o sistema que envolve a operação.
 * - Núcleo sólido no centro — o dado compreendido (Brain).
 * - Nó menor na abertura do arco — a ação que sai do sistema.
 *
 * O símbolo é geométrico e desenhado a partir de um único centro óptico.
 * Não deve ser redesenhado, distorcido ou recolorido fora dos tokens.
 */
export interface CostfyMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Tamanho em pixels (quadrado). */
  size?: number;
  /** Estado operacional do Brain — a animação existe para comunicar estado. */
  state?: "idle" | "thinking" | "muted";
}

export function CostfyMark({ size = 24, state = "idle", className, ...props }: CostfyMarkProps) {
  const thinking = state === "thinking";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Costfy"
      className={cn(state === "muted" && "opacity-60", className)}
      {...props}
    >
      {/* Arco em C — abertura à direita */}
      <path
        d="M17.63 6.05 A7.6 7.6 0 1 0 17.63 17.95"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Núcleo */}
      <circle
        cx="11.1"
        cy="12"
        r="2.75"
        fill="currentColor"
        className={thinking ? "animate-core" : undefined}
        style={{ transformOrigin: "11.1px 12px" }}
      />
      {/* Nó de saída */}
      <circle cx="19.6" cy="12" r="1.75" fill="currentColor" />
    </svg>
  );
}

export interface CostfyLogoProps {
  className?: string;
  /** Tamanho do símbolo em pixels. */
  markSize?: number;
  /** Exibe a assinatura oficial abaixo do wordmark. */
  withTagline?: boolean;
}

/** Lockup horizontal oficial: símbolo + wordmark (+ assinatura opcional). */
export function CostfyLogo({ className, markSize = 22, withTagline = false }: CostfyLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <CostfyMark size={markSize} className="text-primary" />
      <span className="flex flex-col leading-none">
        <span className="text-[16px] font-semibold tracking-[-0.035em] text-foreground">
          Costfy
        </span>
        {withTagline && (
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-subtle-foreground">
            Your business. Understood.
          </span>
        )}
      </span>
    </span>
  );
}
