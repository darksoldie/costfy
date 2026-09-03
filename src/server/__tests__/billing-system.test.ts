import { describe, it, expect } from "vitest";
import { EntitlementEngine } from "@/lib/entitlement-engine";
import { UsageEngine, UNLIMITED } from "@/lib/usage-engine";
import { MercadoPagoProvider } from "@/server/billing-provider";

describe("Costfy Commercial Billing & Subscription Engine", () => {
  describe("Entitlement Engine", () => {
    it("deve garantir que o plano Starter possui apenas recursos essenciais", () => {
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "tracking" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "dre" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "ai_insights" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "ai_action_preparation" })).toBe(false);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "ai_action_execution" })).toBe(false);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "forecasting" })).toBe(false);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", featureKey: "anomaly_detection" })).toBe(false);
    });

    it("deve garantir que o plano Growth desbloqueia forecasting e preparação de ações", () => {
      expect(EntitlementEngine.hasFeature({ planSlug: "growth", featureKey: "forecasting" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "growth", featureKey: "anomaly_detection" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "growth", featureKey: "ai_action_preparation" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "growth", featureKey: "ai_action_execution" })).toBe(false);
    });

    it("deve garantir que o plano Scale desbloqueia execução autônoma de ações no Brain", () => {
      expect(EntitlementEngine.hasFeature({ planSlug: "scale", featureKey: "ai_action_execution" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "scale", featureKey: "advanced_intelligence" })).toBe(true);
    });

    it("deve liberar recursos de Growth durante o período de trial", () => {
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", isTrial: true, featureKey: "forecasting" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", isTrial: true, featureKey: "anomaly_detection" })).toBe(true);
      expect(EntitlementEngine.hasFeature({ planSlug: "starter", isTrial: true, featureKey: "ai_action_preparation" })).toBe(true);
    });

    it("deve lançar exceção descritiva quando feature for bloqueada", () => {
      expect(() => {
        EntitlementEngine.assertFeatureAccess({
          planSlug: "starter",
          featureKey: "forecasting",
          featureName: "Projeção Financeira",
        });
      }).toThrow(/não está disponível no plano STARTER/);
    });
  });

  describe("Usage Engine", () => {
    it("deve retornar limites oficiais do plano Starter", () => {
      expect(UsageEngine.getLimit({ planSlug: "starter", resourceKey: "workspaces" })).toBe(1);
      expect(UsageEngine.getLimit({ planSlug: "starter", resourceKey: "members" })).toBe(1);
      expect(UsageEngine.getLimit({ planSlug: "starter", resourceKey: "ad_accounts" })).toBe(2);
      expect(UsageEngine.getLimit({ planSlug: "starter", resourceKey: "integrations" })).toBe(5);
      expect(UsageEngine.getLimit({ planSlug: "starter", resourceKey: "campaigns" })).toBe(50);
      expect(UsageEngine.getLimit({ planSlug: "starter", resourceKey: "automations" })).toBe(5);
    });

    it("deve retornar limites oficiais do plano Growth", () => {
      expect(UsageEngine.getLimit({ planSlug: "growth", resourceKey: "workspaces" })).toBe(1);
      expect(UsageEngine.getLimit({ planSlug: "growth", resourceKey: "members" })).toBe(3);
      expect(UsageEngine.getLimit({ planSlug: "growth", resourceKey: "ad_accounts" })).toBe(5);
      expect(UsageEngine.getLimit({ planSlug: "growth", resourceKey: "integrations" })).toBe(15);
      expect(UsageEngine.getLimit({ planSlug: "growth", resourceKey: "campaigns" })).toBe(250);
      expect(UsageEngine.getLimit({ planSlug: "growth", resourceKey: "automations" })).toBe(25);
    });

    it("deve retornar limites ilimitados (-1) para o plano Scale", () => {
      expect(UsageEngine.getLimit({ planSlug: "scale", resourceKey: "integrations" })).toBe(UNLIMITED);
      expect(UsageEngine.getLimit({ planSlug: "scale", resourceKey: "campaigns" })).toBe(UNLIMITED);
      expect(UsageEngine.getLimit({ planSlug: "scale", resourceKey: "automations" })).toBe(UNLIMITED);
      expect(UsageEngine.isUnlimited({ planSlug: "scale", resourceKey: "campaigns" })).toBe(true);
    });

    it("deve calcular uso e percentual corretamente sem divisão por zero", () => {
      const usage = UsageEngine.calculateUsage(25, 50);
      expect(usage.current).toBe(25);
      expect(usage.limit).toBe(50);
      expect(usage.remaining).toBe(25);
      expect(usage.percentage).toBe(50);
      expect(usage.unlimited).toBe(false);

      const unlimitedUsage = UsageEngine.calculateUsage(150, UNLIMITED);
      expect(unlimitedUsage.current).toBe(150);
      expect(unlimitedUsage.unlimited).toBe(true);
      expect(unlimitedUsage.remaining).toBe(Infinity);
      expect(unlimitedUsage.percentage).toBe(0);
    });

    it("deve bloquear criação e lançar erro ao atingir o limite", () => {
      expect(UsageEngine.canCreate({ current: 50, planSlug: "starter", resourceKey: "campaigns" })).toBe(false);
      expect(UsageEngine.canCreate({ current: 49, planSlug: "starter", resourceKey: "campaigns" })).toBe(true);

      expect(() => {
        UsageEngine.assertWithinLimit({
          current: 50,
          planSlug: "starter",
          resourceKey: "campaigns",
          resourceLabel: "Campanhas",
        });
      }).toThrow(/Limite de Campanhas atingido \(50\/50\)/);
    });
  });

  describe("Mercado Pago Provider & Sandbox Mode", () => {
    it("deve operar em modo sandbox gracioso quando sem token no ambiente", async () => {
      const provider = new MercadoPagoProvider();
      const checkout = await provider.createCheckout({
        workspaceId: "ws-test-123",
        planSlug: "growth",
        planName: "Growth",
        amountCents: 14990,
        currency: "BRL",
        interval: "monthly",
        payerEmail: "operacoes@costfy.com.br",
        returnUrl: "http://localhost:8080/settings/billing",
      });

      expect(checkout.isSandbox).toBe(true);
      expect(checkout.checkoutUrl).toContain("sandbox=true");
      expect(checkout.checkoutUrl).toContain("plan=growth");
      expect(checkout.providerSubscriptionId).toContain("mp_sub_sandbox_ws-test-123");
    });
  });
});
