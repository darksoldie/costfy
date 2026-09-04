import type {
  IntegrationAdapter,
  IntegrationCategory,
  IntegrationAuthType,
  NormalizedConnectionState,
} from "./types";

/**
 * Adapter oficial Meta Ads (Facebook / Instagram Marketing API)
 */
export class MetaAdsAdapter implements IntegrationAdapter {
  readonly provider = "meta_ads";
  readonly name = "Meta Ads";
  readonly category: IntegrationCategory = "media";
  readonly authType: IntegrationAuthType = "oauth";
  readonly description = "Conexão oficial com Meta Graph API para sincronização de contas de anúncios, campanhas, conjuntos, criativos e métricas de ROAS.";
  readonly docsUrl = "https://developers.facebook.com/docs/marketing-apis/";

  getRequiredServerEnvs(): string[] {
    return ["META_APP_ID", "META_APP_SECRET"];
  }

  getAuthUrl(params: { workspaceId: string; redirectUri: string; state?: string }): string {
    const appId = typeof window !== "undefined" ? (window as any).__COSTFY_META_APP_ID__ || "" : "";
    const scopes = ["ads_read", "read_insights", "business_management"].join(",");
    const stateObj = JSON.stringify({ workspaceId: params.workspaceId, provider: "meta_ads" });
    const encodedState = encodeURIComponent(stateObj);

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      params.redirectUri,
    )}&scope=${encodeURIComponent(scopes)}&state=${encodedState}&response_type=code`;
  }

  getSetupInstructions(): string[] {
    return [
      "Acesse o Meta for Developers (developers.facebook.com) e crie ou selecione um App do tipo 'Business'.",
      "Adicione o produto 'Marketing API' ao aplicativo.",
      "Configure a URL de Redirecionamento OAuth com o domínio do seu Costfy.",
      "Adicione as variáveis META_APP_ID e META_APP_SECRET nas configurações de ambiente do servidor.",
      "Conceda permissão às Contas de Anúncio e clique em Conectar.",
    ];
  }
}

/**
 * Adapter oficial Google Ads API (Search, PMax, YouTube, Display)
 */
export class GoogleAdsAdapter implements IntegrationAdapter {
  readonly provider = "google_ads";
  readonly name = "Google Ads";
  readonly category: IntegrationCategory = "media";
  readonly authType: IntegrationAuthType = "oauth";
  readonly description = "Conexão com a Google Ads API v16+ para leitura contínua de campanhas, impressões, cliques, conversões e custos consolidados.";
  readonly docsUrl = "https://developers.google.com/google-ads/api/docs/first-call/overview";

  getRequiredServerEnvs(): string[] {
    return ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_DEVELOPER_TOKEN"];
  }

  getAuthUrl(params: { workspaceId: string; redirectUri: string; state?: string }): string {
    const clientId = typeof window !== "undefined" ? (window as any).__COSTFY_GOOGLE_CLIENT_ID__ || "" : "";
    const scope = "https://www.googleapis.com/auth/adwords";
    const stateObj = JSON.stringify({ workspaceId: params.workspaceId, provider: "google_ads" });
    const encodedState = encodeURIComponent(stateObj);

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      params.redirectUri,
    )}&response_type=code&scope=${encodeURIComponent(
      scope,
    )}&access_type=offline&prompt=consent&state=${encodedState}`;
  }

  getSetupInstructions(): string[] {
    return [
      "Acesse o Google Cloud Console e ative a Google Ads API no seu projeto.",
      "Gere as credenciais OAuth 2.0 (Client ID e Client Secret para aplicativo web).",
      "Solicite e configure o Developer Token oficial no painel do Google Ads Manager (MCC).",
      "Insira as variáveis GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET e GOOGLE_ADS_DEVELOPER_TOKEN no servidor.",
      "Inicie o fluxo de consentimento clicando em Conectar.",
    ];
  }
}

/**
 * Adapter oficial TikTok Ads (TikTok for Business)
 */
export class TikTokAdsAdapter implements IntegrationAdapter {
  readonly provider = "tiktok_ads";
  readonly name = "TikTok Ads";
  readonly category: IntegrationCategory = "media";
  readonly authType: IntegrationAuthType = "oauth";
  readonly description = "Conexão com TikTok Marketing API para acompanhamento de anúncios, métricas de vídeo, engajamento e custo por conversão.";
  readonly docsUrl = "https://business-api.tiktok.com/portal/docs";

  getRequiredServerEnvs(): string[] {
    return ["TIKTOK_APP_ID", "TIKTOK_APP_SECRET"];
  }

