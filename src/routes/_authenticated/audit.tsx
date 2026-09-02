import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Bot,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { supabase } from "@/integrations/supabase/client";
import { inputClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Registro de Auditoria — Costfy" },
      {
        name: "description",
        content: "Trilha de auditoria imutável de todas as ações, acessos e alterações realizadas no workspace.",
      },
    ],
  }),
  component: () => (
    <WorkspaceProvider>
      <AuditPage />
    </WorkspaceProvider>
  ),
});

interface AuditLogEntry {
  id: string;
  created_at: string;
  actor_type: string;
  actor_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  result: "success" | "failed" | "denied";
  old_value: any;
  new_value: any;
}

function AuditPage() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit_logs", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<AuditLogEntry[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      return (data as any) ?? [];
    },
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase())) ||
      (log.target_type && log.target_type.toLowerCase().includes(search.toLowerCase()));
    const matchesResult = resultFilter === "all" || log.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  return (
    <AppShell
      title="Auditoria"
      description="Trilha de conformidade e segurança: registro de toda e qualquer mutação realizada por operadores, integrações ou pelo Costfy Brain."
    >
      <div className="space-y-6">
        {/* Barra de Busca e Filtro */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ação, motivo ou entidade..."
              className={cn(inputClass, "pl-9 h-9 text-[13px]")}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-[13px] px-2.5")}
            >
              <option value="all">Todos os resultados</option>
              <option value="success">Sucesso</option>
              <option value="failed">Falha</option>
              <option value="denied">Negado</option>
            </select>
          </div>
        </div>

        {/* Tabela de Logs */}
        {isLoading ? (
          <div className="space-y-2 rounded-lg border border-border p-6 bg-card">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-secondary/60" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center bg-surface">
            <History className="mx-auto size-8 text-muted-foreground" />
            <h3 className="type-h3 mt-3 text-foreground">Nenhum registro de auditoria</h3>
            <p className="type-body-sm mx-auto mt-1 max-w-md text-muted-foreground">
              Ações realizadas no workspace (alterações de campanha, custos, membros e permissões) serão registradas aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-surface text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Ator</th>
                  <th className="px-4 py-3">Ação</th>
                  <th className="px-4 py-3">Entidade</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Detalhe / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[12px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        {log.actor_type === "brain" ? (
                          <>
                            <Bot className="size-3.5 text-accent" /> Brain
                          </>
                        ) : log.actor_type === "system" ? (
                          <>
                            <ShieldCheck className="size-3.5 text-muted-foreground" /> Sistema
                          </>
                        ) : (
                          <>
                            <User className="size-3.5 text-primary" /> Usuário
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-foreground">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {log.target_type || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border",
                          log.result === "success"
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-destructive/10 text-destructive border-destructive/30",
                        )}
                      >
                        {log.result === "success" ? (
                          <>
                            <CheckCircle2 className="size-3" /> Sucesso
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" /> {log.result}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-subtle-foreground truncate max-w-xs">
                      {log.reason || "Operação padrão"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
