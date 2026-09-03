import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { MetricsEngine } from "@/lib/metrics-engine";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import type { Json } from "@/integrations/supabase/types";

interface AutomationTriggerConfig {
  metric?: string;
  operator?: string;
  threshold?: number;
}

interface AutomationActionConfig {
  actionType?: string;
  targetCampaignId?: string;
}

import { BillingEngine } from "./billing-engine";

export async function handleCronRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Validação de autorização de cron se LOVABLE_CRON_SECRET estiver configurado
  if (process.env["LOVABLE_CRON_SECRET"]) {
    const authError = await authenticateCronRequest(request);
    if (authError) {
      return authError;
    }
  }

  try {
    // 0. Reconciliação de Trials Expirados e Assinaturas
    const nowIso = new Date().toISOString();
    const { data: expiredTrialWorkspaces } = await supabaseAdmin
      .from("workspaces")
      .select("id, name")
      .eq("status", "trial")
      .lt("trial_ends_at", nowIso);

    let expiredTrialCount = 0;
    if (expiredTrialWorkspaces && expiredTrialWorkspaces.length > 0) {
      for (const ws of expiredTrialWorkspaces) {
        const { data: activeSub } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("workspace_id", ws.id)
          .in("status", ["active", "trialing"])
          .maybeSingle();

        if (!activeSub) {
          await BillingEngine.expireTrial(ws.id);
          expiredTrialCount++;
        }
      }
    }

    // 1. Buscar todas as automações ativas
    const { data: automations, error: automationsError } = await supabaseAdmin
      .from("automations")
      .select("*")
      .eq("status", "active");

    if (automationsError) {
      throw new Error(`Falha ao buscar automações: ${automationsError.message}`);
    }

    if (!automations || automations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma regra de automação ativa.",
          evaluatedCount: 0,
          triggeredCount: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let evaluatedCount = 0;
    let triggeredCount = 0;

    // Agrupar automações por workspace para não reconsultar dados repetidamente
    const automationsByWorkspace = new Map<string, typeof automations>();
    for (const auto of automations) {
      const list = automationsByWorkspace.get(auto.workspace_id) || [];
      list.push(auto);
      automationsByWorkspace.set(auto.workspace_id, list);
    }

    for (const [workspaceId, wsAutomations] of automationsByWorkspace.entries()) {
      // 2. Buscar dados agregados do workspace
      const [ordersRes, campaignsRes, adMetricsRes] = await Promise.all([
        supabaseAdmin
          .from("orders")
          .select("total_amount, status, payment_gateway")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null),
        supabaseAdmin
          .from("campaigns")
          .select("id, name, budget, status")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null),
        supabaseAdmin
          .from("ad_metrics_daily")
          .select("spend, impressions, clicks, revenue")
          .eq("workspace_id", workspaceId),
      ]);

      const orders = ordersRes.data || [];
      const campaigns = campaignsRes.data || [];
      const adMetrics = adMetricsRes.data || [];

      const grossRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
      const financials = MetricsEngine.calculateWorkspaceFinancials({
        orders,
        campaigns,
        fixedCosts: [],
        adMetricsDaily: adMetrics.map((m) => ({ spend: Number(m.spend) || 0 })),
      });

      const totalImpressions = adMetrics.reduce((acc, m) => acc + (Number(m.impressions) || 0), 0);
      const totalClicks = adMetrics.reduce((acc, m) => acc + (Number(m.clicks) || 0), 0);

      const traffic = MetricsEngine.calculateTraffic({
        impressions: totalImpressions,
        clicks: totalClicks,
        spend: financials.adSpend,
        conversions: orders.length,
        revenue: grossRevenue,
      });

      for (const auto of wsAutomations) {
        evaluatedCount++;
        const triggerConfig = (auto.trigger_config || {}) as AutomationTriggerConfig;
        const actionConfig = (auto.action_config || {}) as AutomationActionConfig;

        const metricName = triggerConfig.metric || "roas";
        const op = triggerConfig.operator || "<";
        const threshold = Number(triggerConfig.threshold) || 0;

        let currentVal = 0;
        if (metricName === "roas") currentVal = traffic.roas;
        else if (metricName === "cpa") currentVal = traffic.cpa;
        else if (metricName === "margin") currentVal = financials.realMarginPercent;
        else if (metricName === "spend") currentVal = financials.adSpend;

        let conditionMet = false;
        if (op === "<") conditionMet = currentVal < threshold;
        else if (op === ">") conditionMet = currentVal > threshold;
        else if (op === "<=") conditionMet = currentVal <= threshold;
        else if (op === ">=") conditionMet = currentVal >= threshold;

        if (conditionMet) {
          triggeredCount++;
          const actionType = actionConfig.actionType || "notify";
          const desc = `Regra "${auto.name}" disparada: ${metricName.toUpperCase()} atual (${currentVal.toFixed(
            2,
          )}) ${op} limite (${threshold})`;

          // Ação: Notificação e Brain Insight
          if (actionType === "notify" || actionType === "prepare_pause") {
            await Promise.all([
              supabaseAdmin.from("notifications").insert({
                workspace_id: workspaceId,
                type: "warning",
                title: `Alerta de Automação: ${auto.name}`,
                message: desc,
                link_to: "/automations",
              }),
              supabaseAdmin.from("brain_insights").insert({
                workspace_id: workspaceId,
                type: "warning",
                severity: "warning",
                title: `Automação disparada: ${auto.name}`,
                description: desc,
                recommendation:
                  actionType === "prepare_pause"
                    ? "Acesse o Brain Hub para aprovar o pausamento de campanhas afetadas."
                    : "Revise os orçamentos e criativos no painel de Marketing.",
              }),
            ]);
          }

          // Ação: Se for prepare_pause, cadastrar proposta de ação no Brain com aprovação humana
          if (actionType === "prepare_pause") {
            const activeCampaign = campaigns.find((c) => c.status === "active");
            if (activeCampaign) {
              await supabaseAdmin.from("brain_actions").insert({
                workspace_id: workspaceId,
                proposed_by: "automation",
                action_type: "pause_campaign",
                description: `Pausar campanha "${activeCampaign.name}" devido à automação "${auto.name}"`,
                risk_level: "medium",
                payload: { campaignId: activeCampaign.id, newStatus: "paused" },
                preview_diff: {
                  current: `Ativa (Orçamento: R$ ${activeCampaign.budget || 0})`,
                  proposed: "Pausada",
                },
                status: "pending_approval",
                guardrails_passed: true,
                idempotency_key: `auto_pause_${auto.id}_${activeCampaign.id}_${new Date()
                  .toISOString()
                  .slice(0, 13)}`,
              });
            }
          }

          // Registrar execução da automação
          await supabaseAdmin.from("automation_runs").insert({
            workspace_id: workspaceId,
            automation_id: auto.id,
            trigger_event: {
              metric: metricName,
              currentValue: currentVal,
              operator: op,
              threshold,
            },
            execution_status: "success",
            result: { actionType, triggeredAt: new Date().toISOString() },
          });

          // Registrar em audit_logs
          await supabaseAdmin.from("audit_logs").insert({
            workspace_id: workspaceId,
            actor_type: "automation",
            action: `automation_triggered:${auto.id}`,
            target_type: "automation",
            target_id: auto.id,
            reason: desc,
            result: "success",
            new_value: { metric: metricName, value: currentVal } as Json,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        evaluatedCount,
        triggeredCount,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    console.error("[Cron] Erro na avaliação de automações:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
