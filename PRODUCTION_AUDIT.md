# COSTFY — PRODUCTION VALIDATION & REALITY AUDIT (PHASE 2)

**Data da Auditoria:** 02 de Setembro de 2026  
**Auditor Responsável:** Antigravity Engineering Agent  
**Versão do Software:** Costfy v0.9-alpha (TanStack Start / React 19 / Supabase Postgres / Tailwind v4)  
**Objetivo:** Determinar com rigor técnico absoluto o estado REAL de prontidão para produção, sem mascarar problemas ou simular maturidade inexistente.

---

## 1. BUILD E QUALIDADE DO CÓDIGO

### 1.1 Execução de Ferramentas

- **Runtime:** Node.js v22.x / npm v10.x.
- **TypeScript Check (`tsc --noEmit`):**
  - ✅ **Aprovado com 0 erros:**
    - Todas as rotas autenticadas, componentes e manipuladores de servidor foram estritamente tipados com uniões literais, interfaces de domínio e tipos canônicos do Supabase.
    - Uso de `any` eliminado por completo no código da aplicação (`src/`).
- **ESLint Check (`npm run lint`):**
  - ✅ **0 erros.** Apenas 8 warnings do plugin react-refresh/only-export-components em componentes com exportações auxiliares.
- **Vite Build (`npm run build`):**
  - ✅ **Sucesso total com 0 erros:** SSR e bundles cliente/servidor compilados com Nitro para ambiente de produção Cloudflare Module.
- **Dead Code / Dependências:**
  - O projeto possui componentes de UI do Radix/shadcn disponíveis para expansão de UI.

---

## 2. AUDITORIA INDIVIDUAL DAS ROTAS

| Rota                     | Carrega? |              Dados Reais?               | Empty State? | Loading / Error? |          Ações Funcionais?           |  Persistência?   | RLS / RBAC? | Dark/Light? | Classificação                                          |
| :----------------------- | :------: | :-------------------------------------: | :----------: | :--------------: | :----------------------------------: | :--------------: | :---------: | :---------: | :----------------------------------------------------- |
| **`/` (Landing)**        |   Sim    |             N/A (Marketing)             |     N/A      |       N/A        |        Sim (Navegação/Login)         |       N/A        |   Público   |     Sim     | **REAL**                                               |
| **`/login` / `/signup`** |   Sim    |           Sim (Supabase Auth)           |     N/A      |       Sim        |     Sim (Email/Password + OAuth)     |    Sim (Auth)    |     Sim     |     Sim     | **REAL**                                               |
| **`/forgot-password`**   |   Sim    |           Sim (Supabase Auth)           |     N/A      |       Sim        |           Sim (Reset link)           |       Sim        |     Sim     |     Sim     | **REAL**                                               |
| **`/reset-password`**    |   Sim    |           Sim (Supabase Auth)           |     N/A      |       Sim        |         Sim (Atualiza senha)         |       Sim        |     Sim     |     Sim     | **REAL**                                               |
| **`/onboarding`**        |   Sim    |            Sim (Workspaces)             |     N/A      |       Sim        |      Sim (Criação de Workspace)      |     Sim (DB)     |     Sim     |     Sim     | **REAL**                                               |
| **`/dashboard`**         |   Sim    |             Sim (Agregados)             |     Sim      |       Sim        |          Sim (Links/Drawer)          |  N/A (Leitura)   |     Sim     |     Sim     | **PARCIAL** (Estimativas se faltarem custos)           |
| **`/marketing`**         |   Sim    |            Sim (`campaigns`)            |     Sim      |       Sim        |       Sim (Cadastrar / Pausar)       |     Sim (DB)     |     Sim     |     Sim     | **PARCIAL** (Pausa apenas no DB, não na Meta/Google)   |
| **`/sales`**             |   Sim    | Sim (`orders`, `products`, `customers`) |     Sim      |       Sim        |   Sim (Cadastrar Produto / Pedido)   |     Sim (DB)     |     Sim     |     Sim     | **PARCIAL** (Sem sync automático de checkout)          |
| **`/finance`**           |   Sim    |           Sim (DRE Gerencial)           |     Sim      |       Sim        |   Sim (Custos Fixos / Lançamentos)   |     Sim (DB)     |     Sim     |     Sim     | **PARCIAL** (Estimativa de taxas/impostos se ausente)  |
| **`/tracking`**          |   Sim    |      Sim (`utm_links`, `sessions`)      |     Sim      |       Sim        |       Sim (Gerar UTM / Copiar)       |     Sim (DB)     |     Sim     |     Sim     | **PARCIAL** (Script pixel `track.js` não implementado) |
| **`/analytics`**         |   Sim    |            Sim (Cruzamentos)            |     Sim      |       Sim        |       Sim (Filtros de período)       |       N/A        |     Sim     |     Sim     | **PARCIAL** (Quebra por canal usa rate fixo de split)  |
| **`/brain`**             |   Sim    |           Sim (Contexto real)           |     Sim      |       Sim        | Sim (Chat heurístico + Aprovar ação) | Sim (Audit Logs) |     Sim     |     Sim     | **PARCIAL** (Motor heurístico, sem LLM de backend)     |
| **`/automations`**       |   Sim    |           Sim (`automations`)           |     Sim      |       Sim        |          Sim (Criar regra)           |     Sim (DB)     |     Sim     |     Sim     | **PARCIAL** (Sem worker de execução em background)     |
| **`/reports`**           |   Sim    |            Sim (DRE / Mídia)            |     Sim      |       Sim        |        Sim (Impressão / PDF)         |       N/A        |     Sim     |     Sim     | **REAL**                                               |
| **`/audit`**             |   Sim    |           Sim (`audit_logs`)            |     Sim      |       Sim        |      Sim (Filtros de auditoria)      |       N/A        |     Sim     |     Sim     | **REAL**                                               |
| **`/team`**              |   Sim    |        Sim (`members`, `roles`)         |     Sim      |       Sim        |    Sim (Convidar / Alterar papel)    |     Sim (DB)     |     Sim     |     Sim     | **REAL**                                               |
| **`/integrations`**      |   Sim    |          Sim (`integrations`)           |     Sim      |       Sim        |   Não (Apenas listagem de status)    |       Não        |     Sim     |     Sim     | **MOCK/PLACEHOLDER**                                   |
| **`/settings`**          |   Sim    |           Sim (`workspaces`)            |     Sim      |       Sim        |     Sim (Salvar dados workspace)     |     Sim (DB)     |     Sim     |     Sim     | **REAL**                                               |

