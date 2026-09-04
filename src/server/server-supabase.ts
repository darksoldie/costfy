import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Retorna uma instância do Supabase segura e isolada para o servidor.
 * 
 * Ordem de autoridade:
 * 1. SUPABASE_SERVICE_ROLE_KEY (se disponível no ambiente do servidor) -> Acesso de serviço irrestrito.
 * 2. Authorization Header repassado (Bearer JWT) -> Acesso autenticado com isolamento estrito via RLS.
 * 3. SUPABASE_PUBLISHABLE_KEY -> Acesso anônimo a tabelas públicas (planos, limites públicos).
 */
export function getServerSupabaseClient(authHeader?: string | null): SupabaseClient<Database> {
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    "";

  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    "";

  if (!url) {
    throw new Error("SUPABASE_URL não configurada no ambiente.");
  }

  // 1. Chave de serviço (produção/cloud com service role)
  if (serviceRoleKey) {
    return createClient<Database>(url, serviceRoleKey, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  // 2. Chave pública com Bearer Token do usuário autenticado (respeita RLS estrito)
  const headers: Record<string, string> = {};
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  if (!publishableKey) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY não configurada no ambiente.");
  }

  return createClient<Database>(url, publishableKey, {
    global: {
      headers,
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
