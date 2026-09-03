/**
 * COSTFY — METRICS ENGINE CENTRALIZADO
 *
 * Todas as telas (Dashboard, Analytics, Marketing, Vendas, Financeiro, Brain, Relatórios)
 * utilizam EXATAMENTE o mesmo motor matemático de cálculo.
 * Nenhuma tela calcula ROAS, CPA, Margem ou Lucro Real de forma isolada.
 */

export interface FinancialBreakdown {
  grossRevenue: number;
  refundsAndDiscounts: number;
  netRevenue: number;
  cogs: number; // Custo da Mercadoria Vendida (CMV)
  gatewayFees: number;
  taxes: number;
  adSpend: number; // Investimento em Mídia
  contributionMargin: number; // Receita Líquida - CMV - Taxas - Impostos - Tráfego
  contributionMarginPercent: number;
  fixedCosts: number;
  trueProfit: number; // Lucro Líquido Real
  realMarginPercent: number; // Lucro Líquido / Receita Bruta
}

export interface TrafficMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number; // Click-through Rate %
  cpc: number; // Custo por Clique
  cpm: number; // Custo por Mil Impressões
  cpa: number; // Custo por Aquisição / Conversão
  roas: number; // Retorno sobre Investimento em Ads
}

export interface SalesMetrics {
  totalOrders: number;
  paidOrders: number;
  totalCustomers: number;
  grossRevenue: number;
  averageTicket: number;
  conversionRate: number; // Pedidos / Sessões %
  ltv: number; // Receita / Clientes Únicos
}

export interface WorkspaceFinancialInput {
  orders: Array<{
    total_amount: number | null;
    discount_amount?: number | null;
    status?: string | null;
    payment_gateway?: string | null;
  }>;
  campaigns: Array<{
    budget: number | null;
  }>;
  fixedCosts: Array<{
    amount: number | null;
    active?: boolean | null;
  }>;
  orderItems?: Array<{
    total_cost: number | null;
  }>;
  gatewayFees?: Array<{
    gateway: string;
    fee_percentage: number;
    fixed_fee: number;
    active?: boolean;
  }>;
  taxes?: Array<{
    rate_percentage: number;
    active?: boolean;
  }>;
  adMetricsDaily?: Array<{
    spend: number;
  }>;
}

export interface WorkspaceFinancialResult extends FinancialBreakdown {
  hasConfiguredCogs: boolean;
  hasConfiguredGatewayFees: boolean;
  hasConfiguredTaxes: boolean;
}

