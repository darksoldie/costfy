import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface SessionState {
  session: Session | null;
  /** Falso enquanto a sessão ainda não foi lida no cliente. */
  ready: boolean;
}

/**
 * Estado de sessão para a interface (header, menus, CTAs).
 *
 * Não é um guard de rota: proteção de rota acontece no layout autenticado.
 * A leitura ocorre apenas no cliente para evitar divergência com o SSR.
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, ready };
}
