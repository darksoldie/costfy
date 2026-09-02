import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

/**
 * Portão do app autenticado.
 *
 * ssr: false porque a sessão do Supabase vive no cliente; renderizar no
 * servidor levaria a um flash de conteúdo protegido ou a um redirect errado.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { userId: data.session.user.id };
  },
  component: () => <Outlet />,
});
