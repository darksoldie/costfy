import { MetricsEngine, type FinancialBreakdown, type TrafficMetrics } from "@/lib/metrics-engine";
import type { Campaign, Order, Product } from "@/lib/business-data";

export interface BrainContext {
  workspaceId: string;
  workspaceName: string;
  businessType?: string;
  currentPage: string;
  activeEntity?: {
    type: "campaign" | "product" | "order" | "utm";
    id: string;
    name: string;
  };
  summary: {
    financials: FinancialBreakdown;
    traffic: TrafficMetrics;
    totalOrders: number;
    totalProducts: number;
    totalCampaigns: number;
  };
}

export interface BrainInsight {
  id: string;
  type: "anomaly" | "opportunity" | "warning" | "trend" | "recommendation";
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  description: string;
  recommendation?: string;
  entityType?: "campaign" | "product" | "financial";
  entityId?: string;
  createdAt: string;
}

export interface BrainActionProposal {
  id: string;
  actionType: "pause_campaign" | "adjust_budget" | "update_cost" | "create_alert";
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  payload: Record<string, unknown>;
  preview: {
    current: string;
    proposed: string;
    impact: string;
  };
  guardrailsPassed: boolean;
}

export const BrainEngine = {
  /**
   * Constrói a leitura de inteligência a partir dos dados REAIS do workspace.
   * Se não houver dados, retorna diagnósticos transparentes sobre a ausência de dados.
   */
  analyzeWorkspace(params: {
    campaigns: Campaign[];
    products: Product[];
    orders: Order[];
    financials: FinancialBreakdown;
    traffic: TrafficMetrics;
  }): {
    insights: BrainInsight[];
    proposals: BrainActionProposal[];
    healthScore: number;
  } {
    const { campaigns, products, orders, financials, traffic } = params;
    const insights: BrainInsight[] = [];
    const proposals: BrainActionProposal[] = [];

    let score = 100;

    // 1. Diagnóstico de Conexão de Dados
    const hasMarketing = campaigns.length > 0 || traffic.spend > 0;
    const hasSales = orders.length > 0 || financials.grossRevenue > 0;

    if (!hasMarketing && !hasSales) {
      return {
        insights: [
          {
            id: "no_data_state",
            type: "recommendation",
            severity: "info",
            title: "Conecte suas primeiras fontes de dados",
            description:
              "O Costfy Brain precisa de dados reais de mídia e de vendas para calcular margem real, ROAS e identificar anomalias.",
            recommendation:
              "Acesse a tela de Integrações ou cadastre suas campanhas e produtos para ativar a leitura automática.",
            createdAt: new Date().toISOString(),
          },
        ],
        proposals: [],
        healthScore: 50,
      };
    }

    // 2. Análise de Margem Real e Lucratividade
    if (financials.grossRevenue > 0) {
      if (financials.realMarginPercent < 15 && financials.realMarginPercent >= 0) {
        score -= 20;
        insights.push({
          id: "low_margin_warning",
          type: "warning",
          severity: "warning",
          title: "Margem Real comprimida",
          description: `Sua margem líquida real está em ${MetricsEngine.formatPercent(
            financials.realMarginPercent,
          )}. Custos diretos (CMV, taxas de gateway e tráfego) estão consumindo a maior parte da receita.`,
          recommendation:
            "Revise as taxas de pagamento configuradas em Financeiro e avalie o custo por aquisição das campanhas ativas.",
          entityType: "financial",
          createdAt: new Date().toISOString(),
        });
      } else if (financials.trueProfit < 0) {
        score -= 40;
        insights.push({
          id: "negative_profit_alert",
          type: "anomaly",
          severity: "critical",
          title: "Operação operando com Lucro Real negativo",
          description: `O investimento total (tráfego + custos fixos + taxas) superou a receita líquida no período em ${MetricsEngine.formatCurrency(
            Math.abs(financials.trueProfit),
          )}.`,
          recommendation:
            "Pause campanhas com ROAS abaixo do ponto de equilíbrio e ajuste os limites de CPA.",
          entityType: "financial",
          createdAt: new Date().toISOString(),
        });
      } else if (financials.realMarginPercent >= 30) {
        insights.push({
          id: "healthy_margin_opportunity",
          type: "opportunity",
          severity: "success",
          title: "Margem operacional saudável",
          description: `Margem real consolidada de ${MetricsEngine.formatPercent(
            financials.realMarginPercent,
          )} com ${MetricsEngine.formatCurrency(financials.trueProfit)} de lucro limpo.`,
          recommendation:
            "Há espaço seguro para escalar o orçamento das campanhas com melhor ROAS.",
          entityType: "financial",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 3. Análise de Tráfego e ROAS
    if (traffic.spend > 0) {
      if (traffic.roas > 0 && traffic.roas < 1.8) {
        score -= 15;
        insights.push({
          id: "low_roas_warning",
          type: "warning",
          severity: "warning",
          title: "ROAS global abaixo do ideal",
          description: `Retorno sobre investimento em tráfego está em ${traffic.roas.toFixed(
            2,
          )}x, próximo ou abaixo do ponto de equilíbrio financeiro.`,
          recommendation:
            "Filtre campanhas com CTR abaixo de 1% para renovação de criativos.",
          entityType: "campaign",
          createdAt: new Date().toISOString(),
        });
      }

      if (traffic.roas >= 3.5) {
        insights.push({
          id: "high_roas_opportunity",
          type: "opportunity",
          severity: "success",
          title: "Eficiência de aquisição alta (ROAS > 3.5x)",
          description: `O tráfego pago gerou ${MetricsEngine.formatCurrency(
            traffic.revenue,
          )} com ${MetricsEngine.formatCurrency(traffic.spend)} investido.`,
          recommendation:
            "Prepare proposta de aumento gradual de orçamento (15-20%) para manter estabilidade do algoritmo.",
          entityType: "campaign",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 4. Análise de Produtos
    const activeProducts = products.filter((p) => p.status === "active");
    if (activeProducts.length > 0) {
      const zeroCostProducts = activeProducts.filter((p) => (p.cost_price || 0) <= 0);
      if (zeroCostProducts.length > 0) {
        insights.push({
          id: "missing_product_costs",
          type: "recommendation",
          severity: "info",
          title: `${zeroCostProducts.length} produto(s) sem custo de mercadoria (CMV) informado`,
          description:
            "Para que o cálculo de Lucro Real e Margem seja 100% exato, informe o custo de produção/compra de cada item.",
          recommendation:
            "Acesse o menu Vendas → Produtos ou Financeiro para calibrar o custo unitário.",
          entityType: "product",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 5. Geração de Propostas de Ações Prontas com Guardrails
    campaigns.forEach((camp) => {
      if (camp.status === "active" && (camp.budget || 0) > 500 && traffic.roas < 1.2 && traffic.spend > 200) {
        proposals.push({
          id: `prop_pause_${camp.id}`,
          actionType: "pause_campaign",
          title: `Pausar campanha "${camp.name}"`,
          description: "Campanha com gasto contínuo e ROAS abaixo da margem de segurança.",
          riskLevel: "medium",
          payload: { campaignId: camp.id, newStatus: "paused" },
          preview: {
            current: "Status: Ativa (Orçamento diário: R$ " + (camp.budget || 0) + ")",
            proposed: "Status: Pausada",
            impact: "Economia estimada de investimento preservando caixa operacional.",
          },
          guardrailsPassed: true,
        });
      }
    });

    return {
      insights,
      proposals,
      healthScore: Math.max(10, Math.min(100, score)),
    };
  },

  /**
   * Responde a perguntas em linguagem natural contextualizadas com os dados reais do workspace.
   */
  respondToPrompt(prompt: string, context: BrainContext): string {
    const text = prompt.toLowerCase();
    const { financials, traffic } = context.summary;

    if (text.includes("como está") || text.includes("visão geral") || text.includes("operação")) {
      if (financials.grossRevenue === 0 && traffic.spend === 0) {
        return `Sua operação no workspace **${context.workspaceName}** ainda não possui dados de vendas ou tráfego registrados. Conecte suas integrações em **Sistema → Integrações** ou lance seus produtos e campanhas para eu iniciar o monitoramento em tempo real.`;
      }
      return `Atualmente no workspace **${context.workspaceName}**, a receita bruta registrada é de **${MetricsEngine.formatCurrency(
        financials.grossRevenue,
      )}**, com investimento em mídia de **${MetricsEngine.formatCurrency(
        traffic.spend,
      )}** e **${MetricsEngine.formatCurrency(
        financials.trueProfit,
      )}** de Lucro Líquido Real (Margem Real de **${MetricsEngine.formatPercent(
        financials.realMarginPercent,
      )}**). O ROAS global está em **${traffic.roas.toFixed(2)}x**.`;
    }

    if (text.includes("lucro") || text.includes("margem") || text.includes("financeiro")) {
      return `O cálculo de Lucro Real separa rigorosamente todas as saídas:\n- **Receita Líquida:** ${MetricsEngine.formatCurrency(
        financials.netRevenue,
      )}\n- **CMV (Custo de Produtos):** ${MetricsEngine.formatCurrency(
        financials.cogs,
      )}\n- **Taxas de Gateway:** ${MetricsEngine.formatCurrency(
        financials.gatewayFees,
      )}\n- **Impostos:** ${MetricsEngine.formatCurrency(
        financials.taxes,
      )}\n- **Investimento em Tráfego:** ${MetricsEngine.formatCurrency(
        financials.adSpend,
      )}\n- **Custos Fixos:** ${MetricsEngine.formatCurrency(
        financials.fixedCosts,
      )}\n\n👉 **Lucro Líquido Real:** **${MetricsEngine.formatCurrency(
        financials.trueProfit,
      )}** (Margem de **${MetricsEngine.formatPercent(financials.realMarginPercent)}**).`;
    }

    if (text.includes("campanha") || text.includes("tráfego") || text.includes("roas") || text.includes("cpa")) {
      if (traffic.spend === 0) {
        return "Nenhum investimento em mídia registrado até o momento. Conecte o Meta Ads, Google Ads ou TikTok Ads em Integrações para obter leituras de CPA, CTR e ROAS por criativo.";
      }
      return `Suas métricas de aquisição consolidadas:\n- **Investimento Total:** ${MetricsEngine.formatCurrency(
        traffic.spend,
      )}\n- **ROAS:** ${traffic.roas.toFixed(2)}x\n- **CPA Médio:** ${MetricsEngine.formatCurrency(
        traffic.cpa,
      )}\n- **CTR Médio:** ${MetricsEngine.formatPercent(
        traffic.ctr,
      )}\n- **Cliques:** ${MetricsEngine.formatNumber(traffic.clicks)}`;
    }

    return `Entendi sua pergunta sobre "${prompt}". O Costfy Brain está monitorando o workspace **${context.workspaceName}** (tela atual: **${context.currentPage}**). Você pode me pedir análises de Lucro Real, desempenho de campanhas, diagnóstico de custos ou recomendações de otimização.`;
  },
};
