import { getServerSupabaseClient } from "./server-supabase";
import { BillingEngine } from "./billing-engine";
import { UsageEngine, UNLIMITED } from "@/lib/usage-engine";
import type { AppRole } from "@/lib/workspaces";

export async function handleInvitationsRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-costfy-workspace-id",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const endpoint = url.pathname.replace("/api/invitations", "");
  const authHeader = request.headers.get("Authorization");

  try {
    const db = getServerSupabaseClient(authHeader);

    // 1. GET /api/invitations/list?workspace_id=...
    if (endpoint === "/list" && request.method === "GET") {
      const workspaceId =
        url.searchParams.get("workspace_id") || request.headers.get("x-costfy-workspace-id");

      if (!workspaceId) {
        return new Response(JSON.stringify({ error: "workspace_id é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: invitations, error } = await db
        .from("workspace_invitations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[handleInvitationsRequest] Erro ao listar convites:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ invitations: invitations || [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. POST /api/invitations/create
    if (endpoint === "/create" && request.method === "POST") {
      const body = (await request.json()) as {
        workspaceId: string;
        email: string;
        role: AppRole;
      };

      if (!body.workspaceId || !body.email || !body.role) {
        return new Response(
          JSON.stringify({ error: "workspaceId, email e role são obrigatórios." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Obter usuário autenticado
      const {
        data: { user },
        error: userError,
      } = await db.auth.getUser();

      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Usuário não autenticado." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validar permissão de admin/owner no workspace
      const { data: callerMember } = await db
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", body.workspaceId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!callerMember || !["owner", "admin"].includes(callerMember.role)) {
        return new Response(
          JSON.stringify({ error: "Apenas proprietários e administradores podem convidar membros." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Verificação de Limites do Plano (Usage & Entitlements Engine)
      try {
        const { plan, isTrial, status } = await BillingEngine.getWorkspacePlan(body.workspaceId, authHeader);
        if (status === "read_only") {
          return new Response(
            JSON.stringify({
              error: "Este workspace está em modo somente leitura devido ao término do período de teste. Regularize a assinatura para convidar novos membros.",
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const maxMembers = UsageEngine.getLimit({ planSlug: plan.slug, isTrial, resourceKey: "members" });
        if (maxMembers !== UNLIMITED) {
          const { count: currentMembers } = await db
            .from("workspace_members")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", body.workspaceId);

          if ((currentMembers || 0) >= maxMembers) {
            return new Response(
              JSON.stringify({
                error: `Limite de membros atingido (${currentMembers}/${maxMembers}) para o plano ${plan.name.toUpperCase()}. Faça upgrade de plano para convidar mais pessoas.`,
              }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } catch (limitErr) {
        console.warn("[handleInvitationsRequest] Não foi possível verificar limites de faturamento:", limitErr);
      }

      // Gerar token seguro de 32 bytes (UUID v4 + timestamp)
      const token = `${crypto.randomUUID().replace(/-/g, "")}${Date.now().toString(36)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias

      const { data: invitation, error: insertError } = await db
        .from("workspace_invitations")
        .insert({
          workspace_id: body.workspaceId,
          email: body.email.trim().toLowerCase(),
          role: body.role,
          token,
          invited_by: user.id,
          status: "pending",
          expires_at: expiresAt,
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("[handleInvitationsRequest] Erro ao criar convite:", insertError);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const baseHost = url.origin || "http://localhost:8080";
      const inviteUrl = `${baseHost}/invite/${token}`;

      return new Response(
        JSON.stringify({
          invitation,
          inviteUrl,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. POST /api/invitations/revoke
    if (endpoint === "/revoke" && request.method === "POST") {
      const body = (await request.json()) as { invitationId: string; workspaceId: string };
      if (!body.invitationId || !body.workspaceId) {
        return new Response(JSON.stringify({ error: "invitationId e workspaceId são obrigatórios." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateError } = await db
        .from("workspace_invitations")
        .update({ status: "revoked" })
        .eq("id", body.invitationId)
        .eq("workspace_id", body.workspaceId);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. GET /api/invitations/details?token=...
    if (endpoint === "/details" && request.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token) {
        return new Response(JSON.stringify({ error: "Token é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: invitation, error } = await db
        .from("workspace_invitations")
        .select("id, workspace_id, email, role, status, expires_at, created_at, workspaces(name)")
        .eq("token", token)
        .maybeSingle();

      if (error || !invitation) {
        return new Response(JSON.stringify({ error: "Convite não encontrado." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const isExpired = new Date(invitation.expires_at).getTime() < Date.now();
      const workspaceName = (invitation.workspaces as { name: string } | null)?.name || "Workspace Costfy";

      return new Response(
        JSON.stringify({
          id: invitation.id,
          workspaceId: invitation.workspace_id,
          workspaceName,
          email: invitation.email,
          role: invitation.role,
          status: isExpired && invitation.status === "pending" ? "expired" : invitation.status,
          expiresAt: invitation.expires_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 5. POST /api/invitations/accept
    if (endpoint === "/accept" && request.method === "POST") {
      const body = (await request.json()) as { token: string };
      if (!body.token) {
        return new Response(JSON.stringify({ error: "Token é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const {
        data: { user },
        error: userError,
      } = await db.auth.getUser();

      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Você precisa estar conectado para aceitar um convite." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: invitation, error: invError } = await db
        .from("workspace_invitations")
        .select("*")
        .eq("token", body.token)
        .maybeSingle();

      if (invError || !invitation) {
        return new Response(JSON.stringify({ error: "Convite inválido ou não encontrado." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (invitation.status !== "pending") {
        return new Response(
          JSON.stringify({
            error:
              invitation.status === "accepted"
                ? "Este convite já foi utilizado."
                : "Este convite foi revogado ou expirou.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (new Date(invitation.expires_at).getTime() < Date.now()) {
        await db
          .from("workspace_invitations")
          .update({ status: "expired" })
          .eq("id", invitation.id);

        return new Response(JSON.stringify({ error: "Este convite expirou." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Adicionar usuário ao workspace_members se ainda não for
      const { data: existingMember } = await db
        .from("workspace_members")
        .select("id, role")
        .eq("workspace_id", invitation.workspace_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        // Atualiza papel se necessário
        await db
          .from("workspace_members")
          .update({ role: invitation.role })
          .eq("id", existingMember.id);
      } else {
        const { error: insertMemberError } = await db.from("workspace_members").insert({
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
        });

        if (insertMemberError) {
          console.error("[handleInvitationsRequest] Erro ao inserir membro:", insertMemberError);
          return new Response(JSON.stringify({ error: insertMemberError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Marcar convite como aceito
      await db
        .from("workspace_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_by: user.id,
        })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({
          success: true,
          workspaceId: invitation.workspace_id,
          role: invitation.role,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Endpoint não encontrado em /api/invitations" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[handleInvitationsRequest] Exceção não tratada:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}
