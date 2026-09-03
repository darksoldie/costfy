-- =====================================================================
-- COSTFY — Camada de Dados de Negócio (Business Data Foundation)
-- Domínios: Marketing, Vendas, Produtos, Clientes, Financeiro e Tracking
-- =====================================================================

-- ---------- Tipos / Enums de Negócio ----------
CREATE TYPE public.campaign_status AS ENUM ('active', 'paused', 'archived', 'draft');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'canceled', 'refunded', 'failed');
CREATE TYPE public.product_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE public.product_type AS ENUM ('physical', 'digital', 'service', 'subscription');
CREATE TYPE public.creative_type AS ENUM ('image', 'video', 'carousel', 'text');
CREATE TYPE public.financial_entry_type AS ENUM ('income', 'expense', 'fee', 'tax', 'cost_of_goods', 'ad_spend', 'adjustment');
CREATE TYPE public.attribution_model AS ENUM ('first_click', 'last_click', 'linear', 'data_driven');

-- =====================================================================
-- 1. MARKETING (Campanhas, Conjuntos, Criativos, Anúncios, Métricas)
-- =====================================================================

-- ---------- campaigns ----------
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'active',
  objective TEXT,
  budget NUMERIC(14,4),
  currency TEXT NOT NULL DEFAULT 'BRL',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX campaigns_workspace_idx ON public.campaigns (workspace_id);
CREATE INDEX campaigns_integration_idx ON public.campaigns (integration_id);
CREATE INDEX campaigns_platform_ext_idx ON public.campaigns (workspace_id, platform, external_id) WHERE deleted_at IS NULL;

-- ---------- ad_sets ----------
CREATE TABLE public.ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'active',
  budget NUMERIC(14,4),
  currency TEXT NOT NULL DEFAULT 'BRL',
  targeting JSONB,
  optimization_goal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX ad_sets_workspace_idx ON public.ad_sets (workspace_id);
CREATE INDEX ad_sets_campaign_idx ON public.ad_sets (campaign_id);
CREATE INDEX ad_sets_ext_idx ON public.ad_sets (workspace_id, external_id) WHERE deleted_at IS NULL;

-- ---------- creatives ----------
CREATE TABLE public.creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  name TEXT,
  type public.creative_type NOT NULL DEFAULT 'image',
  url TEXT,
  thumbnail_url TEXT,
  headline TEXT,
  body_text TEXT,
  call_to_action TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX creatives_workspace_idx ON public.creatives (workspace_id);
CREATE INDEX creatives_ext_idx ON public.creatives (workspace_id, external_id) WHERE deleted_at IS NULL;

-- ---------- ads ----------
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  ad_set_id UUID NOT NULL REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'active',
  preview_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX ads_workspace_idx ON public.ads (workspace_id);
CREATE INDEX ads_campaign_idx ON public.ads (campaign_id);
CREATE INDEX ads_ad_set_idx ON public.ads (ad_set_id);
CREATE INDEX ads_creative_idx ON public.ads (creative_id);
CREATE INDEX ads_ext_idx ON public.ads (workspace_id, external_id) WHERE deleted_at IS NULL;

-- ---------- ad_metrics_daily ----------
CREATE TABLE public.ad_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  ad_set_id UUID REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  spend NUMERIC(14,4) NOT NULL DEFAULT 0,
  spend_base_currency NUMERIC(14,4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  exchange_rate NUMERIC(12,6) NOT NULL DEFAULT 1.0,
  conversions BIGINT NOT NULL DEFAULT 0,
  purchases BIGINT NOT NULL DEFAULT 0,
  revenue NUMERIC(14,4) NOT NULL DEFAULT 0,
  revenue_base_currency NUMERIC(14,4) NOT NULL DEFAULT 0,
  reach BIGINT,
  frequency NUMERIC(8,4),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, ad_id, date, platform)
);

CREATE INDEX ad_metrics_daily_workspace_date_idx ON public.ad_metrics_daily (workspace_id, date DESC);
CREATE INDEX ad_metrics_daily_campaign_date_idx ON public.ad_metrics_daily (workspace_id, campaign_id, date DESC);
CREATE INDEX ad_metrics_daily_ad_set_date_idx ON public.ad_metrics_daily (workspace_id, ad_set_id, date DESC);

