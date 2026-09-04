import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Clock,
  Copy,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

import { useWorkspace } from "@/components/app/workspace-context";
import {
  ASSIGNABLE_ROLES,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  invitationsQuery,
  membersQuery,
  rolePermissionsQuery,
  useCreateInvitation,
  useRemoveMember,
  useRevokeInvitation,
  useUpdateMemberRole,
  type WorkspaceInvitation,
} from "@/lib/members";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/lib/workspaces";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Time e permissões — Costfy" },
      {
        name: "description",
        content:
          "Gerencie quem participa do workspace e o que cada papel pode ver, aprovar e alterar no Costfy.",
      },
      { property: "og:title", content: "Time e permissões — Costfy" },
      {
        property: "og:description",
        content: "Papéis granulares e controle de acesso por workspace.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { active, loading } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const members = useQuery(membersQuery(workspaceId));
  const permissions = useQuery(rolePermissionsQuery());
  const invitations = useQuery(invitationsQuery(workspaceId));

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const canManage = Boolean(
    active && (permissions.data?.[active.role] ?? []).includes("manage_members"),
  );

  return (
    <>
      {!loading && !active && (
        <p className="type-body-sm text-muted-foreground">
          Crie ou selecione um workspace para gerenciar o time.
        </p>
      )}

      {active && (
        <div className="space-y-6">
          {members.error instanceof Error && (
            <p role="alert" className="type-body-sm text-destructive">
              Não foi possível carregar o time: {members.error.message}
            </p>
          )}

          {/* Seção Membros Ativos */}
          <section className="rounded-lg border border-border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="type-h3 text-foreground">Membros</h2>
                <p className="type-body-sm mt-1 text-muted-foreground">
                  {members.data?.length ?? 0} pessoa(s) com acesso ativo a {active.workspace.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!canManage && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[12px] text-muted-foreground">
                    <ShieldCheck className="size-3.5" aria-hidden />
                    Somente leitura
                  </span>
                )}

                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className={cn(buttonClass("primary", "sm"), "gap-1.5")}
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Convidar pessoa
                  </button>
                )}
              </div>
            </header>

            {members.isPending ? (
              <div className="space-y-2 p-5">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="h-14 animate-pulse rounded-md bg-secondary/60" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {(members.data ?? []).map((member) => (
                  <MemberRow
                    key={member.id}
                    workspaceId={workspaceId}
                    memberId={member.id}
                    name={member.displayName}
                    role={member.role}
                    canManage={canManage}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Seção Convites Pendentes (se tiver permissão de gerenciar) */}
          {canManage && (
            <section className="rounded-lg border border-border bg-card">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h2 className="type-h3 text-foreground">Convites Pendentes</h2>
                  <p className="type-body-sm mt-1 text-muted-foreground">
                    Convites enviados aguardando confirmação do convidado.
                  </p>
                </div>
              </header>

              {invitations.isPending ? (
                <div className="p-5 space-y-2">
                  <div className="h-10 animate-pulse rounded-md bg-secondary/60" />
                </div>
              ) : (invitations.data ?? []).filter((inv) => inv.status === "pending").length === 0 ? (
                <div className="p-5 text-center">
                  <p className="type-body-sm text-muted-foreground">
                    Nenhum convite pendente no momento.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {(invitations.data ?? [])
                    .filter((inv) => inv.status === "pending")
                    .map((invitation) => (
                      <PendingInviteRow
                        key={invitation.id}
                        workspaceId={workspaceId}
                        invitation={invitation}
                      />
                    ))}
                </ul>
              )}
            </section>
          )}

          {/* Modal de Convidar Membro */}
          <InviteModal
            open={isInviteModalOpen}
            onOpenChange={setIsInviteModalOpen}
            workspaceId={workspaceId}
          />

          {/* Guia de Papéis e Permissões */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="type-h3 text-foreground">O que cada papel faz</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(Object.keys(ROLE_LABEL) as AppRole[]).map((role) => (
                <div key={role} className="rounded-md border border-border p-3">
                  <dt className="text-[13px] font-medium text-foreground">{ROLE_LABEL[role]}</dt>
                  <dd className="mt-1 text-[12.5px] text-muted-foreground">
                    {ROLE_DESCRIPTION[role]}
                  </dd>
                  <dd className="mt-2 text-[11.5px] text-subtle-foreground">
                    {(permissions.data?.[role] ?? []).length} permissão(ões)
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </>
  );
}

interface MemberRowProps {
  workspaceId: string | null;
  memberId: string;
  name: string | null;
  role: AppRole;
  canManage: boolean;
}

function MemberRow({ workspaceId, memberId, name, role, canManage }: MemberRowProps) {
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);
  const isOwner = role === "owner";
  const label = name?.trim() || "Membro sem nome definido";

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-[12px] font-semibold text-foreground">
        {label.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-foreground">{label}</span>
        <span className="block text-[12px] text-subtle-foreground">{ROLE_LABEL[role]}</span>
      </span>

      {canManage && !isOwner ? (
        <>
          <label className="sr-only" htmlFor={`role-${memberId}`}>
            Papel do membro
          </label>
          <select
            id={`role-${memberId}`}
            value={role}
            disabled={updateRole.isPending}
            onChange={(event) =>
              updateRole.mutate({ memberId, role: event.target.value as AppRole })
            }
            className={cn(inputClass, "h-9 w-auto min-w-40 text-[13px]")}
          >
            {ASSIGNABLE_ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABEL[option]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeMember.mutate(memberId)}
            disabled={removeMember.isPending}
            aria-label={`Remover ${label} do workspace`}
            className={buttonClass("outline", "sm")}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </>
      ) : (
        <span className="rounded-md border border-border px-2.5 py-1 text-[12px] text-muted-foreground">
          {isOwner ? "Proprietário" : ROLE_LABEL[role]}
        </span>
      )}
    </li>
  );
}

function PendingInviteRow({
  workspaceId,
  invitation,
}: {
  workspaceId: string | null;
  invitation: WorkspaceInvitation;
}) {
  const revoke = useRevokeInvitation(workspaceId);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${invitation.token}`
      : `/invite/${invitation.token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(invitation.expiresAt));

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-foreground">{invitation.email}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span>{ROLE_LABEL[invitation.role]}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-warning">
              <Clock className="size-3" />
              Expira em {formattedDate}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          className={cn(buttonClass("outline", "sm"), "gap-1.5 text-[12px]")}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-success" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copiar link
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => revoke.mutate(invitation.id)}
          disabled={revoke.isPending}
          aria-label={`Revogar convite para ${invitation.email}`}
          className={cn(buttonClass("outline", "sm"), "text-destructive hover:bg-destructive/10")}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

function InviteModal({
  open,
  onOpenChange,
  workspaceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string | null;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("analyst");
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createInvite = useCreateInvitation(workspaceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !workspaceId) return;

    createInvite.mutate(
      { email: email.trim(), role },
      {
        onSuccess: (data) => {
          setCreatedUrl(data.inviteUrl);
        },
      },
    );
  };

  const handleClose = () => {
    setEmail("");
    setRole("analyst");
    setCreatedUrl(null);
    setCopied(false);
    createInvite.reset();
    onOpenChange(false);
  };

  const copyUrl = async () => {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (!val ? handleClose() : onOpenChange(val))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Convidar para o workspace</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gere um convite seguro. O membro receberá o papel selecionado ao aceitar.
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-success/30 bg-success/10 p-3 text-[13px] text-foreground">
              Convite gerado com sucesso para <strong>{email}</strong>!
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground">Link do convite</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdUrl}
                  className={cn(inputClass, "h-9 flex-1 text-[12px] font-mono select-all")}
                />
                <button
                  type="button"
                  onClick={copyUrl}
                  className={cn(buttonClass("primary", "sm"), "gap-1.5 shrink-0")}
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copiar
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                Envie o link para o convidado. O convite é de uso único e expira em 7 dias.
              </p>
            </div>

            <DialogFooter className="mt-4">
              <button
                type="button"
                onClick={handleClose}
                className={buttonClass("outline", "sm")}
              >
                Fechar
              </button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {createInvite.error instanceof Error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-[12.5px] text-destructive">
                {createInvite.error.message}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="invite-email" className="text-[12.5px] font-medium text-foreground">
                E-mail do convidado
              </label>
              <input
                id="invite-email"
                type="email"
                required
                placeholder="exemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(inputClass, "h-9 w-full text-[13px]")}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="invite-role" className="text-[12.5px] font-medium text-foreground">
                Papel no workspace
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className={cn(inputClass, "h-9 w-full text-[13px]")}
              >
                {ASSIGNABLE_ROLES.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {ROLE_LABEL[roleOption]}
                  </option>
                ))}
              </select>
              <p className="text-[11.5px] text-muted-foreground">
                {ROLE_DESCRIPTION[role]}
              </p>
            </div>

            <DialogFooter className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={createInvite.isPending}
                className={buttonClass("outline", "sm")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createInvite.isPending || !email.trim()}
                className={buttonClass("primary", "sm")}
              >
                {createInvite.isPending ? "Gerando convite..." : "Gerar convite"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
