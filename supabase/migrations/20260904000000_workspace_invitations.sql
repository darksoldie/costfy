-- ============================================================
-- COSTFY WORKSPACE INVITATIONS MIGRATION
-- Migration: 20260904000000_workspace_invitations.sql
-- Description: Creates workspace_invitations table with strict RLS
--              and expiration handling for secure team onboarding.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_idx ON public.workspace_invitations (workspace_id);
CREATE INDEX IF NOT EXISTS workspace_invitations_token_idx ON public.workspace_invitations (token);
CREATE INDEX IF NOT EXISTS workspace_invitations_email_idx ON public.workspace_invitations (email);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_invitations TO authenticated;
GRANT ALL ON public.workspace_invitations TO service_role;

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- 1. Leitura: Administradores e proprietários do workspace podem ver todos os convites do workspace.
--    O próprio usuário convidado (identificado por seu e-mail) também pode ler seus convites.
CREATE POLICY "invitations_select_permitted" ON public.workspace_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
    OR email = auth.jwt()->>'email'
  );

-- 2. Inserção: Apenas proprietários e administradores do workspace podem gerar novos convites.
CREATE POLICY "invitations_insert_permitted" ON public.workspace_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- 3. Atualização: Proprietários e administradores podem revogar convites.
--    O usuário convidado pode marcar como aceito ao ingressar no workspace.
CREATE POLICY "invitations_update_permitted" ON public.workspace_invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
    OR (
      status = 'pending' AND email = auth.jwt()->>'email'
    )
  );

-- 4. Exclusão: Apenas proprietários e administradores podem excluir convites.
CREATE POLICY "invitations_delete_permitted" ON public.workspace_invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
