-- =====================================================================
-- FIX: Workspace creation RLS chicken-and-egg problem
-- =====================================================================
-- ROOT CAUSE:
--   The workspaces SELECT policy requires is_workspace_member(id, auth.uid()).
--   The workspace_members row is created by the AFTER INSERT trigger handle_new_workspace.
--   When the client does .insert().select() (INSERT ... RETURNING), PostgreSQL
--   evaluates the RETURNING clause BEFORE the AFTER INSERT trigger fires.
--   At that moment, the workspace_members row doesn't exist yet, so
--   is_workspace_member returns false and the SELECT RLS policy rejects
--   the RETURNING clause, surfacing as "violates row-level security policy".
--
-- FIX:
--   1. Change handle_new_workspace to a BEFORE INSERT trigger so the
--      workspace_members row exists when RETURNING is evaluated.
--      This won't work because the workspace row doesn't have an id yet
--      at BEFORE INSERT time if using gen_random_uuid() DEFAULT, and the
--      FK constraint workspace_members.workspace_id → workspaces.id would fail.
--
--   2. Add a supplementary SELECT policy that allows the creator to read
--      their own newly created workspace row via created_by = auth.uid().
--      This is the correct minimal fix — it doesn't weaken multi-tenancy
--      (created_by is immutable and always the authentic auth.uid()),
--      and it only affects the SELECT path for the creator.
-- =====================================================================

-- Add a SELECT policy for workspace creators to read their own workspaces.
-- This complements the existing workspaces_select_member policy and resolves
-- the RETURNING clause RLS failure during workspace creation.
CREATE POLICY "workspaces_select_creator" ON public.workspaces
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());