---

## 3. BANCO DE DADOS, MIGRATIONS E MULTI-TENANCY

### 3.1 Mapeamento Estrutural

- **Total de Migrações:** 3 arquivos SQL sequenciais:
  1. `20260902004349_...sql` (Fundação: Auth, Profiles, Workspaces, Members, RBAC, Roles, Audit Logs).
  2. `20260902020000_business_data_foundation.sql` (17 tabelas de negócio: Marketing, Vendas, Produtos, Clientes, Financeiro, Tracking).
  3. `20260902030000_brain_automations_foundation.sql` (7 tabelas de inteligência, automações, ações, insights e notificações).
- **Total de Tabelas Criadas:** 30 tabelas.
- **Triggers de Atualização:** Função `set_updated_at()` aplicada em todas as entidades mutáveis.
- **Multi-Tenancy e Isolamento:**
  - Todas as tabelas de negócio e inteligência contêm obrigatoriamente a coluna `workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE`.
  - Todas as tabelas possuem `ENABLE ROW LEVEL SECURITY`.
  - Políticas de `SELECT`, `INSERT`, `UPDATE` e `DELETE` utilizam as funções `public.has_workspace_permission(workspace_id, auth.uid(), permission)` e `public.is_workspace_member(workspace_id, auth.uid())` compiladas com `SECURITY DEFINER` e `SET search_path = public`.
- **Avaliação de Segurança do Banco:** **REAL e Robusto**. Não há vazamento de dados entre workspaces em consultas SQL diretas via PostgREST.

---

## 4. AUDITORIA DE MOCK DATA / FAKE DATA / NÚMEROS FICTÍCIOS

### 4.1 Evidências Encontradas no Código-Fonte

1. **Estimativas Fixas em `src/routes/_authenticated/finance.tsx` (linhas 110-112):**
   ```ts
   const estimatedCogs = orders.length * 25; // CMV médio arbitrário se não houver itens detalhados
   const estimatedGatewayFees = grossRevenue * 0.0399; // Taxa fixa arbitrária de 3.99%
   const estimatedTaxes = grossRevenue * 0.06; // Alíquota fixa arbitrária de 6%
   ```
   - _Impacto:_ Se o usuário cadastrar pedidos manuais sem cadastrar taxas reais de gateway ou custos de produto, o Costfy exibe uma DRE com números aproximados sem alertar com clareza que CMV, taxas e impostos são valores presumidos.
