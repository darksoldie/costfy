import { cn } from "@/lib/utils";

export interface DotPatternProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  opacity?: "low" | "medium" | "high";
  fadeStyle?: "ellipse" | "circle" | "none";
}

export function DotPattern({
  className,
  size = "md",
  opacity = "medium",
  fadeStyle = "ellipse",
}: DotPatternProps) {
  const sizeMap = {
    sm: "[background-size:12px_12px]",
    md: "[background-size:16px_16px]",
    lg: "[background-size:24px_24px]",
  };

  const opacityMap = {
    low: "opacity-30",
    medium: "opacity-50",
    high: "opacity-75",
  };

  const fadeMap = {
    ellipse: "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,#000_70%,transparent_100%)]",
    circle: "[mask-image:radial-gradient(circle_at_50%_50%,#000_70%,transparent_100%)]",
    none: "",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)]",
        sizeMap[size],
        fadeMap[fadeStyle],
        opacityMap[opacity],
        className,
      )}
    />
  );
}
