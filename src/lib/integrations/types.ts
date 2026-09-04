/**
 * COSTFY INTEGRATIONS DOMAIN TYPES & ADAPTER CONTRACT
 * Padrão estruturado de integrações para Mídia, Vendas, Pagamentos e Infoprodutos.
 */

export type IntegrationCategory = "media" | "sales" | "payments" | "infoproducts";

export type IntegrationAuthType = "oauth" | "webhook" | "credentials";

export type NormalizedConnectionState =
  | "NOT_CONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "SYNCING"
  | "ERROR"
  | "DISCONNECTED";

export interface IntegrationAccount {
  id: string;
  name: string;
  currency?: string;
  timezone?: string;
  status?: string;
}

export interface IntegrationCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "archived" | "draft";
  dailyBudget?: number;
  lifetimeBudget?: number;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  syncedAt: string;
  details?: string;
}

export interface IntegrationAdapter {
  readonly provider: string;
  readonly name: string;
  readonly category: IntegrationCategory;
  readonly authType: IntegrationAuthType;
  readonly description: string;
  readonly docsUrl?: string | undefined;

  /** Lista variáveis de ambiente obrigatórias no servidor para funcionamento real */
  getRequiredServerEnvs(): string[];

  /** Gera a URL de início do fluxo de autorização OAuth real */
  getAuthUrl(params: { workspaceId: string; redirectUri: string; state?: string }): string;

  /** Instruções passo a passo para configuração pelo operador */
  getSetupInstructions(webhookUrl?: string): string[];
}
