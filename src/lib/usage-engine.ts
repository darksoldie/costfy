import type { ResourceKey, UsageSummary } from "./billing-types";

export const UNLIMITED = -1;

const CANONICAL_LIMITS: Record<string, Record<ResourceKey, number>> = {
  starter: {
    workspaces: 1,
    members: 1,
    ad_accounts: 2,
    integrations: 5,
    campaigns: 50,
    automations: 5,
    webhooks: 5,
    audit_retention_days: 30,
    history_days: 90,
  },
  growth: {
    workspaces: 1,
    members: 3,
    ad_accounts: 5,
    integrations: 15,
    campaigns: 250,
    automations: 25,
    webhooks: 25,
    audit_retention_days: 180,
    history_days: 365,
  },
  scale: {
    workspaces: 3,
    members: 10,
    ad_accounts: 15,
    integrations: UNLIMITED,
    campaigns: UNLIMITED,
    automations: UNLIMITED,
    webhooks: UNLIMITED,
    audit_retention_days: UNLIMITED,
    history_days: UNLIMITED,
  },
  enterprise: {
    workspaces: UNLIMITED,
    members: UNLIMITED,
    ad_accounts: UNLIMITED,
    integrations: UNLIMITED,
    campaigns: UNLIMITED,
    automations: UNLIMITED,
    webhooks: UNLIMITED,
    audit_retention_days: UNLIMITED,
    history_days: UNLIMITED,
  },
};

export const UsageEngine = {
  /**
   * Retorna o limite numérico para o recurso no plano fornecido.
   * Se for trial, os limites equivalem ao plano Growth.
   */
  getLimit(params: {
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    resourceKey: ResourceKey;
  }): number {
    const { planSlug, isTrial = false, resourceKey } = params;
    if (isTrial) {
      const growthLimits = CANONICAL_LIMITS["growth"];
      return growthLimits ? (growthLimits[resourceKey] ?? 100) : 100;
    }

    const normalizedSlug = (planSlug || "starter").toLowerCase();
    const defaultStarter = CANONICAL_LIMITS["starter"] as Record<ResourceKey, number>;
    const planLimits = CANONICAL_LIMITS[normalizedSlug] || defaultStarter;

    return planLimits[resourceKey] ?? UNLIMITED;
  },

  /**
   * Verifica se o recurso é ilimitado no plano.
   */
  isUnlimited(params: {
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    resourceKey: ResourceKey;
  }): boolean {
    return this.getLimit(params) === UNLIMITED;
  },

  /**
   * Calcula o resumo de uso atual (corrente, limite, restante, percentual, ilimitado).
   */
  calculateUsage(current: number, limit: number): UsageSummary {
    const safeCurrent = Math.max(0, current);
    const unlimited = limit === UNLIMITED;

    if (unlimited) {
      return {
        current: safeCurrent,
        limit: UNLIMITED,
        remaining: Infinity,
        percentage: 0,
        unlimited: true,
      };
    }

    const safeLimit = Math.max(1, limit);
    const remaining = Math.max(0, safeLimit - safeCurrent);
    const percentage = Math.min(100, Math.round((safeCurrent / safeLimit) * 100));

    return {
      current: safeCurrent,
      limit: safeLimit,
      remaining,
      percentage,
      unlimited: false,
    };
  },

  /**
   * Verifica se uma nova inserção é permitida antes de ultrapassar a cota do plano.
   */
  canCreate(params: {
    current: number;
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    resourceKey: ResourceKey;
  }): boolean {
    const limit = this.getLimit({
      planSlug: params.planSlug,
      isTrial: params.isTrial,
      resourceKey: params.resourceKey,
    });

    if (limit === UNLIMITED) return true;
    return params.current < limit;
  },

  /**
   * Lança uma exceção no backend caso o limite de uso tenha sido atingido.
   */
  assertWithinLimit(params: {
    current: number;
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    resourceKey: ResourceKey;
    resourceLabel?: string | undefined;
  }): void {
    if (!this.canCreate(params)) {
      const limit = this.getLimit({
        planSlug: params.planSlug,
        isTrial: params.isTrial,
        resourceKey: params.resourceKey,
      });
      const label = params.resourceLabel || params.resourceKey;
      throw new Error(
        `Limite de ${label} atingido (${params.current}/${limit}) para o plano ${params.planSlug?.toUpperCase() || "STARTER"}. Faça upgrade para expandir seus limites operacionais.`,
      );
    }
  },
};
