# COSTFY — DEVELOPMENT & ENGINEERING RULES

## 1. Zero Fake Data Rule (Master Rule 51)

- Never inject simulated metrics, fake campaign stats, artificial revenue or hardcoded percentages (e.g. `cogs = orders.length * 25`).
- If an entity or cost is missing from the workspace, evaluate to `0` and present clear UI guidance on how the user can configure it.
- Trustworthiness is the paramount asset of Costfy.

---

## 2. Multi-Tenancy & Data Isolation (Master Rule 06)

- Every query must strictly filter by `workspace_id`.
- Never disable or bypass PostgreSQL Row-Level Security (RLS) in client code.
- Admin client (`supabaseAdmin`) is restricted exclusively to server-side webhook and tracking ingestion routes.

---

## 3. Metrics Engine as Single Source of Truth (Master Rule 08)

- No component or route shall compute True Profit, ROAS, CPA, Margins, or Conversion Rate independently.
- Always invoke `MetricsEngine.calculateWorkspaceFinancials`, `MetricsEngine.calculateTraffic`, or `MetricsEngine.calculateSales`.

---

## 4. Idempotency & Webhooks (Master Rule 12 & 26)

- External mutations and incoming webhooks must verify idempotency keys (`external_id`).
- Under no circumstances may an identical transaction create duplicate order rows or duplicate revenue.

---

## 5. Living Documentation & Continuous Validation (Master Rule 03 & 64)

- Prior to completing any phase:
  1. Run TypeScript strict typecheck (`tsc --noEmit`).
  2. Run production build (`npm run build`).
  3. Keep `ARCHITECTURE.md`, `PRODUCT_SPEC.md`, `DECISIONS.md`, `CURRENT_STATE.md`, and `PRODUCTION_AUDIT.md` updated.