-- =====================================================================
-- 2. VENDAS, PRODUTOS E CLIENTES
-- =====================================================================

-- ---------- products ----------
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  price NUMERIC(14,4) NOT NULL DEFAULT 0,
  cost_price NUMERIC(14,4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status public.product_status NOT NULL DEFAULT 'active',
  type public.product_type NOT NULL DEFAULT 'physical',
  url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX products_workspace_idx ON public.products (workspace_id);
CREATE INDEX products_sku_idx ON public.products (workspace_id, sku) WHERE deleted_at IS NULL;
CREATE INDEX products_ext_idx ON public.products (workspace_id, external_id) WHERE deleted_at IS NULL;

-- ---------- customers ----------
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  document TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'BR',
  total_orders INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(14,4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  first_order_at TIMESTAMPTZ,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customers_workspace_idx ON public.customers (workspace_id);
CREATE INDEX customers_email_idx ON public.customers (workspace_id, email);
CREATE INDEX customers_ext_idx ON public.customers (workspace_id, external_id);

-- ---------- orders ----------
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  external_id TEXT,
  order_number TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  financial_status TEXT,
  fulfillment_status TEXT,
  total_amount NUMERIC(14,4) NOT NULL DEFAULT 0,
  subtotal_amount NUMERIC(14,4) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,4) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,4) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(14,4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  total_base_currency NUMERIC(14,4) NOT NULL DEFAULT 0,
  exchange_rate NUMERIC(12,6) NOT NULL DEFAULT 1.0,
  exchange_rate_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_gateway TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  session_id TEXT,
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX orders_workspace_ordered_idx ON public.orders (workspace_id, ordered_at DESC);
CREATE INDEX orders_customer_idx ON public.orders (workspace_id, customer_id);
CREATE INDEX orders_ext_idx ON public.orders (workspace_id, external_id) WHERE deleted_at IS NULL;
CREATE INDEX orders_utm_source_idx ON public.orders (workspace_id, utm_source);

-- ---------- order_items ----------
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  external_id TEXT,
  sku TEXT,
  title TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,4) NOT NULL DEFAULT 0,
  total_price NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(14,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(14,4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX order_items_workspace_idx ON public.order_items (workspace_id);
CREATE INDEX order_items_order_idx ON public.order_items (order_id);
CREATE INDEX order_items_product_idx ON public.order_items (product_id);

-- =====================================================================
-- 3. FINANCEIRO (Custos de Produto, Taxas, Impostos, Custos Fixos, Lançamentos)
-- =====================================================================

-- ---------- product_costs ----------
CREATE TABLE public.product_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  cost_amount NUMERIC(14,4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  cost_type TEXT NOT NULL DEFAULT 'cogs',
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX product_costs_workspace_product_idx ON public.product_costs (workspace_id, product_id);

-- ---------- gateway_fees ----------
CREATE TABLE public.gateway_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'all',
  fee_percentage NUMERIC(6,4) NOT NULL DEFAULT 0,
  fixed_fee NUMERIC(10,4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX gateway_fees_workspace_idx ON public.gateway_fees (workspace_id);

-- ---------- taxes ----------
CREATE TABLE public.taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate_percentage NUMERIC(6,4) NOT NULL DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'gross_revenue',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX taxes_workspace_idx ON public.taxes (workspace_id);

-- ---------- fixed_costs ----------
CREATE TABLE public.fixed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'software',
  amount NUMERIC(14,4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  periodicity TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX fixed_costs_workspace_idx ON public.fixed_costs (workspace_id);

-- ---------- financial_entries ----------
CREATE TABLE public.financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type public.financial_entry_type NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14,4) NOT NULL,
  amount_base_currency NUMERIC(14,4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  exchange_rate NUMERIC(12,6) NOT NULL DEFAULT 1.0,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX financial_entries_workspace_date_idx ON public.financial_entries (workspace_id, entry_date DESC);
CREATE INDEX financial_entries_workspace_type_idx ON public.financial_entries (workspace_id, type);

-- =====================================================================
-- 4. TRACKING (UTMs, Sessões, Eventos e Atribuição)
-- =====================================================================

-- ---------- utm_links ----------
CREATE TABLE public.utm_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_content TEXT,
  utm_term TEXT,
  short_code TEXT UNIQUE,
  custom_params JSONB,
  click_count BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX utm_links_workspace_idx ON public.utm_links (workspace_id);
CREATE INDEX utm_links_short_code_idx ON public.utm_links (short_code);

-- ---------- tracking_sessions ----------
CREATE TABLE public.tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  landing_page TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, session_token)
);

CREATE INDEX tracking_sessions_workspace_idx ON public.tracking_sessions (workspace_id);
CREATE INDEX tracking_sessions_visitor_idx ON public.tracking_sessions (workspace_id, visitor_id);
CREATE INDEX tracking_sessions_started_idx ON public.tracking_sessions (workspace_id, started_at DESC);

-- ---------- tracking_events ----------
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  properties JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tracking_events_workspace_idx ON public.tracking_events (workspace_id);
CREATE INDEX tracking_events_session_idx ON public.tracking_events (session_id);
CREATE INDEX tracking_events_occurred_idx ON public.tracking_events (workspace_id, occurred_at DESC);
CREATE INDEX tracking_events_name_idx ON public.tracking_events (workspace_id, event_name);

-- ---------- attributions ----------
CREATE TABLE public.attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  model public.attribution_model NOT NULL DEFAULT 'last_click',
  attributed_revenue NUMERIC(14,4) NOT NULL DEFAULT 0,
  attributed_weight NUMERIC(6,4) NOT NULL DEFAULT 1.0,
  touchpoint_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX attributions_workspace_order_idx ON public.attributions (workspace_id, order_id);
CREATE INDEX attributions_campaign_idx ON public.attributions (workspace_id, campaign_id);

-- =====================================================================
-- 5. TRIGGERS DE UPDATED_AT
-- =====================================================================

CREATE TRIGGER campaigns_set_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ad_sets_set_updated_at BEFORE UPDATE ON public.ad_sets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER creatives_set_updated_at BEFORE UPDATE ON public.creatives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ads_set_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER product_costs_set_updated_at BEFORE UPDATE ON public.product_costs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER gateway_fees_set_updated_at BEFORE UPDATE ON public.gateway_fees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER taxes_set_updated_at BEFORE UPDATE ON public.taxes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER fixed_costs_set_updated_at BEFORE UPDATE ON public.fixed_costs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER utm_links_set_updated_at BEFORE UPDATE ON public.utm_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 6. PERMISSÕES E ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributions ENABLE ROW LEVEL SECURITY;

-- Grants para authenticated e service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_sets TO authenticated;
GRANT ALL ON public.ad_sets TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creatives TO authenticated;
GRANT ALL ON public.creatives TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_metrics_daily TO authenticated;
GRANT ALL ON public.ad_metrics_daily TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_costs TO authenticated;
GRANT ALL ON public.product_costs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gateway_fees TO authenticated;
GRANT ALL ON public.gateway_fees TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.taxes TO authenticated;
GRANT ALL ON public.taxes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_costs TO authenticated;
GRANT ALL ON public.fixed_costs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_entries TO authenticated;
GRANT ALL ON public.financial_entries TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.utm_links TO authenticated;
GRANT ALL ON public.utm_links TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_sessions TO authenticated;
GRANT ALL ON public.tracking_sessions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attributions TO authenticated;
GRANT ALL ON public.attributions TO service_role;

-- ---------- Políticas RLS: Marketing ----------
-- campaigns
CREATE POLICY "campaigns_select" ON public.campaigns FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_campaigns'));
CREATE POLICY "campaigns_insert" ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "campaigns_update" ON public.campaigns FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "campaigns_delete" ON public.campaigns FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));

-- ad_sets
CREATE POLICY "ad_sets_select" ON public.ad_sets FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_campaigns'));
CREATE POLICY "ad_sets_insert" ON public.ad_sets FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "ad_sets_update" ON public.ad_sets FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "ad_sets_delete" ON public.ad_sets FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));

