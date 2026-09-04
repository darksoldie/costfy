import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/**
 * AnimatedNumber Component
 * 
 * Smoothly interpolates numerical values for financial cockpits and metrics.
 * Gracefully bails out to direct value when `prefers-reduced-motion` is active.
 */
export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString("pt-BR"),
  duration = 600,
  className,
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const diff = value - startValue;

    if (diff === 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: 1 - pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
        prevValueRef.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, reducedMotion]);

  return <span className={className}>{format(displayValue)}</span>;
}