export const MetricsEngine = {
  /**
   * Agregação Canônica a partir de dados reais do Workspace.
   * Elimina estimativas hardcoded: valores não cadastrados resultam em 0 com alertas informativos.
   */
  calculateWorkspaceFinancials(input: WorkspaceFinancialInput): WorkspaceFinancialResult {
    const grossRevenue = input.orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const refundsAndDiscounts = input.orders.reduce(
      (acc, o) =>
        acc + (o.discount_amount || 0) + (o.status === "refunded" ? o.total_amount || 0 : 0),
      0,
    );

    const hasConfiguredCogs = Boolean(input.orderItems && input.orderItems.length > 0);
    const cogs = hasConfiguredCogs
      ? input.orderItems!.reduce((acc, item) => acc + (item.total_cost || 0), 0)
      : 0;

    const activeGatewayFees = (input.gatewayFees || []).filter((f) => f.active !== false);
    const hasConfiguredGatewayFees = activeGatewayFees.length > 0;
    const gatewayFees = hasConfiguredGatewayFees
      ? input.orders.reduce((acc, o) => {
          const fee =
            activeGatewayFees.find(
              (f) => f.gateway.toLowerCase() === (o.payment_gateway || "").toLowerCase(),
            ) || activeGatewayFees[0];
          const feePct = (fee?.fee_percentage || 0) / 100;
          const fixed = fee?.fixed_fee || 0;
          return acc + (o.total_amount || 0) * feePct + fixed;
        }, 0)
      : 0;

    const activeTaxes = (input.taxes || []).filter((t) => t.active !== false);
    const hasConfiguredTaxes = activeTaxes.length > 0;
    const totalTaxRate = activeTaxes.reduce((acc, t) => acc + (t.rate_percentage || 0), 0) / 100;
    const taxes = hasConfiguredTaxes ? grossRevenue * totalTaxRate : 0;

    const adSpend =
      input.adMetricsDaily && input.adMetricsDaily.length > 0
        ? input.adMetricsDaily.reduce((acc, m) => acc + (m.spend || 0), 0)
        : input.campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);

    const fixedCosts = input.fixedCosts
      .filter((fc) => fc.active !== false)
      .reduce((acc, fc) => acc + (fc.amount || 0), 0);

    const baseFinancials = this.calculateFinancials({
      grossRevenue,
      refundsAndDiscounts,
      cogs,
      gatewayFees,
      taxes,
      adSpend,
      fixedCosts,
    });

    return {
      ...baseFinancials,
      hasConfiguredCogs,
      hasConfiguredGatewayFees,
      hasConfiguredTaxes,
    };
  },

  /**
   * Cálculo Canônico do Lucro Real e DRE Gerencial
   */
  calculateFinancials(params: {
    grossRevenue: number;
    refundsAndDiscounts?: number;
    cogs?: number;
    gatewayFees?: number;
    taxes?: number;
    adSpend?: number;
    fixedCosts?: number;
  }): FinancialBreakdown {
    const grossRevenue = Math.max(0, params.grossRevenue || 0);
    const refundsAndDiscounts = Math.max(0, params.refundsAndDiscounts || 0);
    const netRevenue = Math.max(0, grossRevenue - refundsAndDiscounts);
    const cogs = Math.max(0, params.cogs || 0);
    const gatewayFees = Math.max(0, params.gatewayFees || 0);
    const taxes = Math.max(0, params.taxes || 0);
    const adSpend = Math.max(0, params.adSpend || 0);
    const fixedCosts = Math.max(0, params.fixedCosts || 0);

    const directVariableCosts = cogs + gatewayFees + taxes + adSpend;
    const contributionMargin = netRevenue - directVariableCosts;
    const contributionMarginPercent = netRevenue > 0 ? (contributionMargin / netRevenue) * 100 : 0;

    const trueProfit = contributionMargin - fixedCosts;
    const realMarginPercent = grossRevenue > 0 ? (trueProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      refundsAndDiscounts,
      netRevenue,
      cogs,
      gatewayFees,
      taxes,
      adSpend,
      contributionMargin,
      contributionMarginPercent,
      fixedCosts,
      trueProfit,
      realMarginPercent,
    };
  },

  /**
   * Cálculo Canônico de Métricas de Tráfego e Performance
   */
  calculateTraffic(params: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    revenue: number;
  }): TrafficMetrics {
    const impressions = Math.max(0, params.impressions || 0);
    const clicks = Math.max(0, params.clicks || 0);
    const spend = Math.max(0, params.spend || 0);
    const conversions = Math.max(0, params.conversions || 0);
    const revenue = Math.max(0, params.revenue || 0);

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? revenue / spend : 0;

    return {
      impressions,
      clicks,
      spend,
      conversions,
      revenue,
      ctr,
      cpc,
      cpm,
      cpa,
      roas,
    };
  },

  /**
   * Cálculo Canônico de Vendas e Retenção
   */
  calculateSales(params: {
    totalOrders: number;
    paidOrders: number;
    totalCustomers: number;
    grossRevenue: number;
    totalSessions?: number;
  }): SalesMetrics {
    const totalOrders = Math.max(0, params.totalOrders || 0);
    const paidOrders = Math.max(0, params.paidOrders || 0);
    const totalCustomers = Math.max(0, params.totalCustomers || 0);
    const grossRevenue = Math.max(0, params.grossRevenue || 0);
    const totalSessions = Math.max(0, params.totalSessions || 0);

    const effectiveOrders = paidOrders > 0 ? paidOrders : totalOrders;
    const averageTicket = effectiveOrders > 0 ? grossRevenue / effectiveOrders : 0;
    const conversionRate = totalSessions > 0 ? (effectiveOrders / totalSessions) * 100 : 0;
    const ltv = totalCustomers > 0 ? grossRevenue / totalCustomers : 0;

    return {
      totalOrders,
      paidOrders,
      totalCustomers,
      grossRevenue,
      averageTicket,
      conversionRate,
      ltv,
    };
  },

  /**
   * Formatadores Padronizados de Moeda e Números
   */
  formatCurrency(amount: number, currency = "BRL", locale = "pt-BR"): string {
    const normalizedCurrency = currency.toUpperCase();
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  },

  formatPercent(value: number, decimals = 1): string {
    return `${(value || 0).toFixed(decimals).replace(".", ",")}%`;
  },

  formatCompactNumber(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value || 0);
  },

  formatNumber(value: number, decimals = 0): string {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value || 0);
  },
};
