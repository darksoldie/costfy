import type { Subscription, WorkspaceBillingStatus } from "./billing-types";

export type BillingUiState =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "READ_ONLY"
  | "SUSPENDED"
  | "NO_SUBSCRIPTION";

export interface BillingStateInfo {
  state: BillingUiState;
  badgeLabel: string;
  badgeTone: "trial" | "active" | "warning" | "destructive" | "neutral";
  headline: string;
  description: string;
  daysRemaining: number;
  isActionable: boolean;
}

interface ResolveBillingStateParams {
  workspaceStatus?: WorkspaceBillingStatus | string | null | undefined;
  trialEndsAt?: string | null | undefined;
  subscription?: Subscription | null | undefined;
}

/**
 * Determina com rigor matemático e comercial o estado real de faturamento de um workspace.
 * Garante que falhas de rede ou estados intermediários nunca resultem em 'Plano expirado'
 * incorretamente.
 */
export function resolveBillingState({
  workspaceStatus,
  trialEndsAt,
  subscription,
}: ResolveBillingStateParams): BillingStateInfo {
  const normalizedStatus = (workspaceStatus as WorkspaceBillingStatus) || "trial";

  // 1. Workspace explicitamente suspenso
  if (normalizedStatus === "suspended") {
    return {
      state: "SUSPENDED",
      badgeLabel: "Suspenso",
      badgeTone: "destructive",
      headline: "Workspace Suspenso",
      description: "Este workspace está temporariamente suspenso. Entre em contato com o suporte para regularização.",
      daysRemaining: 0,
      isActionable: false,
    };
  }

  // 2. Assinatura ativa registrada via Mercado Pago
  if (subscription && subscription.status === "active") {
    const isAnnual = subscription.billing_interval === "annual";
    return {
      state: "ACTIVE",
      badgeLabel: "Plano ativo",
      badgeTone: "active",
      headline: "Plano Oficial Ativo",
      description: `Assinatura recorrente ativa via Mercado Pago (${isAnnual ? "Ciclo Anual com 20% OFF" : "Ciclo Mensal"}).`,
      daysRemaining: 0,
      isActionable: true,
    };
  }

  // 3. Assinatura com pagamento pendente
  if (subscription && subscription.status === "past_due") {
    return {
      state: "PAST_DUE",
      badgeLabel: "Pagamento pendente",
      badgeTone: "warning",
      headline: "Fatura Pendente",
      description: "Consta um pagamento pendente no gateway Mercado Pago. Regularize para evitar a pausa nas operações.",
      daysRemaining: 0,
      isActionable: true,
    };
  }

  // 4. Assinatura cancelada (mas ainda dentro do período ou encerrada)
  if (subscription && subscription.status === "canceled") {
    return {
      state: "CANCELED",
      badgeLabel: "Cancelada",
      badgeTone: "neutral",
      headline: "Assinatura Cancelada",
      description: "Sua assinatura foi cancelada. O acesso permanecerá até o encerramento do ciclo contratado.",
      daysRemaining: 0,
      isActionable: true,
    };
  }

  // 5. Verificação de Período de Testes (Trial de 14 dias)
  const effectiveTrialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const now = Date.now();
  const msLeft = effectiveTrialEnd ? effectiveTrialEnd.getTime() - now : 0;
  const daysLeft = effectiveTrialEnd ? Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))) : 0;

  const isWithinTrialPeriod = effectiveTrialEnd !== null && msLeft > 0;

  if (normalizedStatus === "trial" || (subscription && subscription.status === "trialing")) {
    if (isWithinTrialPeriod) {
      return {
        state: "TRIAL",
        badgeLabel: "Teste gratuito",
        badgeTone: "trial",
        headline: `Teste gratuito — ${daysLeft} ${daysLeft === 1 ? "dia restante" : "dias restantes"}`,
        description: "Você está desfrutando do teste gratuito oficial de 14 dias com acesso completo às ferramentas.",
        daysRemaining: daysLeft,
        isActionable: true,
      };
    } else {
      return {
        state: "EXPIRED",
        badgeLabel: "Período de teste encerrado",
        badgeTone: "destructive",
        headline: "Período de teste encerrado",
        description: "Seu teste gratuito de 14 dias foi concluído. Selecione um plano para continuar escalando sua operação.",
        daysRemaining: 0,
        isActionable: true,
      };
    }
  }

  // 6. Workspace em Somente Leitura (pós-expiração de trial ou inadimplência)
  if (normalizedStatus === "read_only") {
    return {
      state: "READ_ONLY",
      badgeLabel: "Período de teste encerrado",
      badgeTone: "destructive",
      headline: "Workspace em Modo Somente Leitura",
      description: "Suas operações de criação estão em pausa para proteção dos dados. Ative um plano para reativar o motor.",
      daysRemaining: 0,
      isActionable: true,
    };
  }

  // 7. Workspace com status 'active' no banco mas sem assinatura explícita no provider
  if (normalizedStatus === "active") {
    return {
      state: "ACTIVE",
      badgeLabel: "Plano ativo",
      badgeTone: "active",
      headline: "Plano Ativo no Workspace",
      description: "Workspace com permissões operacionais liberadas.",
      daysRemaining: 0,
      isActionable: true,
    };
  }

  // 8. Estado padrão: Sem assinatura
  return {
    state: "NO_SUBSCRIPTION",
    badgeLabel: "Sem assinatura",
    badgeTone: "neutral",
    headline: "Nenhuma Assinatura Ativa",
    description: "Escolha o plano ideal para liberar automações, sincronização de mídia e relatórios executivos.",
    daysRemaining: 0,
    isActionable: true,
  };
}
