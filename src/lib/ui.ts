import { cn } from "@/lib/utils";

/**
 * Classes canônicas de controles do design system.
 *
 * Existe como função (e não como componente) para servir tanto a <button>
 * quanto ao <Link> do router sem duplicar estilo.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-[var(--shadow-subtle)]",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
  outline:
    "border border-border bg-background text-foreground hover:bg-secondary hover:text-foreground",
  ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-md gap-1.5",
  md: "h-9 px-4 text-[13.5px] rounded-md gap-2",
  lg: "h-11 px-5 text-[14.5px] rounded-lg gap-2",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex select-none items-center justify-center font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-55",
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

export const inputClass = cn(
  "h-10 w-full rounded-md border border-input bg-background px-3 text-[14px] text-foreground",
  "placeholder:text-subtle-foreground transition-colors",
  "hover:border-border-strong focus:border-primary focus:outline-none",
  "focus-visible:outline-none focus:ring-4 focus:ring-primary/12",
  "disabled:opacity-55",
);