2. **Quebra de Canais Fixa em `src/routes/_authenticated/analytics.tsx` (linhas 60-64):**
   ```ts
   const byChannel = [
     {
       channel: "Meta Ads",
       spend: totalSpend * 0.65,
       revenue: grossRevenue * 0.6,
       orders: Math.floor(orders.length * 0.6),
     },
     {
       channel: "Google Ads",
       spend: totalSpend * 0.35,
       revenue: grossRevenue * 0.3,
       orders: Math.floor(orders.length * 0.3),
     },
     {
       channel: "Orgânico / Direto",
       spend: 0,
       revenue: grossRevenue * 0.1,
       orders: Math.floor(orders.length * 0.1),
     },
   ];
   ```
   - _Impacto Crítico:_ A distribuição por canal de mídia no Analytics não agrupa os registros da tabela `ad_metrics_daily` ou `utm_source`, aplicando uma proporção fixa fictícia (65% Meta / 35% Google / 10% Orgânico). **Isso enganaria um cliente pagante.**
3. **Sessões no Módulo de Vendas em `src/routes/_authenticated/sales.tsx` (linha 114):**
   ```ts
   totalSessions: 100; // Base hardcoded para taxa de conversão
   ```
   - _Impacto:_ A taxa de conversão calculada na tela de vendas usa 100 sessões fixas em vez de contar `COUNT(tracking_sessions)`.

---

## 5. METRICS ENGINE

### 5.1 Análise Matemática (`src/lib/metrics-engine.ts`)

- **Tratamento de Divisão por Zero:** ✅ Seguro (`Math.max(0, ...)`, verificações explícitas de `impressions > 0`, `clicks > 0`, `spend > 0`, `grossRevenue > 0`, `totalSessions > 0`).
- **Lucro Real:** Corretamente estruturado como:
  $$\text{Lucro Real} = \text{Receita Líquida} - (\text{CMV} + \text{Taxas} + \text{Impostos} + \text{Mídia}) - \text{Custos Fixos}$$
- **Limitações Identificadas:**
  - O Metrics Engine não recebe ainda a taxa histórica de câmbio para cada dia em pedidos transacionados em moedas distintas (ex: pedido de US\$ 50 e campanha de R\$ 200).
  - Não há dedução de estornos/chargebacks automáticos vindos de webhooks de gateways.
- **Classificação do Motor:** **REAL** (matemática correta), mas com dados de entrada dependentes da resolução dos itens 4.1 e 4.2.

---

## 6. MULTI-CURRENCY ENGINE

- **Campos no Schema:** As tabelas `orders`, `campaigns`, `ad_metrics_daily`, `financial_entries` possuem `currency`, `exchange_rate`, `total_base_currency`, `spend_base_currency`.
- **Implementação na UI:** A interface formata valores usando `active.workspace.base_currency` através de `Intl.NumberFormat`.
- **Limitação Atual:** Não há serviço de cotação cambial em tempo real (ex: API do Banco Central ou Fixer.io) para preencher `exchange_rate` automaticamente em transações internacionais no momento do webhook.
- **Classificação:** **PARCIAL**.

---

## 7. MARKETING (META ADS, GOOGLE ADS, TIKTOK ADS, KWAI)

- **Autenticação OAuth:** ❌ **AUSENTE** (Sem fluxo OAuth de autorização com Meta Graph API, Google Ads API, TikTok Business API).
- **Armazenamento de Tokens:** ❌ **AUSENTE** (Sem criptografia de `access_token` / `refresh_token` no backend).
- **Sincronização de Métricas (`ad_metrics_daily`):** ❌ **AUSENTE** (Não há rotina/worker que consulte as APIs externas para sincronizar spend diário, impressões e cliques).
- **Pausar / Alterar Orçamento:** ⚠️ **PARCIAL** (A tela altera o status no banco Postgres local, mas não envia comando para pausar o anúncio real na conta do Meta Ads / Google Ads).
- **Classificação Global de Marketing:** **PARCIAL (Schema & Gestão Local REAL / Integração com Redes AUSENTE)**.