-- creatives
CREATE POLICY "creatives_select" ON public.creatives FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_campaigns'));
CREATE POLICY "creatives_insert" ON public.creatives FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "creatives_update" ON public.creatives FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "creatives_delete" ON public.creatives FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));

-- ads
CREATE POLICY "ads_select" ON public.ads FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_campaigns'));
CREATE POLICY "ads_insert" ON public.ads FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "ads_update" ON public.ads FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));
CREATE POLICY "ads_delete" ON public.ads FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns'));

-- ad_metrics_daily
CREATE POLICY "ad_metrics_daily_select" ON public.ad_metrics_daily FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_campaigns') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_overview'));
CREATE POLICY "ad_metrics_daily_insert" ON public.ad_metrics_daily FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "ad_metrics_daily_update" ON public.ad_metrics_daily FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_campaigns') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "ad_metrics_daily_delete" ON public.ad_metrics_daily FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- ---------- Políticas RLS: Vendas e Produtos ----------
-- products
CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_sales') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_overview'));
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- customers
CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_sales'));
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- orders
CREATE POLICY "orders_select" ON public.orders FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_sales') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_overview'));
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- order_items
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_sales') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_overview'));
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "order_items_update" ON public.order_items FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "order_items_delete" ON public.order_items FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- ---------- Políticas RLS: Financeiro ----------
-- product_costs
CREATE POLICY "product_costs_select" ON public.product_costs FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_finance'));
CREATE POLICY "product_costs_insert" ON public.product_costs FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "product_costs_update" ON public.product_costs FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "product_costs_delete" ON public.product_costs FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));

