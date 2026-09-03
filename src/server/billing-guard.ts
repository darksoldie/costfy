import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class WorkspaceReadOnlyError extends Error {
  constructor(message = "O workspace está em modo somente leitura devido a expiração de trial ou pendência de pagamento.") {
    super(message);
    this.name = "WorkspaceReadOnlyError";
  }
}

/**
 * Guarda de servidor para proteger mutações (POST, PUT, PATCH, DELETE, Action Engine).
 * Impede que workspaces com status 'read_only' ou 'suspended' realizem alterações operacionais.
 */
export async function requireWorkspaceWriteAccess(workspaceId: string): Promise<void> {
  if (!workspaceId) {
    throw new Error("Workspace ID não fornecido para validação de acesso.");
  }

  const { data: workspace, error } = await supabaseAdmin
    .from("workspaces")
    .select("status, name")
    .eq("id", workspaceId)
    .single();

  if (error || !workspace) {
    throw new Error(`Workspace não encontrado: ${error?.message || workspaceId}`);
  }

  if (workspace.status === "read_only") {
    throw new WorkspaceReadOnlyError(
      `O workspace "${workspace.name}" está em modo somente leitura porque o período de testes encerrou ou há uma pendência de faturamento. Acesse "Configurações > Faturamento" para assinar um plano e desbloquear as operações.`,
    );
  }

  if (workspace.status === "suspended") {
    throw new Error(
      `O workspace "${workspace.name}" está suspenso. Entre em contato com o suporte ou reative a assinatura para retomar as operações.`,
    );
  }
}
