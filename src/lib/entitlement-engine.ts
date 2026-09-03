import type { FeatureKey } from "./billing-types";

/**
 * Matriz estática canônica de fallback para Entitlements (Seção 6 do Master Prompt)
 */
const CANONICAL_ENTITLEMENTS: Record<string, Record<FeatureKey, boolean>> = {
  starter: {
    tracking: true,
    analytics: true,
    attribution: true,
    finance: true,
    dre: true,
    reports: true,
    brain: true,
    ai_insights: true,
    ai_recommendations: true,
    ai_action_preparation: false,
    ai_action_execution: false,
    forecasting: false,
    anomaly_detection: false,
    advanced_intelligence: false,
    api: false,
    team_rbac: false,
    audit: true,
  },
  growth: {
    tracking: true,
    analytics: true,
    attribution: true,
    finance: true,
    dre: true,
    reports: true,
    brain: true,
    ai_insights: true,
    ai_recommendations: true,
    ai_action_preparation: true,
    ai_action_execution: false,
    forecasting: true,
    anomaly_detection: true,
    advanced_intelligence: false,
    api: true,
    team_rbac: true,
    audit: true,
  },
  scale: {
    tracking: true,
    analytics: true,
    attribution: true,
    finance: true,
    dre: true,
    reports: true,
    brain: true,
    ai_insights: true,
    ai_recommendations: true,
    ai_action_preparation: true,
    ai_action_execution: true,
    forecasting: true,
    anomaly_detection: true,
    advanced_intelligence: true,
    api: true,
    team_rbac: true,
    audit: true,
  },
  enterprise: {
    tracking: true,
    analytics: true,
    attribution: true,
    finance: true,
    dre: true,
    reports: true,
    brain: true,
    ai_insights: true,
    ai_recommendations: true,
    ai_action_preparation: true,
    ai_action_execution: true,
    forecasting: true,
    anomaly_detection: true,
    advanced_intelligence: true,
    api: true,
    team_rbac: true,
    audit: true,
  },
};

export const EntitlementEngine = {
  /**
   * Verifica se o plano (ou estado de trial) possui acesso à feature solicitada.
   * Durante o trial, o usuário possui acesso equivalente ao plano Growth/Scale completo.
   */
  hasFeature(params: {
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    featureKey: FeatureKey;
  }): boolean {
    const { planSlug, isTrial = false, featureKey } = params;

    // Se estiver em trial válido, libera recursos equivalentes a Growth
    if (isTrial) {
      const growthFeatures = CANONICAL_ENTITLEMENTS["growth"];
      return growthFeatures ? Boolean(growthFeatures[featureKey]) : true;
    }

    const normalizedSlug = (planSlug || "starter").toLowerCase();
    const defaultStarter = CANONICAL_ENTITLEMENTS["starter"] as Record<FeatureKey, boolean>;
    const planFeatures = CANONICAL_ENTITLEMENTS[normalizedSlug] || defaultStarter;

    return Boolean(planFeatures[featureKey]);
  },

  /**
   * Retorna o nível de configuração da feature (ex: basic, full, advanced, customizable)
   */
  getFeatureLevel(params: {
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    featureKey: FeatureKey;
  }): "disabled" | "basic" | "full" | "advanced" | "customizable" | "enterprise" {
    const { planSlug, isTrial = false, featureKey } = params;
    if (!this.hasFeature(params)) return "disabled";

    const normalizedSlug = isTrial ? "growth" : (planSlug || "starter").toLowerCase();

    if (featureKey === "analytics" || featureKey === "attribution" || featureKey === "dre") {
      if (normalizedSlug === "scale" || normalizedSlug === "enterprise") return "advanced";
      if (normalizedSlug === "growth") return "full";
      return "basic";
    }

    if (featureKey === "reports") {
      if (normalizedSlug === "enterprise") return "enterprise";
      if (normalizedSlug === "scale") return "customizable";
      if (normalizedSlug === "growth") return "advanced";
      return "basic";
    }

    if (featureKey === "brain") {
      if (normalizedSlug === "scale" || normalizedSlug === "enterprise") return "advanced";
      if (normalizedSlug === "growth") return "full";
      return "basic";
    }

    return "full";
  },

  /**
   * Lança uma exceção se a feature estiver desabilitada para o plano do workspace.
   */
  assertFeatureAccess(params: {
    planSlug?: string | null | undefined;
    isTrial?: boolean | undefined;
    featureKey: FeatureKey;
    featureName?: string | undefined;
  }): void {
    if (!this.hasFeature(params)) {
      const name = params.featureName || params.featureKey;
      throw new Error(
        `O recurso "${name}" não está disponível no plano ${params.planSlug?.toUpperCase() || "STARTER"}. Faça upgrade para o plano Growth ou Scale para desbloquear.`,
      );
    }
  },
};