-- gateway_fees
CREATE POLICY "gateway_fees_select" ON public.gateway_fees FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_finance'));
CREATE POLICY "gateway_fees_insert" ON public.gateway_fees FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "gateway_fees_update" ON public.gateway_fees FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "gateway_fees_delete" ON public.gateway_fees FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));

-- taxes
CREATE POLICY "taxes_select" ON public.taxes FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_finance'));
CREATE POLICY "taxes_insert" ON public.taxes FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "taxes_update" ON public.taxes FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "taxes_delete" ON public.taxes FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));

-- fixed_costs
CREATE POLICY "fixed_costs_select" ON public.fixed_costs FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_finance'));
CREATE POLICY "fixed_costs_insert" ON public.fixed_costs FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "fixed_costs_update" ON public.fixed_costs FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "fixed_costs_delete" ON public.fixed_costs FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));

-- financial_entries
CREATE POLICY "financial_entries_select" ON public.financial_entries FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_finance') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_overview'));
CREATE POLICY "financial_entries_insert" ON public.financial_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "financial_entries_update" ON public.financial_entries FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));
CREATE POLICY "financial_entries_delete" ON public.financial_entries FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_finance'));

-- ---------- Políticas RLS: Tracking ----------
-- utm_links
CREATE POLICY "utm_links_select" ON public.utm_links FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_tracking'));
CREATE POLICY "utm_links_insert" ON public.utm_links FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_tracking'));
CREATE POLICY "utm_links_update" ON public.utm_links FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_tracking'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_tracking'));
CREATE POLICY "utm_links_delete" ON public.utm_links FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'edit_tracking'));

-- tracking_sessions
CREATE POLICY "tracking_sessions_select" ON public.tracking_sessions FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_tracking'));
CREATE POLICY "tracking_sessions_insert" ON public.tracking_sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "tracking_sessions_update" ON public.tracking_sessions FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "tracking_sessions_delete" ON public.tracking_sessions FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- tracking_events
CREATE POLICY "tracking_events_select" ON public.tracking_events FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_tracking'));
CREATE POLICY "tracking_events_insert" ON public.tracking_events FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "tracking_events_update" ON public.tracking_events FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));
CREATE POLICY "tracking_events_delete" ON public.tracking_events FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));

-- attributions
CREATE POLICY "attributions_select" ON public.attributions FOR SELECT TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'view_tracking') OR public.has_workspace_permission(workspace_id, auth.uid(), 'view_sales'));
CREATE POLICY "attributions_insert" ON public.attributions FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "attributions_update" ON public.attributions FOR UPDATE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'))
  WITH CHECK (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace') OR public.has_workspace_permission(workspace_id, auth.uid(), 'manage_integrations'));
CREATE POLICY "attributions_delete" ON public.attributions FOR DELETE TO authenticated
  USING (public.has_workspace_permission(workspace_id, auth.uid(), 'manage_workspace'));
