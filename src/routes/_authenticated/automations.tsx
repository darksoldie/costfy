import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap,
  Plus,
  Play,
  Pause,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

import { AppShellActions } from "@/components/app/app-shell";
import { useWorkspace } from "@/components/app/workspace-context";
import { supabase } from "@/integrations/supabase/client";
import { buttonClass, inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/automations")({
  head: () => ({
    meta: [
      { title: "Automações & Regras — Costfy" },
      {
        name: "description",
        content:
          "Crie e gerencie automações operacionais (Trigger → Condition → Action) com guardrails de segurança.",
      },
    ],
  }),
  component: AutomationsPage,
});

interface AutomationItem {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  status: "active" | "paused" | "draft";
  created_at: string;
}

function AutomationsPage() {
  const { active } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = active?.workspace.id ?? null;

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("roas");
  const [operator, setOperator] = useState("<");
  const [threshold, setThreshold] = useState("1.8");
  const [actionType, setActionType] = useState("notify");

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ["automations", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<AutomationItem[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("automations")
        .select("id, name, description, trigger_type, status, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data as AutomationItem[]) ?? [];
    },
  });

  const createAutomation = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!name.trim()) throw new Error("Informe o nome da automação");

      const desc = `Quando ${metric.toUpperCase()} for ${operator} ${threshold} → ${
        actionType === "notify" ? "Criar alerta no Brain" : "Pausar campanha com aprovação"
      }`;

      const { data, error } = await supabase
        .from("automations")
        .insert({
          workspace_id: workspaceId,
          name: name.trim(),
          description: desc,
          trigger_type: "metric_threshold",
          trigger_config: { metric, operator, threshold: parseFloat(threshold) },
          action_config: { actionType },
          guardrails: { maxBudgetChangePercent: 30, requireApproval: true },
          status: "active",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["automations", workspaceId] });
      setModalOpen(false);
      setName("");
    },
  });

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  async function handleRunEvaluations() {
    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await fetch("/api/cron/evaluate", { method: "POST" });
      const data = (await res.json()) as {
        success?: boolean;
        evaluatedCount?: number;
        triggeredCount?: number;
        message?: string;
      };
      if (data.success) {
        setEvalResult(
          data.message ||
            `Avaliação concluída: ${data.evaluatedCount || 0} regra(s) testada(s), ${data.triggeredCount || 0} disparo(s).`,
        );
        void queryClient.invalidateQueries({ queryKey: ["automations", workspaceId] });
      } else {
        setEvalResult("Falha ao avaliar regras.");
      }
    } catch {
      setEvalResult("Erro de conexão ao executar avaliação.");
    } finally {
      setEvaluating(false);
      setTimeout(() => setEvalResult(null), 5000);
    }
  }

  return (
    <>
      <AppShellActions>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunEvaluations}
            disabled={evaluating}
            className={buttonClass("outline", "sm", "gap-1.5")}
          >
            <Play className="size-3.5" />
            {evaluating ? "Avaliando…" : "Testar regras"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={buttonClass("primary", "sm", "gap-1.5")}
          >
            <Plus className="size-3.5" />
            Nova regra
          </button>
        </div>
      </AppShellActions>
      <div className="space-y-6">
        {evalResult && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-[13px] font-medium text-foreground"
          >
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            {evalResult}
          </div>
        )}
        {/* Banner de Guardrails */}
        <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-foreground">
                Guardrails de Segurança Ativos
              </p>
              <p className="text-[12px] text-muted-foreground">
                Toda ação que impacta orçamento ou pausamento externo exige confirmação e respeita
                limites automáticos de segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Automações */}
        {isLoading ? (
          <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
            ))}
          </div>
        ) : automations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
            <Zap className="mx-auto size-8 text-muted-foreground" />
            <h3 className="type-h3 mt-3 text-foreground">Nenhuma regra de automação ativa</h3>
            <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
              Crie regras para alertar sobre queda de ROAS, disparar notificações quando a margem
              cair ou preparar ações automáticas.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={buttonClass("primary", "sm", "mt-4")}
            >
              Criar primeira automação
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Automação</th>
                  <th className="px-4 py-3">Regra (Gatilho → Ação)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Criada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {automations.map((aut) => (
                  <tr key={aut.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{aut.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[12px]">
                      {aut.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success border border-success/30">
                        Ativa
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(aut.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Automação */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-h3 text-foreground">Nova Automação</h2>
            <p className="type-body-sm mt-1 text-muted-foreground">
              Defina a condição para disparo e a ação operacional a ser preparada.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createAutomation.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Nome da Automação
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Alerta de ROAS Crítico (< 1.8x)"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Métrica
                  </label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className={inputClass}
                  >
                    <option value="roas">ROAS</option>
                    <option value="cpa">CPA</option>
                    <option value="margin">Margem %</option>
                    <option value="spend">Gasto Diário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Condição
                  </label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className={inputClass}
                  >
                    <option value="<">Menor que (&lt;)</option>
                    <option value=">">Maior que (&gt;)</option>
                    <option value="<=">Menor ou igual</option>
                    <option value=">=">Maior ou igual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-1">
                    Valor Limite
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="1.8"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">
                  Ação a Executar
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className={inputClass}
                >
                  <option value="notify">Criar Alerta no Costfy Brain</option>
                  <option value="prepare_pause">Preparar Ação de Pausa (com aprovação)</option>
                </select>
              </div>

              {createAutomation.error instanceof Error && (
                <p className="text-[12px] text-destructive">{createAutomation.error.message}</p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={buttonClass("outline", "md")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAutomation.isPending}
                  className={buttonClass("primary", "md")}
                >
                  {createAutomation.isPending ? "Criando…" : "Ativar automação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
