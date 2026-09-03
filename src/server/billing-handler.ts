import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { BillingEngine } from "./billing-engine";
import { defaultBillingProvider } from "./billing-provider";
import { UsageEngine } from "@/lib/usage-engine";
import type { Plan, PlanInterval, WorkspaceUsageStats } from "@/lib/billing-types";

export async function handleBillingRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-costfy-workspace-id",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const endpoint = url.pathname.replace("/api/billing", "");

  try {
    // 1. GET /api/billing/plans
    if (endpoint === "/plans" && request.method === "GET") {
      const { data: plans, error } = await supabaseAdmin
        .from("plans")
        .select("*, plan_entitlements(*), plan_limits(*)")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ plans: plans || [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. GET /api/billing/subscription?workspace_id=...
    if (endpoint === "/subscription" && request.method === "GET") {
      const workspaceId =
        url.searchParams.get("workspace_id") || request.headers.get("x-costfy-workspace-id");

      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: "Parâmetro workspace_id é obrigatório." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { plan, isTrial, status } = await BillingEngine.getWorkspacePlan(workspaceId);
      const subscription = await BillingEngine.getWorkspaceSubscription(workspaceId);

      // Buscar faturas recentes
      const { data: invoices } = await supabaseAdmin
        .from("subscription_invoices")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Contar recursos para o Usage Engine
      const [membersRes, campaignsRes, integrationsRes, automationsRes] = await Promise.all([
        supabaseAdmin.from("workspace_members").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabaseAdmin.from("campaigns").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabaseAdmin.from("integrations").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabaseAdmin.from("automations").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
      ]);

      const membersCount = membersRes.count || 1;
      const campaignsCount = campaignsRes.count || 0;
      const integrationsCount = integrationsRes.count || 0;
      const automationsCount = automationsRes.count || 0;

      const usage: WorkspaceUsageStats = {
        workspaces: UsageEngine.calculateUsage(1, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "workspaces" })),
        members: UsageEngine.calculateUsage(membersCount, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "members" })),
        ad_accounts: UsageEngine.calculateUsage(1, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "ad_accounts" })),
        integrations: UsageEngine.calculateUsage(integrationsCount, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "integrations" })),
        campaigns: UsageEngine.calculateUsage(campaignsCount, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "campaigns" })),
        automations: UsageEngine.calculateUsage(automationsCount, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "automations" })),
        webhooks: UsageEngine.calculateUsage(integrationsCount, UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "webhooks" })),
      };

      return new Response(
        JSON.stringify({
          plan,
          isTrial,
          workspaceStatus: status,
          subscription,
          invoices: invoices || [],
          usage,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. POST /api/billing/checkout
    if (endpoint === "/checkout" && request.method === "POST") {
      const body = (await request.json()) as {
        workspaceId: string;
        planSlug: string;
        interval: PlanInterval;
        email?: string;
        returnUrl?: string;
      };

      if (!body.workspaceId || !body.planSlug) {
        return new Response(
          JSON.stringify({ error: "Campos workspaceId e planSlug são obrigatórios." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { data: plan } = await supabaseAdmin
        .from("plans")
        .select("*")
        .eq("slug", body.planSlug)
        .single();

      if (!plan) {
        return new Response(JSON.stringify({ error: "Plano inválido." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const amountCents = body.interval === "annual" ? plan.annual_price : plan.monthly_price;
      const baseHost = url.origin || "http://localhost:8080";
      const returnUrl = body.returnUrl || `${baseHost}/settings/billing`;

      const checkout = await defaultBillingProvider.createCheckout({
        workspaceId: body.workspaceId,
        planSlug: plan.slug,
        planName: plan.name,
        amountCents,
        currency: plan.currency || "BRL",
        interval: body.interval || "monthly",
        payerEmail: body.email || "contato@costfy.com.br",
        returnUrl,
      });

      return new Response(JSON.stringify(checkout), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. POST /api/billing/cancel
    if (endpoint === "/cancel" && request.method === "POST") {
      const body = (await request.json()) as { workspaceId: string };
      if (!body.workspaceId) {
        return new Response(JSON.stringify({ error: "workspaceId é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const success = await BillingEngine.cancelSubscription(body.workspaceId);
      return new Response(JSON.stringify({ success }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint não encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[handleBillingRequest] Erro:", err);
    const message = err instanceof Error ? err.message : "Erro interno no servidor de billing.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
