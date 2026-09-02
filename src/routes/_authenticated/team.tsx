import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import {
  ASSIGNABLE_ROLES,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  membersQuery,
  rolePermissionsQuery,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/lib/members";
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
  component: () => (
    <WorkspaceProvider>
      <TeamPage />
    </WorkspaceProvider>
  ),
});

function TeamPage() {
  const { active, loading } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const members = useQuery(membersQuery(workspaceId));
  const permissions = useQuery(rolePermissionsQuery());

  const canManage = Boolean(
    active && (permissions.data?.[active.role] ?? []).includes("manage_members"),
  );

  return (
    <AppShell
      title="Time e permissões"
      description="Quem participa deste workspace e o que cada papel pode fazer."
    >
      {!loading && !active && (
        <p className="type-body-sm text-muted-foreground">
          Crie um workspace para convidar pessoas.
        </p>
      )}

      {active && (
        <div className="space-y-6">
          {members.error instanceof Error && (
            <p role="alert" className="type-body-sm text-destructive">
              Não foi possível carregar o time: {members.error.message}
            </p>
          )}

          <section className="rounded-lg border border-border bg-card">
            <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="type-h3 text-foreground">Membros</h2>
                <p className="type-body-sm mt-1 text-muted-foreground">
                  {members.data?.length ?? 0} pessoa(s) com acesso a{" "}
                  {active.workspace.name}.
                </p>
              </div>
              {!canManage && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[12px] text-muted-foreground">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Somente leitura
                </span>
              )}
            </header>

            {members.isPending ? (
              <div className="space-y-2 p-5">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="h-14 animate-pulse rounded-md bg-secondary/60"
                  />
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

          <InviteCard canManage={canManage} />

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="type-h3 text-foreground">O que cada papel faz</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(Object.keys(ROLE_LABEL) as AppRole[]).map((role) => (
                <div key={role} className="rounded-md border border-border p-3">
                  <dt className="text-[13px] font-medium text-foreground">
                    {ROLE_LABEL[role]}
                  </dt>
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
    </AppShell>
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
        <span className="block truncate text-[13.5px] font-medium text-foreground">
          {label}
        </span>
        <span className="block text-[12px] text-subtle-foreground">
          {ROLE_LABEL[role]}
        </span>
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

function InviteCard({ canManage }: { canManage: boolean }) {
  const [email, setEmail] = useState("");

  return (
    <section className="rounded-lg border border-dashed border-border p-5">
      <h2 className="type-h3 text-foreground">Convidar pessoas</h2>
      <p className="type-body-sm mt-2 max-w-2xl text-muted-foreground">
        O envio de convites por e-mail ainda não está ativo. Enquanto isso, quem já
        criou conta no Costfy pode ser adicionado por um administrador assim que o
        fluxo de convites entrar no ar — preferimos deixar isso explícito a simular
        um envio que não acontece.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="pessoa@empresa.com"
          disabled
          aria-label="E-mail do convidado"
          className={cn(inputClass, "h-9 max-w-xs text-[13px]")}
        />
        <button type="button" disabled className={buttonClass("primary", "sm")}>
          {canManage ? "Em breve" : "Sem permissão"}
        </button>
      </div>
    </section>
  );
}
