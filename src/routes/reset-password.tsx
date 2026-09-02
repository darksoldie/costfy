import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { TextField } from "@/components/ui-kit/text-field";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass } from "@/lib/ui";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir nova senha — Costfy" },
      {
        name: "description",
        content:
          "Defina uma nova senha para sua conta Costfy e retome o acesso ao seu workspace com segurança.",
      },
      { property: "og:title", content: "Definir nova senha — Costfy" },
      {
        property: "og:description",
        content: "Escolha uma nova senha para sua conta Costfy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // A sessão de recuperação chega pelo link do e-mail e é hidratada pelo cliente.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    // Em sessão de recuperação não se envia a senha atual.
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    await navigate({ to: "/", replace: true });
  }

  return (
    <AuthLayout
      title="Definir nova senha"
      description={
        ready
          ? "Escolha uma senha nova para sua conta."
          : "Abra esta página pelo link enviado ao seu e-mail para redefinir a senha."
      }
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      {done ? (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="type-body-sm text-muted-foreground">Senha atualizada.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            required
            disabled={!ready}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Mínimo de 8 caracteres."
            placeholder="••••••••"
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            required
            disabled={!ready}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
          {error && (
            <p role="alert" className="text-[12.5px] text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !ready}
            className={buttonClass("primary", "lg", "w-full")}
          >
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
