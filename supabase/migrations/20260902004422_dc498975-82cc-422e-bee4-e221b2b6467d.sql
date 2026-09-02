-- Funções internas: não devem ser chamáveis pela API pública.
-- As políticas de RLS e os triggers continuam funcionando, pois são avaliados
-- pelo dono do objeto no contexto do banco.
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_workspace() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_workspace_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.workspace_role(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_workspace_permission(UUID, UUID, TEXT) FROM PUBLIC, anon;

-- Os três helpers de autorização precisam ser executáveis pelo papel autenticado
-- porque são avaliados dentro das políticas de RLS.
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.workspace_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_workspace_permission(UUID, UUID, TEXT) TO authenticated;