import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type BusinessType = Database["public"]["Enums"]["business_type"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type Integration = Database["public"]["Tables"]["integrations"]["Row"];

const ACTIVE_KEY = "costfy.active-workspace";

/** Workspace ativo é uma preferência de interface, não um dado sensível. */
export function readActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function writeActiveWorkspaceId(id: string) {
  try {
    window.localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* armazenamento indisponível — a seleção volta ao primeiro workspace */
  }
}

export interface MembershipWorkspace {
  workspace: Workspace;
  role: AppRole;
}

export const workspacesQuery = () =>
  queryOptions({
    queryKey: ["workspaces"],
    staleTime: 30_000,
    queryFn: async (): Promise<MembershipWorkspace[]> => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("role, workspaces:workspace_id(*)")
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);

      return (data ?? [])
        .filter((row) => row.workspaces && !row.workspaces.deleted_at)
        .map((row) => ({
          role: row.role,
          workspace: row.workspaces as Workspace,
        }));
    },
  });

export const integrationsQuery = (workspaceId: string | null) =>
  queryOptions({
    queryKey: ["integrations", workspaceId],
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
    queryFn: async (): Promise<Integration[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("provider", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export interface CreateWorkspaceInput {
  name: string;
  businessType: BusinessType;
}

/**
 * Cria o workspace do usuário autenticado.
 *
 * O papel de owner é atribuído por trigger no banco — não há escrita de papel
 * a partir do cliente, o que evita escalonamento de privilégio.
 *
 * NOTA TÉCNICA: Não usamos `.insert().select()` (INSERT ... RETURNING) porque
 * a cláusula RETURNING do PostgREST é avaliada ANTES do trigger AFTER INSERT
 * `handle_new_workspace` inserir a linha em workspace_members. Como a policy
 * SELECT de workspaces exige is_workspace_member(id, auth.uid()), o RETURNING
 * falha com "violates row-level security policy". A solução canônica é a
 * migration 20260902211200_fix_workspace_creation_rls.sql que adiciona uma
 * policy SELECT complementar via created_by = auth.uid(). Este código também
 * é resiliente ao separar INSERT e SELECT em dois passos.
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, businessType }: CreateWorkspaceInput) => {
      const trimmed = name.trim();
      if (trimmed.length < 2) throw new Error("Informe o nome do workspace.");

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Sessão expirada. Entre novamente.");

      const base = slugify(trimmed) || "workspace";
      const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

      // Passo 1: INSERT puro sem RETURNING (evita conflito de RLS SELECT + trigger AFTER INSERT)
      const { error: insertError } = await supabase.from("workspaces").insert({
        name: trimmed,
        slug,
        business_type: businessType,
        created_by: userData.user.id,
      });

      if (insertError) throw new Error(insertError.message);

      // Passo 2: SELECT separado — neste ponto o trigger AFTER INSERT já executou
      // e a linha em workspace_members existe, satisfazendo a policy SELECT.
      // Usamos slug como chave natural (UNIQUE) para localizar o workspace recém-criado.
      const { data, error: selectError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("slug", slug)
        .eq("created_by", userData.user.id)
        .single();

      if (selectError || !data) {
        throw new Error(
          selectError?.message ??
            "Workspace criado, mas não localizado. Tente recarregar a página.",
        );
      }

      return data;
    },
    onSuccess: (workspace) => {
      writeActiveWorkspaceId(workspace.id);
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
