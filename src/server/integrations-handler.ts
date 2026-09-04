import { getServerSupabaseClient } from "./server-supabase";

const REQUIRED_ENVS_MAP: Record<string, string[]> = {
  meta_ads: ["META_APP_ID", "META_APP_SECRET"],
  google_ads: ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_DEVELOPER_TOKEN"],
  tiktok_ads: ["TIKTOK_APP_ID", "TIKTOK_APP_SECRET"],
};

export async function handleIntegrationsRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-costfy-workspace-id",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const endpoint = url.pathname.replace("/api/integrations", "");
  const authHeader = request.headers.get("Authorization");

  try {
    const db = getServerSupabaseClient(authHeader);

    // 1. GET /api/integrations/env-status?provider=...
    if (endpoint === "/env-status" && request.method === "GET") {
      const provider = url.searchParams.get("provider");
      if (!provider) {
        return new Response(JSON.stringify({ error: "provider é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const requiredEnvs = REQUIRED_ENVS_MAP[provider] || [];
      const missingEnvs = requiredEnvs.filter((envKey) => !process.env[envKey]);

      return new Response(
        JSON.stringify({
          provider,
          configured: missingEnvs.length === 0,
          missingEnvs,
          requiresOAuth: requiredEnvs.length > 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. POST /api/integrations/disconnect
    if (endpoint === "/disconnect" && request.method === "POST") {
      const body = (await request.json()) as { workspaceId: string; provider: string };
      if (!body.workspaceId || !body.provider) {
        return new Response(
          JSON.stringify({ error: "workspaceId e provider são obrigatórios." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      await db
        .from("integrations")
        .update({
          status: "not_connected",
          status_detail: "Desconectado pelo usuário.",
          updated_at: new Date().toISOString(),
        })
        .eq("workspace_id", body.workspaceId)
        .eq("provider", body.provider);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. POST /api/integrations/sync
    if (endpoint === "/sync" && request.method === "POST") {
      const body = (await request.json()) as { workspaceId: string; provider: string };
      if (!body.workspaceId || !body.provider) {
        return new Response(
          JSON.stringify({ error: "workspaceId e provider são obrigatórios." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const now = new Date().toISOString();

      await db
        .from("integrations")
        .update({
          status: "connected",
          last_synced_at: now,
          updated_at: now,
        })
        .eq("workspace_id", body.workspaceId)
        .eq("provider", body.provider);

      return new Response(JSON.stringify({ success: true, syncedAt: now }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint não encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[handleIntegrationsRequest] Erro:", err);
    const message = err instanceof Error ? err.message : "Erro interno no servidor de integrações.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
