import { cn } from "@/lib/utils";

/**
 * Marca visual do Costfy Brain.
 *
 * Representação: um núcleo com nós conectados — inteligência, conexão, dados,
 * sistema. Deliberadamente NÃO é um cérebro literal.
 *
 * `state` comunica o estado operacional do Brain e é usado por
 * BrainThinking / BrainStatus. A animação existe para comunicar estado,
 * nunca para decorar.
 */
export interface CostfyMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Tamanho em pixels (quadrado). */
  size?: number;
  /** Estado operacional do Brain. */
  state?: "idle" | "thinking" | "muted";
}

export function CostfyMark({
  size = 24,
  state = "idle",
  className,
  ...props
}: CostfyMarkProps) {
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
      {/* Conexões: hierarquia de dados convergindo para o núcleo */}
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55">
        <path d="M12 12 L12 3.6" />
        <path d="M12 12 L19.3 7.8" />
        <path d="M12 12 L19.3 16.2" />
        <path d="M12 12 L12 20.4" />
        <path d="M12 12 L4.7 16.2" />
        <path d="M12 12 L4.7 7.8" />
      </g>
      {/* Nós */}
      <g fill="currentColor">
        <circle cx="12" cy="3.6" r="1.5" />
        <circle cx="19.3" cy="7.8" r="1.5" />
        <circle cx="19.3" cy="16.2" r="1.5" />
        <circle cx="12" cy="20.4" r="1.5" />
        <circle cx="4.7" cy="16.2" r="1.5" />
        <circle cx="4.7" cy="7.8" r="1.5" />
      </g>
      {/* Núcleo */}
      <circle
        cx="12"
        cy="12"
        r="3.4"
        fill="currentColor"
        className={thinking ? "animate-core" : undefined}
        style={{ transformOrigin: "12px 12px" }}
      />
    </svg>
  );
}

/** Lockup completo: marca + wordmark. */
export function CostfyLogo({
  className,
  markSize = 22,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CostfyMark size={markSize} className="text-primary" />
      <span className="text-[15px] font-semibold tracking-[-0.03em] text-foreground">
        Costfy
      </span>
    </span>
  );
}
