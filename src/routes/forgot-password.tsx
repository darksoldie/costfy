import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { TextField } from "@/components/ui-kit/text-field";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Costfy" },
      {
        name: "description",
        content:
          "Receba um link seguro para redefinir a senha da sua conta Costfy e voltar ao seu workspace.",
      },
      { property: "og:title", content: "Recuperar senha — Costfy" },
      {
        property: "og:description",
        content: "Enviamos um link seguro para você definir uma nova senha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      description="Informe o e-mail da sua conta. Se ele existir, enviaremos um link para definir uma nova senha."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="type-body-sm text-muted-foreground">
            Se houver uma conta para <strong className="text-foreground">{email.trim()}</strong>,
            o link de redefinição chegará em instantes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
          {error && (
            <p role="alert" className="text-[12.5px] text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={buttonClass("primary", "lg", "w-full")}
          >
            {loading ? "Enviando…" : "Enviar link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
