import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AuthLayout, GoogleButton } from "@/components/auth/auth-layout";
import { TextField } from "@/components/ui-kit/text-field";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — Costfy | 14 dias de teste" },
      {
        name: "description",
        content:
          "Crie sua conta no Costfy e conecte mídia, vendas e finanças em um único sistema. 14 dias de teste, sem cartão.",
      },
      { property: "og:title", content: "Criar conta — Costfy" },
      {
        property: "og:description",
        content: "Comece com 14 dias de teste no sistema operacional do seu negócio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name.trim() },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // Com confirmação de e-mail ativa, não há sessão até o link ser clicado.
      if (data.session) {
        await navigate({ to: "/dashboard", replace: true });
        return;
      }
      setConfirmationSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.redirected) return;
    setGoogleLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await navigate({ to: "/dashboard", replace: true });
  }

  if (confirmationSent) {
    return (
      <AuthLayout
        title="Confirme seu e-mail"
        description={`Enviamos um link de confirmação para ${email.trim()}. Depois de confirmar, você poderá entrar e criar seu workspace.`}
        footer={
          <Link to="/login" className="font-medium text-primary hover:underline">
            Voltar para entrar
          </Link>
        }
      >
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="type-body-sm text-muted-foreground">
            Não recebeu? Verifique a caixa de spam ou tente novamente em alguns minutos.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      description="14 dias de teste. Sem cartão para começar."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continuar com Google" />

        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wide text-subtle-foreground">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Nome"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como devemos te chamar"
          />
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Mínimo de 8 caracteres."
            placeholder="••••••••"
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
            {loading ? "Criando conta…" : "Criar conta"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
