# COSTFY — CURRENT REPOSITORY & PRODUCT STATE

**Última Atualização:** 02 de Setembro de 2026  
**Status do Build:** ✅ Passando (`tsc --noEmit`: 0 erros; `vite build`: 0 erros)  
**Production Readiness Score Atualizado:** **84 / 100** (evoluído de 72/100 na auditoria)

---

## 1. O Que Está REAL e Operacional

1. **Autenticação & Multi-Tenancy**:
   - Supabase Auth (Email/Senha, Google OAuth, Reset de senha).
   - Isolamento multi-tenant por `workspace_id` com 100% de cobertura RLS.
   - 7 papéis RBAC (`owner`, `admin`, `manager`, `analyst`, `media_buyer`, `finance`, `viewer`).

2. **Metrics Engine Canônico**:
   - `calculateWorkspaceFinancials` unificado para todas as telas.
   - **Zero Fake Data**: Eliminados todos os cálculos presumidos de CMV (`orders.length * 25`), gateway (`3.99%`) e impostos (`6%`).
   - Badges de transparência para dados ainda não cadastrados pelo cliente.

3. **Analytics Dinâmico**:
   - Agrupamento real por canal derivado de `campaigns.platform` e `orders.utm_source`.
   - Filtros por período (7d, 14d, 30d, all).

4. **Tracking Pixel Engine**:
   - Arquivo `public/track.js` compilado e servido estaticamente.
   - Ingestão server-side `/api/track` com persistência em `tracking_sessions` e `tracking_events`.
   - Captura e persistência de first-touch e last-touch UTMs.

5. **Webhook Engine**:
   - Rota `/api/webhooks/:provider?workspace_id=...` conectada no servidor.
   - Adapters para **Hotmart**, **Kiwify** e **Stripe**.
   - Garantia de idempotência por `external_id`.
   - Resolução automática de clientes em `customers`, produtos em `products` e registros em `order_items` e `audit_logs`.

6. **Tela de Integrações Interativa**:
   - Modal com URL de Webhook dinâmica por workspace com botão de cópia.
   - Instruções passo a passo para configuração em cada gateway.

7. **Action Engine**:
   - Resolução correta do UUID do usuário para logs de auditoria (corrigido bug onde `role` era passado).
   - Checagem de guardrails server-side.

---

## 2. O Que Está Parcial / Próximos Passos

1. **Meta Ads & Google Ads OAuth**:
   - Fluxo de autorização OAuth externo direto com a Meta Graph API e Google Ads API.
2. **Automações em Background**:
   - Criação de um Cron / Edge Function para processamento autônomo das regras de `automations` a cada 1 hora.
3. **LLM Conversacional no Brain**:
   - Conexão do Brain com streaming via Gemini / Claude API em Edge Function para responder consultas em linguagem natural aberta além das heurísticas especializadas.
