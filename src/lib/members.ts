import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/workspaces";

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: AppRole;
  createdAt: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gestor",
  analyst: "Analista",
  media_buyer: "Mídia",
  finance: "Financeiro",
  viewer: "Leitura",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  owner: "Controle total, incluindo cobrança e exclusão do workspace.",
  admin: "Gerencia time, integrações e configurações.",
  manager: "Opera campanhas e aprova ações do Brain.",
  analyst: "Lê dados e cria análises, sem alterar integrações.",
  media_buyer: "Foco em mídia paga e criativos.",
  finance: "Foco em custos, taxas e margem.",
  viewer: "Apenas leitura.",
};

/** Papéis atribuíveis pela interface — owner é definido por trigger na criação. */
export const ASSIGNABLE_ROLES: AppRole[] = [
  "admin",
  "manager",
  "analyst",
  "media_buyer",
  "finance",
  "viewer",
];

export const membersQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["workspace-members", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
    queryFn: async (): Promise<WorkspaceMember[]> => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("workspace_members")
        .select("id, user_id, role, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      const rows = data ?? [];
      if (rows.length === 0) return [];

      // A tabela de membros aponta para auth.users, então o perfil é buscado
      // à parte — a policy de colegas de workspace autoriza esta leitura.
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in(
          "id",
          rows.map((row) => row.user_id),
        );

      if (profilesError) throw new Error(profilesError.message);

      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

      return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        role: row.role,
        createdAt: row.created_at,
        displayName: byId.get(row.user_id)?.display_name ?? null,
        avatarUrl: byId.get(row.user_id)?.avatar_url ?? null,
      }));
    },
  });

export const rolePermissionsQuery = () =>
  queryOptions({
    queryKey: ["role-permissions"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("role, permission_key");

      if (error) throw new Error(error.message);

      const map: Record<string, string[]> = {};
      for (const row of data ?? []) {
        (map[row.role] ??= []).push(row.permission_key);
      }
      return map;
    },
  });

export function useUpdateMemberRole(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useRemoveMember(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("workspace_members").delete().eq("id", memberId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });
}
