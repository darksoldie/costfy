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
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
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

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger" | "outline";
export type BadgeSize = "xs" | "sm";

const BADGE_VARIANT: Record<BadgeVariant, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  brand: "bg-primary-soft text-primary border-primary/25",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  outline: "bg-transparent text-muted-foreground border-border",
};

const BADGE_SIZE: Record<BadgeSize, string> = {
  xs: "px-1.5 py-0.5 text-[10.5px] rounded tracking-wide",
  sm: "px-2 py-0.5 text-[11.5px] rounded-md",
};

export function badgeClass(
  variant: BadgeVariant = "neutral",
  size: BadgeSize = "sm",
  className?: string,
) {
  return cn(
    "inline-flex items-center gap-1 font-medium border tabular-nums select-none",
    BADGE_VARIANT[variant],
    BADGE_SIZE[size],
    className,
  );
}

export type StatusType = "active" | "paused" | "warning" | "error" | "neutral";

export function statusDotClass(status: StatusType = "active") {
  const map: Record<StatusType, string> = {
    active: "bg-success",
    paused: "bg-muted-foreground/60",
    warning: "bg-warning",
    error: "bg-destructive",
    neutral: "bg-subtle-foreground/50",
  };
  return cn("inline-block size-2 rounded-full shrink-0", map[status]);
}

export const selectClass = cn(
  "h-10 w-full rounded-md border border-input bg-background px-3 text-[14px] text-foreground",
  "transition-colors hover:border-border-strong focus:border-primary focus:outline-none",
  "focus-visible:outline-none focus:ring-4 focus:ring-primary/12 disabled:opacity-55",
);

export const tableHeaderCellClass =
  "px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wider uppercase select-none";

export const tableHeaderNumericClass =
  "px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground tracking-wider uppercase select-none";

export const tableCellClass =
  "px-3 py-3 text-[13px] text-foreground border-t border-border/60 align-middle";

export const tableCellNumericClass =
  "px-3 py-3 text-[13px] text-foreground border-t border-border/60 align-middle text-right type-numeric tabular-nums";

export const tableRowClass = "transition-colors hover:bg-secondary/40 group";