  getAuthUrl(params: { workspaceId: string; redirectUri: string; state?: string }): string {
    const appId = typeof window !== "undefined" ? (window as any).__COSTFY_TIKTOK_APP_ID__ || "" : "";
    const stateObj = JSON.stringify({ workspaceId: params.workspaceId, provider: "tiktok_ads" });
    const encodedState = encodeURIComponent(stateObj);

    return `https://business-api.tiktok.com/portal/auth?app_id=${appId}&state=${encodedState}&redirect_uri=${encodeURIComponent(
      params.redirectUri,
    )}`;
  }

  getSetupInstructions(): string[] {
    return [
      "Crie um aplicativo no TikTok for Business Developer Portal.",
      "Habilite as permissões de Reporting e Ads Management.",
      "Cadastre o redirect URI autorizado nas configurações do aplicativo.",
      "Defina TIKTOK_APP_ID e TIKTOK_APP_SECRET no ambiente do servidor.",
      "Execute a autenticação para mapear as contas de anunciante.",
    ];
  }
}

/**
 * Adapter oficial Mercado Pago (VENDAS DO CLIENTE / Gateway de Loja)
 * ATENÇÃO: Estritamente separado do Billing do Costfy.
 */
export class MercadoPagoSalesAdapter implements IntegrationAdapter {
  readonly provider = "mercadopago";
  readonly name = "Mercado Pago (Vendas)";
  readonly category: IntegrationCategory = "payments";
  readonly authType: IntegrationAuthType = "webhook";
  readonly description = "Ingestão em tempo real de pedidos, pagamentos Pix, cartão e boletos da loja do cliente para DRE consolidada e métricas de conversão.";
  readonly docsUrl = "https://www.mercadopago.com.br/developers/pt/docs/webhooks";

  getRequiredServerEnvs(): string[] {
    return [];
  }

  getAuthUrl(): string {
    return "";
  }

  getSetupInstructions(webhookUrl?: string): string[] {
    return [
      "Acesse o painel Mercado Pago Developers (mercadopago.com.br/developers/panel).",
      "Selecione 'Suas Aplicações' e entre na aplicação da sua loja ou crie uma nova.",
      "No menu lateral esquerdo, clique em 'Notificações Webhooks'.",
      `Cadastre a URL exclusiva do seu workspace: ${webhookUrl || "URL_DO_SEU_WEBHOOK"}.`,
      "Marque os eventos: Pagamentos ('payment.created', 'payment.updated') e Pedidos de Venda.",
      "Salve as configurações para que todos os pedidos aprovados reflitam imediatamente nas Vendas e DRE.",
    ];
  }
}

/**
 * Adapters genéricos de Ingestão de Vendas via Webhook
 */
export class WebhookSalesAdapter implements IntegrationAdapter {
  constructor(
    readonly provider: string,
    readonly name: string,
    readonly category: IntegrationCategory,
    readonly description: string,
    private readonly customSteps: string[],
    readonly docsUrl?: string,
  ) {}

  readonly authType: IntegrationAuthType = "webhook";

  getRequiredServerEnvs(): string[] {
    return [];
  }

  getAuthUrl(): string {
    return "";
  }

  getSetupInstructions(webhookUrl?: string): string[] {
    return this.customSteps.map((step) =>
      step.replace("{{WEBHOOK_URL}}", webhookUrl || "URL_DO_WEBHOOK"),
    );
  }
}

