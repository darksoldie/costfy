import { WebhookEngine, type WebhookProvider } from "./webhook-engine";
import type { Json } from "@/integrations/supabase/types";

export async function handleWebhookRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-costfy-workspace-id",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // /api/webhooks/:provider
    const provider = pathParts[2] as WebhookProvider;

    const workspaceId =
      url.searchParams.get("workspace_id") || request.headers.get("x-costfy-workspace-id") || null;

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: "Missing workspace_id parameter in webhook query or header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!["hotmart", "kiwify", "stripe"].includes(provider)) {
      return new Response(JSON.stringify({ error: `Unsupported webhook provider: ${provider}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bodyText = await request.text();
    if (!bodyText) {
      return new Response(JSON.stringify({ error: "Empty webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(bodyText) as Json;
    let normalized;

    if (provider === "hotmart") {
      normalized = WebhookEngine.parseHotmart(payload);
    } else if (provider === "kiwify") {
      normalized = WebhookEngine.parseKiwify(payload);
    } else {
      normalized = WebhookEngine.parseStripe(payload);
    }

    const result = await WebhookEngine.processOrder(workspaceId, provider, normalized, payload);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[Webhook] Erro no processamento:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
