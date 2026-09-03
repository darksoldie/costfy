-- ============================================================
-- COSTFY BILLING SEED PLANS MIGRATION
-- Migration: 20260902041000_billing_seed_plans.sql
-- Description: Seeds official plans (Starter, Growth, Scale, Enterprise)
--              along with their respective entitlements and limits.
-- ============================================================

-- 1. SEED PLANS
INSERT INTO public.plans (id, slug, name, description, monthly_price, annual_price, currency, is_public, is_active, display_order)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'starter',
    'Starter',
    'Para quem está organizando a operação e consolidando métricas.',
    5990,   -- R$ 59,90/mês
    59900,  -- R$ 599,00/ano
    'BRL',
    true,
    true,
    1
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'growth',
    'Growth',
    'Para operações que escalam tráfego pago e necessitam de DRE e atribuição completa.',
    14990,  -- R$ 149,90/mês
    149900, -- R$ 1.499,00/ano
    'BRL',
    true,
    true,
    2
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'scale',
    'Scale',
    'Para múltiplas operações e times corporativos com automações de alto volume.',
    29990,  -- R$ 299,90/mês
    299900, -- R$ 2.999,00/ano
    'BRL',
    true,
    true,
    3
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'enterprise',
    'Enterprise',
    'Soluções sob medida para grandes marcas, agências e ecossistemas complexos.',
    0,      -- Customizado
    0,      -- Customizado
    'BRL',
    true,
    true,
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  currency = EXCLUDED.currency,
  is_public = EXCLUDED.is_public,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- 2. SEED LIMITS (STARTER)
INSERT INTO public.plan_limits (plan_id, resource_key, limit_value, period)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'workspaces', 1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'members', 1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'ad_accounts', 2, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'integrations', 5, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'campaigns', 50, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'automations', 5, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'webhooks', 5, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'audit_retention_days', 30, 'lifetime'),
  ('00000000-0000-0000-0000-000000000001', 'history_days', 90, 'lifetime')
ON CONFLICT (plan_id, resource_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  period = EXCLUDED.period,
  updated_at = now();

-- 3. SEED LIMITS (GROWTH)
INSERT INTO public.plan_limits (plan_id, resource_key, limit_value, period)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'workspaces', 1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'members', 3, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'ad_accounts', 5, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'integrations', 15, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'campaigns', 250, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'automations', 25, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'webhooks', 25, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'audit_retention_days', 180, 'lifetime'),
  ('00000000-0000-0000-0000-000000000002', 'history_days', 365, 'lifetime')
ON CONFLICT (plan_id, resource_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  period = EXCLUDED.period,
  updated_at = now();

-- 4. SEED LIMITS (SCALE)
INSERT INTO public.plan_limits (plan_id, resource_key, limit_value, period)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'workspaces', 3, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'members', 10, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'ad_accounts', 15, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'integrations', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'campaigns', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'automations', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'webhooks', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'audit_retention_days', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000003', 'history_days', -1, 'lifetime')
ON CONFLICT (plan_id, resource_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  period = EXCLUDED.period,
  updated_at = now();

-- 5. SEED LIMITS (ENTERPRISE - UNLIMITED)
INSERT INTO public.plan_limits (plan_id, resource_key, limit_value, period)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'workspaces', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'members', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'ad_accounts', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'integrations', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'campaigns', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'automations', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'webhooks', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'audit_retention_days', -1, 'lifetime'),
  ('00000000-0000-0000-0000-000000000004', 'history_days', -1, 'lifetime')
ON CONFLICT (plan_id, resource_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  period = EXCLUDED.period,
  updated_at = now();

-- 6. SEED ENTITLEMENTS (STARTER)
INSERT INTO public.plan_entitlements (plan_id, feature_key, enabled, config)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'tracking', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'analytics', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'attribution', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'finance', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'dre', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'reports', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'brain', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'ai_insights', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'ai_recommendations', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'ai_action_preparation', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'ai_action_execution', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'forecasting', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'anomaly_detection', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'advanced_intelligence', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'api', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'team_rbac', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'audit', true, '{"level": "basic"}'::jsonb)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  config = EXCLUDED.config,
  updated_at = now();

-- 7. SEED ENTITLEMENTS (GROWTH)
INSERT INTO public.plan_entitlements (plan_id, feature_key, enabled, config)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'tracking', true, '{"level": "full"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'analytics', true, '{"level": "full"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'attribution', true, '{"level": "full"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'finance', true, '{"level": "full"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'dre', true, '{"level": "full"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'reports', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'brain', true, '{"level": "full"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'ai_insights', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'ai_recommendations', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'ai_action_preparation', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'ai_action_execution', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'forecasting', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'anomaly_detection', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'advanced_intelligence', false, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'api', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'team_rbac', true, '{"level": "basic"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'audit', true, '{"level": "full"}'::jsonb)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  config = EXCLUDED.config,
  updated_at = now();

-- 8. SEED ENTITLEMENTS (SCALE)
INSERT INTO public.plan_entitlements (plan_id, feature_key, enabled, config)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'tracking', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'analytics', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'attribution', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'finance', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'dre', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'reports', true, '{"level": "customizable"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'brain', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'ai_insights', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'ai_recommendations', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'ai_action_preparation', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'ai_action_execution', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'forecasting', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'anomaly_detection', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'advanced_intelligence', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'api', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'team_rbac', true, '{"level": "advanced"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'audit', true, '{"level": "advanced"}'::jsonb)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  config = EXCLUDED.config,
  updated_at = now();

-- 9. SEED ENTITLEMENTS (ENTERPRISE - ALL ENABLED)
INSERT INTO public.plan_entitlements (plan_id, feature_key, enabled, config)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'tracking', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'analytics', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'attribution', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'finance', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'dre', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'reports', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'brain', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'ai_insights', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'ai_recommendations', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'ai_action_preparation', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'ai_action_execution', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'forecasting', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'anomaly_detection', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'advanced_intelligence', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'api', true, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'team_rbac', true, '{"level": "enterprise"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'audit', true, '{"level": "enterprise"}'::jsonb)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  config = EXCLUDED.config,
  updated_at = now();
