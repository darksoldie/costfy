import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function handleTrackingRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    const bodyText = await request.text();
    if (!bodyText) {
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(bodyText);
    const {
      workspace_id,
      visitor_id,
      session_token,
      type,
      page_url,
      page_title,
      referrer,
      device_type,
      os,
      browser,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      event_name,
      properties,
    } = payload;

    if (!workspace_id || !visitor_id || !session_token) {
      return new Response(JSON.stringify({ error: "Missing required tracking parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Validar existência do workspace
    const { data: workspace, error: wsError } = await supabaseAdmin
      .from("workspaces")
      .select("id, status")
      .eq("id", workspace_id)
      .single();

    if (wsError || !workspace) {
      return new Response(JSON.stringify({ error: "Invalid workspace_id" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Localizar ou criar sessão
    const { data: existingSession } = await supabaseAdmin
      .from("tracking_sessions")
      .select("id")
      .eq("workspace_id", workspace_id)
      .eq("session_token", session_token)
      .maybeSingle();

    let sessionId = existingSession?.id;

    if (!existingSession) {
      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from("tracking_sessions")
        .insert({
          workspace_id,
          session_token,
          visitor_id,
          landing_page: page_url || "",
          referrer: referrer || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
          utm_term: utm_term || null,
          device_type: device_type || "desktop",
          os: os || null,
          browser: browser || null,
          started_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!sessionError && newSession) {
        sessionId = newSession.id;
      }
    } else {
      // Atualizar heartbeat da sessão
      await supabaseAdmin
        .from("tracking_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existingSession.id);
    }

    // 3. Registrar evento correspondente
    const resolvedEventName = type === "page_view" ? "page_view" : event_name || "custom_event";

    await supabaseAdmin.from("tracking_events").insert({
      workspace_id,
      session_id: sessionId || null,
      visitor_id,
      event_name: resolvedEventName,
      page_url: page_url || "",
      page_title: page_title || null,
      properties: properties || {},
      occurred_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[Tracking] Erro na ingestão:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
