-- ============================================================
-- COSTFY BILLING FOUNDATION MIGRATION
-- Migration: 20260902040000_billing_foundation.sql
-- Description: Creates plans, entitlements, limits, subscriptions,
--              invoices, billing customers, webhook events, and
--              security triggers protecting workspace status/trial.
-- ============================================================

-- 1. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_interval') THEN
    CREATE TYPE public.plan_interval AS ENUM ('monthly', 'annual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE public.subscription_status AS ENUM (
      'trialing',
      'active',
      'past_due',
      'grace_period',
      'paused',
      'canceled',
      'expired'
    );
  END IF;
END $$;

-- 2. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL DEFAULT 0, -- em centavos (ex: 5990 = R$ 59,90)
  annual_price INTEGER NOT NULL DEFAULT 0,  -- em centavos (ex: 59900 = R$ 599,00)
  currency TEXT NOT NULL DEFAULT 'BRL',
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plans_slug_idx ON public.plans (slug);
CREATE INDEX IF NOT EXISTS plans_is_public_idx ON public.plans (is_public, is_active);

-- 3. PLAN ENTITLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, feature_key)
);

CREATE INDEX IF NOT EXISTS plan_entitlements_plan_idx ON public.plan_entitlements (plan_id);

-- 4. PLAN LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  resource_key TEXT NOT NULL,
  limit_value INTEGER NOT NULL DEFAULT 0, -- -1 indica unlimited
  period TEXT DEFAULT 'lifetime',          -- 'monthly', 'annual', 'lifetime'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, resource_key)
);

CREATE INDEX IF NOT EXISTS plan_limits_plan_idx ON public.plan_limits (plan_id);

-- 5. BILLING CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  provider_customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, provider)
);

CREATE INDEX IF NOT EXISTS billing_customers_workspace_idx ON public.billing_customers (workspace_id);
CREATE INDEX IF NOT EXISTS billing_customers_provider_idx ON public.billing_customers (provider, provider_customer_id);

-- 6. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  billing_interval public.plan_interval NOT NULL DEFAULT 'monthly',
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_workspace_active_idx 
  ON public.subscriptions (workspace_id) 
  WHERE status IN ('active', 'trialing', 'grace_period', 'past_due');

CREATE INDEX IF NOT EXISTS subscriptions_workspace_idx ON public.subscriptions (workspace_id);
CREATE INDEX IF NOT EXISTS subscriptions_provider_sub_idx ON public.subscriptions (provider, provider_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions (status);

-- 7. SUBSCRIPTION INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider_invoice_id TEXT,
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'paid', 'pending', 'failed', 'refunded', 'canceled'
  amount INTEGER NOT NULL DEFAULT 0,      -- em centavos
  currency TEXT NOT NULL DEFAULT 'BRL',
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_invoices_sub_idx ON public.subscription_invoices (subscription_id);
CREATE INDEX IF NOT EXISTS subscription_invoices_workspace_idx ON public.subscription_invoices (workspace_id);
CREATE INDEX IF NOT EXISTS subscription_invoices_status_idx ON public.subscription_invoices (status);

-- 8. BILLING WEBHOOK EVENTS TABLE (Idempotência Estrita)
CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT billing_webhook_events_provider_external_id_key UNIQUE (provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS billing_webhook_events_processed_idx ON public.billing_webhook_events (processed);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

-- Plans & Entitlements: leitura pública para todos os usuários autenticados
CREATE POLICY "plans_read_policy" ON public.plans
  FOR SELECT TO authenticated USING (is_public = true OR is_active = true);

CREATE POLICY "plan_entitlements_read_policy" ON public.plan_entitlements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "plan_limits_read_policy" ON public.plan_limits
  FOR SELECT TO authenticated USING (true);

-- Billing Customers: isolamento estrito por workspace_id
CREATE POLICY "billing_customers_tenant_policy" ON public.billing_customers
  FOR SELECT TO authenticated USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Subscriptions: isolamento estrito por workspace_id
CREATE POLICY "subscriptions_tenant_policy" ON public.subscriptions
  FOR SELECT TO authenticated USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Invoices: isolamento estrito por workspace_id
CREATE POLICY "subscription_invoices_tenant_policy" ON public.subscription_invoices
  FOR SELECT TO authenticated USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Billing Webhook Events: restrito ao service_role (não acessível por client normal)
CREATE POLICY "billing_webhook_events_service_only" ON public.billing_webhook_events
  FOR ALL TO authenticated USING (false);

-- 10. TRIGGER DE PROTEÇÃO DE STATUS E TRIAL EM WORKSPACES
-- Impede que updates feitos diretamente via PostgREST/Client alterem status e trial_ends_at
-- Somente funções SECURITY DEFINER ou service_role podem alterar essas colunas.
CREATE OR REPLACE FUNCTION public.protect_workspace_status_and_trial()
RETURNS trigger AS $$
BEGIN
  -- Se a mutação veio de uma sessão normal de usuário autenticado (não service_role)
  IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'A alteração do status do workspace só pode ser realizada pelo serviço de Billing.';
    END IF;
    IF NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at THEN
      RAISE EXCEPTION 'A alteração do período de trial só pode ser realizada pelo serviço de Billing.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_workspace_status_and_trial ON public.workspaces;
CREATE TRIGGER trg_protect_workspace_status_and_trial
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.protect_workspace_status_and_trial();
