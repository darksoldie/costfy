import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, Building2, Shield, UserCheck } from "lucide-react";

import { CostfyLogo } from "@/components/brand/costfy-mark";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABEL } from "@/lib/members";
import type { AppRole } from "@/lib/workspaces";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [{ title: "Convite de Workspace — Costfy" }],
  }),
  component: InviteAcceptancePage,
});

interface InviteDetails {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: AppRole;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
}

function InviteAcceptancePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        setCurrentUser(sessionData.session?.user ?? null);

        const res = await fetch(`/api/invitations/details?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.error || "Convite não encontrado ou inválido.");
        }

        const json = (await res.json()) as InviteDetails;
        setDetails(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao carregar convite.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Você precisa estar autenticado para aceitar o convite.");
      }

      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Falha ao aceitar o convite.");
      }

      // Redireciona para o dashboard do workspace
      await navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao aceitar convite.");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 text-foreground selection:bg-primary/10 selection:text-primary">
      <div className="w-full max-w-md space-y-6 animate-fade">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <CostfyLogo markSize={28} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Convite para Workspace
          </h1>
        </div>

        <div className="editorial-card p-6 space-y-5 bg-card">
          {loading ? (
            <div className="py-8 text-center space-y-2">
              <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[13px] text-muted-foreground">Validando convite seguro...</p>
            </div>
          ) : error ? (
            <div className="space-y-4 text-center py-4">
              <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold text-foreground">Não foi possível acessar o convite</h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">{error}</p>
              </div>
              <div className="pt-2">
                <Link to="/login" className={buttonClass("outline", "sm")}>
                  Ir para o login
                </Link>
              </div>
            </div>
          ) : details ? (
            <div className="space-y-5">
              {details.status === "accepted" ? (
                <div className="text-center space-y-3 py-3">
                  <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">Este convite já foi aceito</h3>
                  <p className="text-[12.5px] text-muted-foreground">
                    Você já é membro deste workspace. Acesse o Cockpit Executivo para continuar.
                  </p>
                  <Link to="/dashboard" className={buttonClass("primary", "md", "w-full")}>
                    Acessar Dashboard
                  </Link>
                </div>
              ) : details.status === "expired" ? (
                <div className="text-center space-y-3 py-3">
                  <div className="size-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="size-5" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">Convite Expirado</h3>
                  <p className="text-[12.5px] text-muted-foreground">
                    Este convite ultrapassou o período de validade de 7 dias. Solicite um novo envio ao administrador.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border/70 bg-surface/50 p-4 space-y-3 text-[13px]">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="size-4.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Workspace
                        </span>
                        <p className="font-semibold text-foreground text-[14px]">
                          {details.workspaceName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                      <div className="size-9 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
                        <Shield className="size-4.5 text-primary" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Papel Atribuído
                        </span>
                        <p className="font-medium text-foreground">
                          {ROLE_LABEL[details.role] || details.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[12.5px] text-muted-foreground text-center">
                    Convite enviado para: <strong className="text-foreground">{details.email}</strong>
                  </p>

                  {currentUser ? (
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        disabled={accepting}
                        onClick={handleAccept}
                        className={buttonClass("primary", "md", "w-full gap-2")}
                      >
                        <UserCheck className="size-4" />
                        <span>{accepting ? "Ingressando no workspace..." : "Aceitar Convite e Entrar"}</span>
                      </button>
                      <p className="text-[11px] text-center text-muted-foreground">
                        Conectado como {currentUser.email}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <Link
                        to="/login"
                        className={buttonClass("primary", "md", "w-full gap-2")}
                      >
                        <span>Entrar para aceitar convite</span>
                        <ArrowRight className="size-4" />
                      </Link>
                      <p className="text-[11px] text-center text-muted-foreground">
                        Não tem conta?{" "}
                        <Link to="/signup" className="text-primary hover:underline font-semibold">
                          Criar conta
                        </Link>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>

        <p className="text-[11px] text-center text-muted-foreground">
          Costfy Operating System · Convite seguro e criptografado
        </p>
      </div>
    </div>
  );
}
