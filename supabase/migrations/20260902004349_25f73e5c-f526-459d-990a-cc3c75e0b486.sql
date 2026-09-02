-- =====================================================================
-- COSTFY — Fundação: identidade, multi-tenancy, papéis e auditoria
-- =====================================================================

-- ---------- Tipos ----------
CREATE TYPE public.app_role AS ENUM (
  'owner', 'admin', 'manager', 'analyst', 'media_buyer', 'finance', 'viewer'
);

CREATE TYPE public.business_type AS ENUM (
  'ecommerce', 'saas', 'infoproduct', 'affiliate', 'agency', 'creator', 'freelancer', 'other'
);

CREATE TYPE public.workspace_status AS ENUM ('trial', 'active', 'read_only', 'suspended');

CREATE TYPE public.integration_status AS ENUM (
  'not_connected', 'connecting', 'connected', 'syncing', 'error', 'paused', 'data_delayed'
);

CREATE TYPE public.actor_type AS ENUM ('user', 'brain', 'automation', 'system', 'integration');

-- ---------- Utilitário: updated_at ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- profiles ----------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Criação automática do perfil no cadastro.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- workspaces ----------
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  business_type public.business_type,
  status public.workspace_status NOT NULL DEFAULT 'trial',
  base_currency TEXT NOT NULL DEFAULT 'BRL',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  onboarding_completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX workspaces_created_by_idx ON public.workspaces (created_by);

-- ---------- workspace_members ----------
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX workspace_members_user_idx ON public.workspace_members (user_id);
CREATE INDEX workspace_members_workspace_idx ON public.workspace_members (workspace_id);

-- ---------- Catálogo de permissões ----------
CREATE TABLE public.permissions (
  key TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);

INSERT INTO public.permissions (key, category, description) VALUES
  ('view_overview',        'analytics',    'Ver a visão geral da operação'),
  ('view_analytics',       'analytics',    'Investigar dados em Analytics'),
  ('view_campaigns',       'marketing',    'Ver campanhas, conjuntos e anúncios'),
  ('edit_campaigns',       'marketing',    'Editar campanhas'),
  ('publish_campaigns',    'marketing',    'Publicar campanhas'),
  ('change_budget',        'marketing',    'Alterar orçamento'),
  ('pause_campaign',       'marketing',    'Pausar ou reativar campanhas'),
  ('view_sales',           'sales',        'Ver pedidos, produtos e clientes'),
  ('view_finance',         'finance',      'Ver dados financeiros'),
  ('edit_finance',         'finance',      'Editar custos e lançamentos'),
  ('view_tracking',        'tracking',     'Ver tracking, eventos e atribuição'),
  ('edit_tracking',        'tracking',     'Criar e editar UTMs e links'),
  ('use_brain',            'brain',        'Conversar com o Brain'),
  ('execute_brain_actions','brain',        'Aprovar e executar ações do Brain'),
  ('manage_automations',   'automations',  'Criar e gerenciar automações'),
  ('manage_integrations',  'integrations', 'Conectar e gerenciar integrações'),
  ('manage_members',       'workspace',    'Gerenciar membros e papéis'),
  ('manage_workspace',     'workspace',    'Alterar configurações do workspace'),
  ('view_audit_log',       'workspace',    'Ver o registro de auditoria'),
  ('manage_billing',       'billing',      'Gerenciar assinatura e cobrança');

-- Owner e Admin recebem tudo (Owner por definição, Admin exceto cobrança).
INSERT INTO public.role_permissions (role, permission_key)
SELECT 'owner'::public.app_role, key FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_key)
SELECT 'admin'::public.app_role, key FROM public.permissions WHERE key <> 'manage_billing';

INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('manager','view_overview'), ('manager','view_analytics'), ('manager','view_campaigns'),
  ('manager','edit_campaigns'), ('manager','publish_campaigns'), ('manager','change_budget'),
  ('manager','pause_campaign'), ('manager','view_sales'), ('manager','view_finance'),
  ('manager','view_tracking'), ('manager','edit_tracking'), ('manager','use_brain'),
  ('manager','execute_brain_actions'), ('manager','manage_automations'), ('manager','manage_integrations'),

  ('analyst','view_overview'), ('analyst','view_analytics'), ('analyst','view_campaigns'),
  ('analyst','view_sales'), ('analyst','view_finance'), ('analyst','view_tracking'),
  ('analyst','use_brain'),

  ('media_buyer','view_overview'), ('media_buyer','view_analytics'), ('media_buyer','view_campaigns'),
  ('media_buyer','edit_campaigns'), ('media_buyer','publish_campaigns'), ('media_buyer','change_budget'),
  ('media_buyer','pause_campaign'), ('media_buyer','view_tracking'), ('media_buyer','edit_tracking'),
  ('media_buyer','use_brain'), ('media_buyer','manage_automations'),

  ('finance','view_overview'), ('finance','view_analytics'), ('finance','view_sales'),
  ('finance','view_finance'), ('finance','edit_finance'), ('finance','use_brain'),

  ('viewer','view_overview'), ('viewer','view_analytics'), ('viewer','view_campaigns'),
  ('viewer','view_sales'), ('viewer','view_tracking');

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_read" ON public.permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_permissions_read" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

-- ---------- Funções de autorização (SECURITY DEFINER evita recursão de RLS) ----------
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.workspace_role(_workspace_id UUID, _user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = _workspace_id AND user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_permission(
  _workspace_id UUID, _user_id UUID, _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members m
    JOIN public.role_permissions rp ON rp.role = m.role
    WHERE m.workspace_id = _workspace_id
      AND m.user_id = _user_id
      AND rp.permission_key = _permission
  );
$$;

-- ---------- RLS: workspaces ----------
GRANT SELECT, INSERT, UPDATE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select_member" ON public.workspaces
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(id, auth.uid()));

CREATE POLICY "workspaces_insert_self" ON public.workspaces
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "workspaces_update_permitted" ON public.workspaces
  FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(id, auth.uid(), 'manage_workspace'))
  WITH CHECK (public.has_workspace_permission(id, auth.uid(), 'manage_workspace'));

CREATE TRIGGER workspaces_set_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quem cria o workspace vira Owner automaticamente.
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- ---------- RLS: workspace_members ----------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select_same_workspace" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "members_insert_permitted" ON public.workspace_members
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_members'));

CREATE POLICY "members_update_permitted" ON public.workspace_members
  FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_members'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_members'));

CREATE POLICY "members_delete_permitted" ON public.workspace_members
  FOR DELETE TO authenticated
  USING (
    public.has_workspace_permission(workspace_id, auth.uid(), 'manage_members')
    AND role <> 'owner'
  );

CREATE TRIGGER workspace_members_set_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- integrations ----------
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  display_name TEXT,
  status public.integration_status NOT NULL DEFAULT 'not_connected',
  status_detail TEXT,
  external_account_id TEXT,
  last_synced_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  record_count BIGINT NOT NULL DEFAULT 0,
  connected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (workspace_id, provider, external_account_id)
);

CREATE INDEX integrations_workspace_idx ON public.integrations (workspace_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select_member" ON public.integrations
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "integrations_insert_permitted" ON public.integrations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));

CREATE POLICY "integrations_update_permitted" ON public.integrations
  FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));

CREATE POLICY "integrations_delete_permitted" ON public.integrations
  FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));

CREATE TRIGGER integrations_set_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- audit_logs ----------
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_type public.actor_type NOT NULL DEFAULT 'user',
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  result TEXT,
  external_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_workspace_created_idx ON public.audit_logs (workspace_id, created_at DESC);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Somente leitura pela aplicação; a escrita acontece no servidor.
CREATE POLICY "audit_logs_select_permitted" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_audit_log'));