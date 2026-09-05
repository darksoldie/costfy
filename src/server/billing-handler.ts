import { getServerSupabaseClient } from "./server-supabase";
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
  const authHeader = request.headers.get("Authorization");

  try {
    const db = getServerSupabaseClient(authHeader);

    // 1. GET /api/billing/plans
    if (endpoint === "/plans" && request.method === "GET") {
      const { data: plans, error } = await db
        .from("plans")
        .select("*, plan_entitlements(*), plan_limits(*)")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("[handleBillingRequest] Erro ao buscar planos do banco, usando catálogo canônico:", error);
      }

      const resolvedPlans = (plans && plans.length > 0) ? plans : BillingEngine.getCanonicalPlans();

      return new Response(JSON.stringify({ plans: resolvedPlans }), {
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

      const { plan, isTrial, status } = await BillingEngine.getWorkspacePlan(workspaceId, authHeader);
      const subscription = await BillingEngine.getWorkspaceSubscription(workspaceId, authHeader);

      // Buscar faturas recentes de forma segura
      let invoices: unknown[] = [];
      try {
        const { data } = await db
          .from("subscription_invoices")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false })
          .limit(10);
        if (data) invoices = data;
      } catch (e) {
        console.warn("[handleBillingRequest] Não foi possível carregar faturas:", e);
      }

      // Contar recursos para o Usage Engine
      let membersCount = 1;
      let campaignsCount = 0;
      let integrationsCount = 0;
      let automationsCount = 0;

      try {
        const [membersRes, campaignsRes, integrationsRes, automationsRes] = await Promise.all([
          db.from("workspace_members").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
          db.from("campaigns").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
          db.from("integrations").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
          db.from("automations").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        ]);

        membersCount = membersRes.count || 1;
        campaignsCount = campaignsRes.count || 0;
        integrationsCount = integrationsRes.count || 0;
        automationsCount = automationsRes.count || 0;
      } catch (e) {
        console.warn("[handleBillingRequest] Não foi possível calcular contagens de uso completas:", e);
      }

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
          invoices,
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

      // Validação de RBAC do usuário solicitante
      let userEmail: string | undefined;
      if (authHeader) {
        const {
          data: { user },
        } = await db.auth.getUser();
        if (user) {
          userEmail = user.email;
          const { data: member } = await db
            .from("workspace_members")
            .select("role")
            .eq("workspace_id", body.workspaceId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (member && !["owner", "admin"].includes(member.role)) {
            return new Response(
              JSON.stringify({
                error: "Apenas proprietários e administradores podem gerenciar o faturamento deste workspace.",
              }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      }

      const plan = await BillingEngine.resolvePlan(body.planSlug, authHeader);

      if (!plan) {
        return new Response(
          JSON.stringify({
            error: `O plano "${body.planSlug}" não foi encontrado. Planos oficiais disponíveis: Starter, Growth, Scale.`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const amountCents = body.interval === "annual" ? plan.annual_price : plan.monthly_price;
      const configuredBase = process.env["APP_BASE_URL"] || process.env["VITE_APP_BASE_URL"];
      const baseHost = configuredBase || (url.origin && !url.origin.includes("localhost") ? url.origin : "https://app.costfy.com.br");
      const returnUrl = body.returnUrl || `${baseHost}/billing`;
      const payerEmail = body.email || userEmail || "financeiro@costfy.com.br";

      const checkout = await defaultBillingProvider.createCheckout({
        workspaceId: body.workspaceId,
        planSlug: plan.slug,
        planName: plan.name,
        amountCents,
        currency: plan.currency || "BRL",
        interval: body.interval || "monthly",
        payerEmail,
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

      // Validação de RBAC do usuário solicitante
      if (authHeader) {
        const {
          data: { user },
        } = await db.auth.getUser();
        if (user) {
          const { data: member } = await db
            .from("workspace_members")
            .select("role")
            .eq("workspace_id", body.workspaceId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (member && !["owner", "admin"].includes(member.role)) {
            return new Response(
              JSON.stringify({
                error: "Apenas proprietários e administradores podem cancelar assinaturas.",
              }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      }

      // Consultar se existe assinatura ativa com ID do gateway
      const existingSub = await BillingEngine.getWorkspaceSubscription(body.workspaceId, authHeader);
      if (existingSub?.provider_subscription_id) {
        await defaultBillingProvider.cancelSubscription(existingSub.provider_subscription_id);
      }

      const success = await BillingEngine.cancelSubscription(body.workspaceId, authHeader);
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
    console.error("[handleBillingRequest] Erro capturado:", err);
    const message = err instanceof Error ? err.message : "Erro interno no processamento de billing.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
