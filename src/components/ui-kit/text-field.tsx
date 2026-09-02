import { useId } from "react";

import { inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  /** Texto de apoio exibido abaixo do campo. */
  hint?: string;
  /** Mensagem de erro; substitui o hint e marca o campo como inválido. */
  error?: string;
}

/** Campo de texto rotulado — rótulo sempre visível, nunca apenas placeholder. */
export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[12.5px] font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          inputClass,
          error && "border-destructive focus:border-destructive focus:ring-destructive/12",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-[12px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-subtle-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
