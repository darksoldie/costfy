import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AuthLayout, GoogleButton } from "@/components/auth/auth-layout";
import { TextField } from "@/components/ui-kit/text-field";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Costfy" },
      {
        name: "description",
        content:
          "Acesse seu workspace no Costfy e acompanhe receita, investimento, lucro e margem em um só lugar.",
      },
      { property: "og:title", content: "Entrar — Costfy" },
      {
        property: "og:description",
        content: "Acesse o sistema operacional inteligente do seu negócio digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : signInError.message,
        );
        return;
      }
      await navigate({ to: "/dashboard", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
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

  return (
    <AuthLayout
      title="Entrar"
      description="Use o e-mail do seu workspace para continuar."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Criar conta
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <Link
          to="/forgot-password"
          className="block text-[13px] text-muted-foreground hover:text-foreground"
        >
          Esqueci minha senha
        </Link>
      </div>
    </AuthLayout>
  );
}
