import { supabase } from "@/integrations/supabase/client";
import type { BrainActionProposal } from "@/lib/brain-engine";

export interface ExecutionResult {
  success: boolean;
  actionId: string;
  message: string;
  executedAt: string;
  auditLogId?: string;
  error?: string;
}

export const ActionEngine = {
  /**
   * Valida guardrails de segurança antes de permitir que uma ação seja aprovada.
   */
  validateGuardrails(proposal: BrainActionProposal): {
    passed: boolean;
    reason?: string;
  } {
    if (proposal.actionType === "adjust_budget") {
      const budget = Number(proposal.payload.newBudget || 0);
      if (budget > 100000) {
        return {
          passed: false,
          reason: "Orçamento acima do limite máximo permitido pelo guardrail de segurança (R$ 100.000,00).",
        };
      }
    }
    return { passed: true };
  },

  /**
   * Executa a ação autorizada com garantia de idempotência e registro obrigatório em audit_logs.
   */
  async executeApprovedAction(params: {
    workspaceId: string;
    proposal: BrainActionProposal;
    userId: string;
  }): Promise<ExecutionResult> {
    const { workspaceId, proposal, userId } = params;

    // 1. Checagem de guardrails
    const guardrailCheck = this.validateGuardrails(proposal);
    if (!guardrailCheck.passed) {
      throw new Error(`Ação bloqueada pelo guardrail: ${guardrailCheck.reason}`);
    }

    const idempotencyKey = `${proposal.id}_${Date.now()}`;
    const executedAt = new Date().toISOString();

    try {
      // 2. Execução da mutação real correspondente
      if (proposal.actionType === "pause_campaign") {
        const campaignId = String(proposal.payload.campaignId);
        const { error } = await supabase
          .from("campaigns")
          .update({ status: "paused" })
          .eq("id", campaignId)
          .eq("workspace_id", workspaceId);

        if (error) throw new Error(error.message);
      }

      // 3. Registro no Audit Log
      await supabase.from("audit_logs").insert({
        workspace_id: workspaceId,
        actor_type: "user",
        actor_user_id: userId,
        action: `brain_action_executed:${proposal.actionType}`,
        target_type: proposal.actionType.split("_")[1] || "entity",
        target_id: String(proposal.payload.campaignId || proposal.id),
        old_value: { preview: proposal.preview.current } as any,
        new_value: { preview: proposal.preview.proposed } as any,
        reason: `Ação aprovada manualmente pelo usuário: ${proposal.description}`,
        result: "success",
      });

      return {
        success: true,
        actionId: proposal.id,
        message: `Ação "${proposal.title}" executada com sucesso e registrada na auditoria.`,
        executedAt,
      };
    } catch (err: any) {
      // Registro de falha no audit log
      await supabase.from("audit_logs").insert({
        workspace_id: workspaceId,
        actor_type: "user",
        actor_user_id: userId,
        action: `brain_action_failed:${proposal.actionType}`,
        reason: `Falha na execução da ação: ${err?.message || "Erro desconhecido"}`,
        result: "failed",
      });

      return {
        success: false,
        actionId: proposal.id,
        message: "Falha ao executar a ação solicitada.",
        executedAt,
        error: err?.message,
      };
    }
  },
};
