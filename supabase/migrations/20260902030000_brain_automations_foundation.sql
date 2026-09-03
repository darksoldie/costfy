-- =====================================================================
-- COSTFY — Brain, Automations, Actions e Notificações Foundation
-- =====================================================================

-- ---------- Tipos / Enums ----------
CREATE TYPE public.brain_action_status AS ENUM (
  'pending_approval', 'approved', 'rejected', 'executed', 'failed', 'rolled_back'
);

CREATE TYPE public.brain_insight_type AS ENUM (
  'anomaly', 'opportunity', 'warning', 'trend', 'recommendation'
);

CREATE TYPE public.brain_insight_severity AS ENUM (
  'info', 'warning', 'critical', 'success'
);

CREATE TYPE public.automation_status AS ENUM ('active', 'paused', 'draft');

CREATE TYPE public.automation_trigger_type AS ENUM (
  'metric_threshold', 'schedule', 'event', 'manual'
);

-- =====================================================================
-- 1. COSTFY BRAIN (Conversas, Mensagens, Insights, Ações)
-- =====================================================================

-- ---------- brain_conversations ----------
CREATE TABLE public.brain_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  context_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX brain_conversations_workspace_idx ON public.brain_conversations (workspace_id);
CREATE INDEX brain_conversations_user_idx ON public.brain_conversations (user_id);

-- ---------- brain_messages ----------
CREATE TABLE public.brain_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.brain_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  structured_payload JSONB,
  context_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX brain_messages_workspace_idx ON public.brain_messages (workspace_id);
CREATE INDEX brain_messages_conv_idx ON public.brain_messages (conversation_id, created_at ASC);

-- ---------- brain_insights ----------
CREATE TABLE public.brain_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type public.brain_insight_type NOT NULL DEFAULT 'recommendation',
  severity public.brain_insight_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  context_entity_type TEXT,
  context_entity_id TEXT,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX brain_insights_workspace_idx ON public.brain_insights (workspace_id, is_dismissed, created_at DESC);

-- ---------- brain_actions ----------
CREATE TABLE public.brain_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  proposed_by public.actor_type NOT NULL DEFAULT 'brain',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'low',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_diff JSONB,
  status public.brain_action_status NOT NULL DEFAULT 'pending_approval',
  guardrails_passed BOOLEAN NOT NULL DEFAULT true,
  idempotency_key TEXT UNIQUE,
  executed_at TIMESTAMPTZ,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX brain_actions_workspace_status_idx ON public.brain_actions (workspace_id, status, created_at DESC);
CREATE INDEX brain_actions_idempotency_idx ON public.brain_actions (idempotency_key);

-- =====================================================================
-- 2. AUTOMAÇÕES
-- =====================================================================

-- ---------- automations ----------
CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type public.automation_trigger_type NOT NULL DEFAULT 'metric_threshold',
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  condition_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  guardrails JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.automation_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX automations_workspace_idx ON public.automations (workspace_id, status);

-- ---------- automation_runs ----------
CREATE TABLE public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  trigger_event JSONB,
  execution_status TEXT NOT NULL DEFAULT 'success',
  result JSONB,
  error_detail TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX automation_runs_workspace_idx ON public.automation_runs (workspace_id, executed_at DESC);
CREATE INDEX automation_runs_automation_idx ON public.automation_runs (automation_id);

-- =====================================================================
-- 3. NOTIFICAÇÕES
-- =====================================================================

-- ---------- notifications ----------
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_to TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_workspace_user_idx ON public.notifications (workspace_id, user_id, is_read, created_at DESC);

-- =====================================================================
-- 4. TRIGGERS DE UPDATED_AT
-- =====================================================================

CREATE TRIGGER brain_conversations_set_updated_at BEFORE UPDATE ON public.brain_conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER brain_actions_set_updated_at BEFORE UPDATE ON public.brain_actions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER automations_set_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 5. RLS E PERMISSÕES
-- =====================================================================

ALTER TABLE public.brain_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_conversations TO authenticated;
GRANT ALL ON public.brain_conversations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_messages TO authenticated;
GRANT ALL ON public.brain_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_insights TO authenticated;
GRANT ALL ON public.brain_insights TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_actions TO authenticated;
GRANT ALL ON public.brain_actions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automations TO authenticated;
GRANT ALL ON public.automations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_runs TO authenticated;
GRANT ALL ON public.automation_runs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- brain_conversations
CREATE POLICY "brain_conversations_select" ON public.brain_conversations FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));
CREATE POLICY "brain_conversations_insert" ON public.brain_conversations FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain') AND user_id = auth.uid());
CREATE POLICY "brain_conversations_update" ON public.brain_conversations FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));
CREATE POLICY "brain_conversations_delete" ON public.brain_conversations FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));

-- brain_messages
CREATE POLICY "brain_messages_select" ON public.brain_messages FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));
CREATE POLICY "brain_messages_insert" ON public.brain_messages FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));
CREATE POLICY "brain_messages_delete" ON public.brain_messages FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));

-- brain_insights
CREATE POLICY "brain_insights_select" ON public.brain_insights FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "brain_insights_update" ON public.brain_insights FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- brain_actions
CREATE POLICY "brain_actions_select" ON public.brain_actions FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain') OR public.has_workspace_permission(workspace_id, auth.uid(), 'execute_brain_actions'));
CREATE POLICY "brain_actions_insert" ON public.brain_actions FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'use_brain'));
CREATE POLICY "brain_actions_update" ON public.brain_actions FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'execute_brain_actions'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'execute_brain_actions'));

-- automations
CREATE POLICY "automations_select" ON public.automations FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_automations') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_overview'));
CREATE POLICY "automations_insert" ON public.automations FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_automations'));
CREATE POLICY "automations_update" ON public.automations FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_automations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_automations'));
CREATE POLICY "automations_delete" ON public.automations FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_automations'));

-- automation_runs
CREATE POLICY "automation_runs_select" ON public.automation_runs FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_automations'));

-- notifications
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT TO authenticated
  USING (workspace_id IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()) AND public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