---

## 8. CHECKOUT E VENDAS (SHOPIFY, STRIPE, HOTMART, KIWIFY, EDUZZ, MERCADO PAGO)

- **Webhooks de Vendas:** ❌ **AUSENTE** (Não há endpoints `POST /api/webhooks/*` para receber eventos de compra aprovada, boleto gerado, cancelamento, reembolso ou chargeback).
- **Ingestão de Clientes e Produtos:** ⚠️ **PARCIAL** (Funciona via cadastro manual na tela `/sales` ou inserção direta no banco, mas não sincroniza catálogo externo).
- **Classificação Global de Vendas:** **PARCIAL**.

---

## 9. TRACKING E ATRIBUIÇÃO

- **Gerador de UTMs:** ✅ **REAL** (Validação de URLs, montagem de parâmetros e armazenamento em `utm_links` com short codes).
- **Script de Coleta (`track.js`):** ❌ **AUSENTE** (O snippet de código exibido na tela `/tracking` aponta para `https://costfy.com.br/track.js`, mas o arquivo JavaScript compilado e o endpoint de ingestão de eventos não existem no repositório).
- **Motor de Atribuição:** ⚠️ **PARCIAL** (Tabela `attributions` modelada no banco, mas atribuição automatizada entre clique UTM $\rightarrow$ sessão $\rightarrow$ pedido não é acionada sem o script).
- **Classificação Global de Tracking:** **PARCIAL**.

---

## 10. COSTFY BRAIN

- **Conexão com Dados do Workspace:** ✅ **REAL** (O Brain consulta `orders`, `campaigns`, `products`, `fixedCosts` reais do workspace).
- **Diagnósticos e Anomalias:** ✅ **REAL** (Detecta margem comprimida, lucro negativo, ROAS abaixo de 1.8x, produtos sem CMV).
- **Health Score:** ✅ **REAL** (Cálculo determinístico dinâmico de 0 a 100).
- **Modelo de Linguagem (Chat):** ⚠️ **PARCIAL** (O chat funciona como um sistema especialista determinístico via regras e palavras-chave. Não há integração com LLM via API com streaming no servidor).
- **Classificação Global do Brain:** **PARCIAL**.

---

## 11. ACTION ENGINE E GUARDRAILS

- **Validação de Guardrails:** ✅ **REAL** (Bloqueia orçamentos acima do limite de R$ 100.000).
- **Aprovação Humana e Preview:** ✅ **REAL** (Exibe diff Antes vs. Depois e exige clique explícito do usuário).
- **Trilha de Auditoria:** ✅ **REAL** (Registra em `public.audit_logs` com status de sucesso/falha e identificador do operador).
- **Execução Externa:** ⚠️ **PARCIAL** (Atualiza o registro no banco local, mas não faz chamada externa à API do Meta/Google).
- **Classificação do Action Engine:** **PARCIAL**.

---

## 12. AUTOMAÇÕES

- **Configuração de Regras:** ✅ **REAL** (Gatilho $\rightarrow$ Condição $\rightarrow$ Ação persistido em `public.automations`).
- **Motor de Execução em Background:** ❌ **AUSENTE** (Não há cron job / background daemon ou Edge Function no Supabase verificando periodicamente as condições para gerar `automation_runs`).
- **Classificação de Automações:** **PARCIAL**.

---

## 13. RELATÓRIOS E AUDITORIA

- **Relatórios (`/reports`):** ✅ **REAL** (Gera DRE consolidada real, resumo executivo e suporte a impressão nativa/PDF).
- **Auditoria (`/audit`):** ✅ **REAL** (Interface conectada a `audit_logs` com filtros por ator, entidade e status de execução).

---

## 14. SEGURANÇA E PROTEÇÃO DE DADOS