// Catálogo Mestre Ordenado conforme prioridade oficial
export const INTEGRATION_REGISTRY: Record<string, IntegrationAdapter> = {
  meta_ads: new MetaAdsAdapter(),
  google_ads: new GoogleAdsAdapter(),
  tiktok_ads: new TikTokAdsAdapter(),
  mercadopago: new MercadoPagoSalesAdapter(),
  hotmart: new WebhookSalesAdapter(
    "hotmart",
    "Hotmart",
    "infoproducts",
    "Integração nativa com Hotmart para ingestão automática de vendas, reembolsos e cancelamentos com identificação de SKU e comissões.",
    [
      "Acesse Ferramentas > Webhook (Notificações) no painel da Hotmart.",
      "Clique em 'Cadastrar Webhook' e cole a URL do seu workspace: {{WEBHOOK_URL}}.",
      "Selecione todos os eventos: Compra Aprovada, Cancelada, Reclamada e Reembolso.",
      "Defina a versão da API como 2.0.0 e clique em Salvar.",
    ],
    "https://developers.hotmart.com/",
  ),
  kiwify: new WebhookSalesAdapter(
    "kiwify",
    "Kiwify",
    "infoproducts",
    "Ingestão imediata de pedidos, status de pagamento e atribuição de campanhas via Webhook oficial da Kiwify.",
    [
      "Acesse o menu Apps > Webhooks no seu painel da Kiwify.",
      "Clique em 'Criar Webhook' e preencha um nome de identificação (ex: Costfy).",
      "Cole a URL gerada: {{WEBHOOK_URL}}.",
      "Marque todos os eventos de pedidos (Aprovado, Reembolsado, Chargeback).",
      "Salve para sincronizar todas as transações instantaneamente.",
    ],
  ),
  eduzz: new WebhookSalesAdapter(
    "eduzz",
    "Eduzz",
    "infoproducts",
    "Integração de checkout Eduzz para importação em tempo real de vendas e cálculo de margem líquida por oferta.",
    [
      "Acesse o painel da Eduzz > Avançado > Webhooks / Notificações.",
      "Adicione um novo endpoint e insira a URL do Costfy: {{WEBHOOK_URL}}.",
      "Selecione 'Fatura Paga', 'Fatura Cancelada' e 'Reembolso'.",
      "Confirme o cadastro do webhook.",
    ],
  ),
  monetizze: new WebhookSalesAdapter(
    "monetizze",
    "Monetizze",
    "infoproducts",
    "Conexão via Postback oficial da Monetizze para rastreio de conversões e atualização da DRE.",
    [
      "Acesse Ferramentas > Postback na sua conta Monetizze.",
      "Adicione a URL do Webhook do seu workspace: {{WEBHOOK_URL}}.",
      "Selecione os produtos desejados e marque as notificações de transação aprovada e chargeback.",
      "Clique em Salvar Postback.",
    ],
  ),
  shopify: new WebhookSalesAdapter(
    "shopify",
    "Shopify",
    "sales",
    "Webhook oficial da Shopify para ingestão de pedidos de e-commerce, itens de pedido (SKU), frete e impostos.",
    [
      "No painel administrativo da Shopify, acesse Configurações > Notificações > Webhooks.",
      "Clique em 'Criar webhook'.",
      "Evento: 'Criação de pedido' (Order creation) e formato JSON.",
      "Cole a URL do seu workspace: {{WEBHOOK_URL}}.",
      "Repita para 'Atualização de pedido' (Order update).",
    ],
  ),
  cartpanda: new WebhookSalesAdapter(
    "cartpanda",
    "Cartpanda",
    "sales",
    "Integração de pedidos e pagamentos Cartpanda com atribuição de UTMs e tags de rastreamento.",
    [
      "Acesse Configurações > Webhooks no painel Cartpanda.",
      "Cadastre a URL do Costfy: {{WEBHOOK_URL}}.",
      "Ative as notificações para pedidos pagos, cancelados e reembolsados.",
    ],
  ),
  yampi: new WebhookSalesAdapter(
    "yampi",
    "Yampi",
    "sales",
    "Ingestão de pedidos do Checkout Transparente Yampi com dados completos de faturamento e taxas.",
    [
      "Acesse Configurações > Webhooks no painel Yampi.",
      "Adicione um novo webhook informando a URL: {{WEBHOOK_URL}}.",
      "Selecione os eventos de status do pedido e finalize o salvamento.",
    ],
  ),
  stripe: new WebhookSalesAdapter(
    "stripe",
    "Stripe",
    "payments",
    "Conexão com Stripe Webhook para vendas internacionais, cartões de crédito e assinaturas digitais.",
    [
      "Acesse Developers > Webhooks no dashboard da Stripe.",
      "Clique em 'Add destination' e informe a URL: {{WEBHOOK_URL}}.",
      "Selecione os eventos 'checkout.session.completed', 'charge.refunded', 'payment_intent.succeeded'.",
      "Salve o endpoint para receber confirmações instantâneas de pagamento.",
    ],
    "https://stripe.com/docs/webhooks",
  ),
};

export function normalizeIntegrationStatus(rawStatus?: string | null): NormalizedConnectionState {
  if (!rawStatus) return "NOT_CONNECTED";
  const s = rawStatus.toLowerCase();
  if (s === "connected") return "CONNECTED";
  if (s === "connecting") return "CONNECTING";
  if (s === "syncing") return "SYNCING";
  if (s === "error") return "ERROR";
  if (s === "paused" || s === "disconnected") return "DISCONNECTED";
  return "NOT_CONNECTED";
}
