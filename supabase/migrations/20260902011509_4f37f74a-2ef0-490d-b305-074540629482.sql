CREATE OR REPLACE FUNCTION public.shares_workspace(_user_a uuid, _user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members ma
    JOIN public.workspace_members mb ON mb.workspace_id = ma.workspace_id
    WHERE ma.user_id = _user_a AND mb.user_id = _user_b
  );
$$;

REVOKE EXECUTE ON FUNCTION public.shares_workspace(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shares_workspace(uuid, uuid) TO authenticated, service_role;

CREATE POLICY profiles_select_workspace_peers
ON public.profiles
FOR SELECT
TO authenticated
USING (public.shares_workspace(auth.uid(), id));