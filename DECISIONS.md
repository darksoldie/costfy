# COSTFY — ARCHITECTURAL & PRODUCT DECISIONS (ADR)

## ADR-001: Strict TypeScript Types Synchronization

- **Date**: 2026-09-02
- **Context**: The database migration `20260902030000_brain_automations_foundation.sql` introduced 7 new tables (`automations`, `automation_runs`, `brain_conversations`, `brain_messages`, `brain_insights`, `brain_actions`, `notifications`), but `src/integrations/supabase/types.ts` was not synced, causing typecheck failures in `tsc --noEmit`.
- **Decision**: Manually updated `src/integrations/supabase/types.ts` with complete definitions for all 7 tables and 5 enums. Fixed index signature access in `action-engine.ts`.
- **Consequence**: Strict type checking (`npx tsc --noEmit`) now succeeds with 0 errors.

---

## ADR-002: Elimination of Hardcoded Estimates in Financial Calculations (Zero Fake Data)

- **Date**: 2026-09-02
- **Context**: Several views (`finance.tsx`, `dashboard.tsx`, `reports.tsx`, `brain.tsx`, `analytics.tsx`) calculated CMV as `orders.length * 25`, gateway fees as `3.99%`, and taxes as `6%`.
- **Decision**: Created `calculateWorkspaceFinancials` in `MetricsEngine`. If product item costs (`order_items`), gateway fees (`gateway_fees`), or taxes (`taxes`) are not configured in the workspace, they evaluate to `0`, and UI badges explicitly inform the user that these parameters have not been registered yet.
- **Consequence**: Decisions are grounded in authentic figures without deceiving users.

---

## ADR-003: Dynamic Channel Attribution in Analytics

- **Date**: 2026-09-02
- **Context**: `analytics.tsx` applied a fixed distribution (65% Meta Ads, 35% Google Ads, 10% Organic) to total spend and revenue.
- **Decision**: Replaced the static distribution with real aggregation: campaigns grouped by platform provide channel spend, and orders grouped by `utm_source` provide channel revenue and orders.
- **Consequence**: Truthful cross-channel analysis based on real campaign platforms and order UTM tags.

---

## ADR-004: Ingestion Layer for Webhooks and Universal Pixel

- **Date**: 2026-09-02
- **Context**: Customers could not automatically receive orders from checkouts or track visitors from external domains due to unauthenticated visitor access to Supabase RLS.
- **Decision**:
  1. Created `public/track.js` client pixel.
  2. Implemented `/api/track` in `src/server/tracking-handler.ts` using `supabaseAdmin`.
  3. Implemented `/api/webhooks/:provider` in `src/server/webhook-handler.ts` and `src/server/webhook-engine.ts` with adapters for Hotmart, Kiwify, and Stripe, strictly enforcing idempotency and customer/product/item synchronization.
- **Consequence**: Immediate capability to receive orders and track visitor sessions from external websites and checkouts.