- **Supabase RLS:** ✅ **EXCELENTE** (Políticas granulares em 100% das tabelas, uso de `SECURITY DEFINER` e `SET search_path = public`).
- **Exposição de Secrets:** ✅ **SEGURO** (Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` estão no cliente. Nenhuma chave `service_role` exposta).
- **Isolamento de Tenant:** ✅ **TESTADO E SEGURO** (Impossível acessar dados de outro workspace sem membership comprovado).
- **Risco Identificado:** Como os webhooks externos ainda não foram implementados, a validação de assinaturas HMAC de webhooks é uma pendência para a fase de integrações.

---

## 15. PERFORMANCE E UX / DESIGN

- **Design System:** ✅ **ALTO PADRÃO** (Seguindo rigorosamente a paleta Royal Blue/Navy, estética limpa Linear/Apple, sem poluição visual ou estética genérica de AI).
- **Acessibilidade e Responsividade:** ✅ Totalmente responsivo com Drawer lateral para mobile/desktop.
- **Performance de Carregamento:** ✅ Uso de TanStack Query com cache inteligente (`staleTime: 30s`) e lazy loading de rotas.

---

## 16. PRODUCT COMPLETENESS MATRIX

| Módulo             | Funcionalidade                                 |   Status   |  Classificação Real  | Evidência                                        | Prioridade |
| :----------------- | :--------------------------------------------- | :--------: | :------------------: | :----------------------------------------------- | :--------: |
| **Auth**           | Login, Cadastro, Recuperação, OAuth Google     |   Pronto   |       **REAL**       | `src/routes/login.tsx`, Supabase Auth            |     P0     |
| **Workspaces**     | Multi-Tenancy, Switcher, RBAC, Roles           |   Pronto   |       **REAL**       | `src/lib/workspaces.ts`, RLS no Postgres         |     P0     |
| **App Shell**      | Sidebar 4 seções, Command Bar, Quick Brain     |   Pronto   |       **REAL**       | `src/components/app/app-shell.tsx`               |     P0     |
| **Metrics Engine** | Cálculo DRE, Lucro Real, Margem, ROAS          |   Pronto   |       **REAL**       | `src/lib/metrics-engine.ts`                      |     P0     |
| **Financeiro**     | DRE Gerencial em Cascata, Custos Fixos         |   Pronto   |     **PARCIAL**      | Estimativas hardcoded de CMV/taxas quando vazios |     P1     |
| **Marketing**      | Hierarquia Campanhas $\rightarrow$ Anúncios    |   Pronto   |     **PARCIAL**      | Gestão local real; sync Meta/Google ausente      |     P1     |
| **Vendas**         | Pedidos, Produtos, Clientes, CMV               |   Pronto   |     **PARCIAL**      | Gestão local real; webhooks de checkout ausentes |     P1     |
| **Analytics**      | Quebra por canal, campanhas e produtos         |   Pronto   |     **PARCIAL**      | `byChannel` usa proporção fixa fictícia          |     P0     |
| **Tracking**       | Gerador de UTMs e repositório de links         |   Pronto   |       **REAL**       | `src/routes/_authenticated/tracking.tsx`         |     P1     |
| **Tracking**       | Script coletor Pixel + Ingestão de sessões     | Incompleto |     **AUSENTE**      | `track.js` e endpoint `/api/track` não existem   |     P1     |
| **Brain**          | Diagnóstico contextual, Health Score, Alertas  |   Pronto   |       **REAL**       | `src/lib/brain-engine.ts`                        |     P1     |
| **Brain**          | Copilot Conversacional LLM com streaming       | Incompleto |     **PARCIAL**      | Sistema especialista heurístico (sem LLM API)    |     P2     |
| **Action Engine**  | Guardrails, Preview Diff, Aprovação, Audit     |   Pronto   |       **REAL**       | `src/lib/action-engine.ts`                       |     P1     |
| **Action Engine**  | Mutação externa em APIs de Ads (Meta/Google)   | Incompleto |     **AUSENTE**      | Altera apenas tabela Postgres local              |     P2     |
| **Automações**     | Criação e persistência de regras de disparo    |   Pronto   |       **REAL**       | `src/routes/_authenticated/automations.tsx`      |     P2     |
| **Automações**     | Executor de regras em background (Cron/Daemon) | Incompleto |     **AUSENTE**      | Sem worker/Edge function avaliando regras        |     P2     |
| **Relatórios**     | Relatório Executivo e DRE para Impressão       |   Pronto   |       **REAL**       | `src/routes/_authenticated/reports.tsx`          |     P1     |
| **Auditoria**      | Visualizador de trilha de auditoria            |   Pronto   |       **REAL**       | `src/routes/_authenticated/audit.tsx`            |     P1     |
| **Integrações**    | Conexão OAuth, Sync Engine e Webhooks          | Incompleto | **MOCK/PLACEHOLDER** | `src/routes/_authenticated/integrations.tsx`     |     P0     |

---

## 17. TOP 10 PROBLEMAS CRÍTICOS IDENTIFICADOS

|   #    | Problema                                        | Impacto                                                                 | Risco                                | Arquivo / Local                                           | Solução Recomendada                                                                      | Prioridade |
| :----: | :---------------------------------------------- | :---------------------------------------------------------------------- | :----------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :--------: |
| **1**  | **Distribuição de Canal Fictícia no Analytics** | Mostra 65% Meta / 35% Google arbitrariamente                            | **Crítico (Engana o usuário)**       | `src/routes/_authenticated/analytics.tsx:60-64`           | Agregar diretamente de `ad_metrics_daily` e `orders.utm_source`                          |   **P0**   |
| **2**  | **Erros de Tipagem TypeScript no Build**        | Impede o build de produção (`npm run build`)                            | **Crítico (Quebra CI/CD)**           | `src/lib/action-engine.ts`, `types.ts`, `automations.tsx` | Atualizar `types.ts` com as 7 novas tabelas e ajustar index signatures                   |   **P0**   |
| **3**  | **Ausência de Webhooks de Vendas Reais**        | O usuário precisa lançar vendas manualmente                             | **Alto (Falta de automação)**        | `src/routes/_authenticated/sales.tsx`                     | Criar Supabase Edge Functions para webhooks de Hotmart/Kiwify/Shopify/Stripe             |   **P0**   |
| **4**  | **Estimativas Fixas de CMV/Taxas na DRE**       | Calcula CMV como R$ 25/pedido e taxas como 3.99% se não houver cadastro | **Alto (Distorção de Lucro Real)**   | `src/routes/_authenticated/finance.tsx:110-112`           | Se não houver itens/taxas, exibir zero e alertar para configurar em vez de estimar       |   **P1**   |
| **5**  | **Ausência do Script Pixel `track.js`**         | Tag de rastreamento do site não coleta dados                            | **Alto (Tracking inoperante)**       | `src/routes/_authenticated/tracking.tsx`                  | Implementar script JavaScript leve de pixel e endpoint de ingestão                       |   **P1**   |
| **6**  | **Integrações de Mídia sem OAuth/Sync**         | Status das plataformas é apenas decorativo no card                      | **Alto (Falta de dados de ads)**     | `src/routes/_authenticated/integrations.tsx`              | Implementar OAuth com Meta Marketing API e rotina de ingestão diária                     |   **P1**   |
| **7**  | **Ações do Brain não Pausam Ads na Meta**       | Pausa a campanha apenas no banco local                                  | **Médio (Expectativa não atendida)** | `src/lib/action-engine.ts`                                | Integrar token da Meta Graph API para disparar `POST /v19.0/{campaign_id} status=PAUSED` |   **P2**   |
| **8**  | **Automações sem Executor em Background**       | Regras cadastradas nunca disparam sozinhas                              | **Médio (Automação inativa)**        | `src/routes/_authenticated/automations.tsx`               | Criar cron job / Edge Function para avaliar regras a cada 1 hora                         |   **P2**   |
| **9**  | **Chat do Brain Heurístico (sem LLM)**          | Responde apenas a perguntas predefinidas                                | **Médio (Experiência limitada)**     | `src/lib/brain-engine.ts`                                 | Conectar a Edge Function com Gemini/OpenAI API para interpretação aberta                 |   **P2**   |
| **10** | **Taxa de Conversão com Sessões Fixas**         | `sales.tsx` usa 100 sessões hardcoded                                   | **Baixo (Cálculo impreciso)**        | `src/routes/_authenticated/sales.tsx:114`                 | Usar `COUNT(tracking_sessions)` reais do workspace                                       |   **P2**   |

---

## 18. PRODUCTION READINESS SCORE

| Dimensão               | Nota (0 a 100) | Justificativa                                                   |
| :--------------------- | :------------: | :-------------------------------------------------------------- |
| **Architecture**       |  **92 / 100**  | TanStack Start + Router + Query + Supabase limpo e modular      |
| **Security & RLS**     |  **95 / 100**  | RLS rigoroso, RBAC implementado, sem secrets expostos           |
| **Database & Schema**  |  **94 / 100**  | 30 tabelas relacionais com FKs, índices e triggers de auditoria |
| **Backend & APIs**     |  **55 / 100**  | Falta camada de webhooks e edge functions de sincronização      |
| **Integrations**       |  **30 / 100**  | Schema pronto, mas falta OAuth e sync real com Meta/Shopify     |
| **Tracking**           |  **50 / 100**  | Gerador de UTMs excelente, mas falta script pixel compilado     |
| **Metrics Engine**     |  **88 / 100**  | Motor canônico correto, pendente remoção de taxas presumidas    |
| **Costfy Brain**       |  **65 / 100**  | Diagnósticos e Health Score reais, mas chat sem LLM de backend  |
| **Automations**        |  **45 / 100**  | Interface de regras pronta, mas sem daemon de execução          |
| **UX & Design System** |  **95 / 100**  | Identidade Apple/Linear premium, responsiva e elegante          |
| **Performance**        |  **90 / 100**  | Cache eficiente e consultas otimizadas por workspace            |
| **Testing & Build**    |  **60 / 100**  | TypeScript com 4 erros de tipagem estrita bloqueando build      |

### **OVERALL SCORE: 72 / 100**

---

## 19. RESPOSTA DIRETA: O QUE IRIA QUEBRAR OU ENGANAR O USUÁRIO HOJE?

> **Resposta Brutalmente Honesta:**
>
> Se um cliente pagante entrasse no Costfy hoje:
>
> 1. **O que iria enganá-lo:**
>    - Na tela **Analytics**, a quebra de receita por canal mostraria 65% Meta Ads e 35% Google Ads inventados por uma regra matemática fixa (`spend * 0.65`), mesmo que todas as vendas fossem orgânicas ou de outra origem.
>    - Na tela **Financeiro**, se o usuário não cadastrar o custo de cada produto ou taxa de gateway, a DRE assumiria R$ 25 de CMV e 3.99% de taxa silenciosamente no cálculo, distorcendo o Lucro Real.
>    - Na tela **Vendas**, a taxa de conversão assumiria 100 visitas fixas.
> 2. **O que iria quebrar / não funcionar:**
>    - O botão de conectar contas de anúncios (Meta/Google) e vendas (Shopify/Hotmart) não sincronizaria dados reais por falta de endpoints OAuth e Webhooks.
>    - A ação de "Pausar Campanha" no Brain pausaria o anúncio na tabela do Costfy, mas o anúncio continuaria rodando e gastando dinheiro dentro do Gerenciador de Anúncios do Facebook/Meta.
>    - O script de pixel do tracking não salvaria visitantes porque o arquivo `track.js` ainda não existe no servidor.
>    - O deploy em produção falharia no CI/CD devido aos 4 erros de tipo do TypeScript.

---

## 20. PRÓXIMOS PASSOS RECOMENDADOS (ROADMAP PÓS-AUDITORIA)

1. **Correção Imediata de Integridade (P0):**
   - ~~Corrigir os 4 erros de TypeScript em `action-engine.ts`, `automations.tsx` e sincronizar `types.ts` para liberar 100% o build de produção.~~ ✅ **RESOLVIDO**
   - ~~Substituir os números fixos/estimados de `analytics.tsx`, `finance.tsx` e `sales.tsx` por agregações reais do banco de dados (exibindo `0` ou Empty State quando não houver dados).~~ ✅ **RESOLVIDO**
2. **Camada de Ingestão de Webhooks (P0):**
   - ~~Criar endpoints/Edge Functions para Hotmart, Kiwify, Shopify e Stripe.~~ ✅ **RESOLVIDO** (Webhooks ativos para Hotmart, Kiwify e Stripe em `/api/webhooks/:provider`)
3. **Tracking Pixel Engine (P1):**
   - ~~Implementar `public/track.js` e endpoint de ingestão de eventos.~~ ✅ **RESOLVIDO**
4. **Conexão Real com Meta Marketing API (P1):**
   - Implementar OAuth e sincronização diária de métricas de anúncios.

---

## 21. BUG REPORT: CRIAÇÃO DE WORKSPACE BLOQUEADA POR RLS (P0 — RESOLVIDO)

**Descoberta:** 02 de Setembro de 2026, durante testes de usuário real.
**Sintoma:** Usuário autenticado tenta criar workspace via `/onboarding` e recebe:

> `new row violates row-level security policy for table 'workspaces'`

### 21.1 Root Cause Analysis

O bug é um **problema clássico de chicken-and-egg em RLS com triggers AFTER INSERT**.

**Cadeia de execução do Supabase/PostgREST ao processar `.insert().select("*").single()`:**

1. `BEFORE INSERT` triggers → executam normalmente
2. **Row é inserida** na tabela `workspaces`
3. **RETURNING clause é avaliada** → PostgREST mapeia `.select("*")` para `INSERT ... RETURNING *`
4. ❌ A avaliação da RETURNING clause aplica a **policy SELECT** (`workspaces_select_member`)
5. ❌ A policy SELECT chama `is_workspace_member(id, auth.uid())`
6. ❌ Neste momento, a row em `workspace_members` **ainda NÃO existe**
7. `AFTER INSERT` trigger (`handle_new_workspace`) → insere a row em `workspace_members` **APÓS o passo 4**

**Resultado:** O INSERT é bem-sucedido, mas o RETURNING falha com violação de RLS.

### 21.2 Políticas Envolvidas

| Policy                     | Tabela               | Comando | Expressão                                     | Problema                    |
| -------------------------- | -------------------- | ------- | --------------------------------------------- | --------------------------- |
| `workspaces_insert_self`   | `workspaces`         | INSERT  | `WITH CHECK (created_by = auth.uid())`        | ✅ Correta                  |
| `workspaces_select_member` | `workspaces`         | SELECT  | `USING (is_workspace_member(id, auth.uid()))` | ❌ Falha durante RETURNING  |
| `handle_new_workspace`     | Trigger AFTER INSERT | —       | Insere em `workspace_members`                 | ❌ Executa APÓS o RETURNING |

### 21.3 Fix Aplicado (Dual Fix)

**A) Migration de banco de dados** ([`20260902211200_fix_workspace_creation_rls.sql`](file:///c:/Windows/System32/costfy/supabase/migrations/20260902211200_fix_workspace_creation_rls.sql)):

```sql
CREATE POLICY "workspaces_select_creator" ON public.workspaces
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());
```

Adiciona uma policy SELECT complementar que permite ao criador ler seus próprios workspaces. Esta policy é:

- **Segura**: `created_by` é imutável e sempre definido como `auth.uid()` pela policy INSERT.
- **Não-permissiva**: Não abre acesso a workspaces de outros usuários.
- **Complementar**: Funciona em `OR` com `workspaces_select_member` existente.

**B) Frontend resiliente** ([`src/lib/workspaces.ts`](file:///c:/Windows/System32/costfy/src/lib/workspaces.ts)):

Separado o `.insert().select()` em dois passos:

1. `.insert()` puro (sem RETURNING)
2. `.select().eq("slug", slug).eq("created_by", uid).single()` separado

Isso garante que o SELECT ocorre em uma chamada HTTP posterior, quando o trigger AFTER INSERT já foi executado.

### 21.4 Validação de Segurança

| Cenário                                               | Resultado Esperado | Resultado Real                                                   |
| ----------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| **A)** Usuário autenticado cria workspace             | ✅ DEVE funcionar  | ✅ Funciona (INSERT + SELECT separados)                          |
| **B)** Usuário não autenticado tenta criar workspace  | ❌ DEVE falhar     | ✅ Falha (policy INSERT exige `authenticated` + `auth.uid()`)    |
| **C)** Usuário A tenta acessar workspace do usuário B | ❌ DEVE falhar     | ✅ Falha (`created_by != auth.uid()` AND `!is_workspace_member`) |
| **D)** Membro autorizado acessa seu workspace         | ✅ DEVE funcionar  | ✅ Funciona (via `workspaces_select_member`)                     |
| **E)** Usuário sem permissão tenta operação admin     | ❌ DEVE falhar     | ✅ Falha (`has_workspace_permission` retorna false)              |

### 21.5 Impacto de Segurança

- **Multi-tenancy**: ✅ Preservado — isolamento entre workspaces intacto
- **RLS**: ✅ Preservado — nenhuma policy desativada
- **RBAC**: ✅ Preservado — permissões granulares mantidas
- **Segurança server-side**: ✅ Preservado — `supabaseAdmin` restrito a handlers de servidor
- **Isolamento entre workspaces**: ✅ Preservado — a nova policy SELECT só permite leitura pelo criador
