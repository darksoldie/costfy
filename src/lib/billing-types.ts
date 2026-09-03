/**
 * COSTFY BILLING & SUBSCRIPTION DOMAIN TYPES
 * Tipos centrais do motor comercial, planos, limites, entitlements e Mercado Pago.
 */

export type PlanInterval = "monthly" | "annual";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "grace_period"
  | "paused"
  | "canceled"
  | "expired";

export type WorkspaceBillingStatus = "trial" | "active" | "read_only" | "suspended";

export type FeatureKey =
  | "tracking"
  | "analytics"
  | "attribution"
  | "finance"
  | "dre"
  | "reports"
  | "brain"
  | "ai_insights"
  | "ai_recommendations"
  | "ai_action_preparation"
  | "ai_action_execution"
  | "forecasting"
  | "anomaly_detection"
  | "advanced_intelligence"
  | "api"
  | "team_rbac"
  | "audit";

export type ResourceKey =
  | "workspaces"
  | "members"
  | "ad_accounts"
  | "integrations"
  | "campaigns"
  | "automations"
  | "webhooks"
  | "audit_retention_days"
  | "history_days";

export interface Plan {
  id: string;
  slug: "starter" | "growth" | "scale" | "enterprise" | string;
  name: string;
  description: string | null;
  monthly_price: number; // em centavos (ex: 5990 = R$ 59,90)
  annual_price: number;  // em centavos (ex: 59900 = R$ 599,00)
  currency: string;      // "BRL", "USD", etc.
  is_public: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanEntitlement {
  id: string;
  plan_id: string;
  feature_key: FeatureKey;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PlanLimit {
  id: string;
  plan_id: string;
  resource_key: ResourceKey;
  limit_value: number; // -1 indica unlimited
  period: "monthly" | "annual" | "lifetime" | string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  plan_id: string;
  provider: "mercadopago" | string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  status: SubscriptionStatus;
  billing_interval: PlanInterval;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  workspace_id: string;
  provider_invoice_id: string | null;
  provider_payment_id: string | null;
  status: "paid" | "pending" | "failed" | "refunded" | "canceled";
  amount: number; // em centavos
  currency: string;
  due_at: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingCustomer {
  id: string;
  workspace_id: string;
  provider: string;
  provider_customer_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UsageSummary {
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  unlimited: boolean;
}

export interface WorkspaceUsageStats {
  workspaces: UsageSummary;
  members: UsageSummary;
  ad_accounts: UsageSummary;
  integrations: UsageSummary;
  campaigns: UsageSummary;
  automations: UsageSummary;
  webhooks: UsageSummary;
}

export interface CheckoutSessionRequest {
  workspaceId: string;
  planSlug: string;
  interval: PlanInterval;
  email?: string;
  returnUrl?: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  providerSubscriptionId?: string;
  isSandbox: boolean;
}
