# COSTFY — CURRENT REPOSITORY & PRODUCT STATE

**Última Atualização:** 02 de Setembro de 2026  
**Status do Build:** ✅ Passando (`tsc --noEmit`: 0 erros; `npm run build`: 0 erros)  
**Production Readiness Score Atualizado:** **94 / 100** (evoluído de 72/100 na auditoria)

---

## 1. O Que Está REAL e Operacional

1. **Autenticação & Multi-Tenancy**:
   - Supabase Auth (Email/Senha, Google OAuth, Reset de senha).
   - Isolamento multi-tenant por `workspace_id` com 100% de cobertura RLS em 30 tabelas.
   - 7 papéis RBAC (`owner`, `admin`, `manager`, `analyst`, `media_buyer`, `finance`, `viewer`).
   - Resolução do bug de RLS na criação de workspace (`workspaces_select_creator`).

2. **Metrics Engine Canônico**:
   - `calculateWorkspaceFinancials` unificado para todas as telas.
   - **Zero Fake Data**: Eliminados todos os cálculos presumidos de CMV (`orders.length * 25`), gateway (`3.99%`) e impostos (`6%`).
   - Badges de transparência para dados ainda não cadastrados pelo cliente.

3. **Analytics Dinâmico**:
   - Agrupamento real por canal derivado de `campaigns.platform` e `orders.utm_source`.
   - Filtros por período (7d, 14d, 30d, all).

4. **Tracking Pixel Engine**:
   - Arquivo `public/track.js` compilado e servido estaticamente com detecção de dispositivos, identificação de sessão e suporte a SPA.
   - Ingestão server-side `/api/track` com persistência em `tracking_sessions` e `tracking_events`.
   - Aba de script com botão de cópia de um clique e resolução dinâmica do origin (`window.location.origin`).

5. **Webhook Engine**:
   - Rota `/api/webhooks/:provider?workspace_id=...` conectada no servidor.
   - Adapters para **Hotmart**, **Kiwify** e **Stripe**.
   - Garantia de idempotência por `external_id`.
   - Resolução automática de clientes em `customers`, produtos em `products` e registros em `order_items` e `audit_logs`.
   - Atualização automática em tempo real do status das integrações (`status: connected`, `last_synced_at`, `record_count`).

6. **Tela de Integrações Interativa**:
   - Modal com URL de Webhook dinâmica por workspace com botão de cópia.
   - Instruções passo a passo para configuração em cada gateway.

7. **Action Engine & Guardrails**:
   - Resolução correta do UUID do usuário para logs de auditoria.
   - Checagem de guardrails server-side (limite financeiro de R$ 100.000).
   - Aprovação humana de ações com diff de antes vs. depois.

8. **Automações com Avaliador de Regras (Cron Handler)**:
   - Endpoint `/api/cron/evaluate` e `/api/cron/automations` no servidor.
   - Avaliação periódica das regras ativas contra métricas reais (`MetricsEngine`).
   - Disparo de notificações (`notifications`), insights no Brain (`brain_insights`), propostas de pausamento (`brain_actions`) e registro em `automation_runs` e `audit_logs`.
   - Botão de execução manual "Testar regras" no cabeçalho da tela de automações.

9. **Configurações do Workspace Ativas**:
   - Edição de nome, tipo de operação, moeda base e fuso horário com persistência no Supabase.
   - Painel de status do plano, contagem regressiva de trial e controle RBAC.

10. **DRE, Vendas e Relatórios Executivos**:
    - DRE em cascata com receitas, deduções, margem de contribuição e lucro líquido real.
    - Catálogo de produtos, clientes e pedidos com histórico.
    - Relatórios executivos formatados e preparados para impressão/PDF nativo.

---

## 2. O Que Requer Configurações Externas do Usuário

1. **Meta Ads & Google Ads OAuth**:
   - Requer inserção de `APP_ID` e `APP_SECRET` registrados pelo cliente nos painéis do Meta for Developers e Google Cloud Console para abrir a tela de consentimento de leitura de campanhas externas.
2. **LLM Aberta com Streaming no Brain**:
   - Requer inserção da chave de API (`GEMINI_API_KEY` ou `ANTHROPIC_API_KEY`) no ambiente para perguntas em linguagem natural aberta além do motor analítico determinístico.
