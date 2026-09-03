# COSTFY — SYSTEM ARCHITECTURE

## 1. High-Level Vision

Costfy is the **Intelligent Operating System for Digital Businesses**.
It bridges raw operational data across Marketing, Sales, Finance, Tracking, and Intelligence into a single canonical engine:

```
RAW EXTERNAL DATA (APIs / Webhooks / Pixel)
       ↓
NORMALIZED INGESTION (WebhookEngine / TrackingHandler)
       ↓
PERSISTENT RELATIONAL SCHEMA (Supabase Postgres + RLS)
       ↓
METRICS ENGINE (Canonical Math: True Profit, ROAS, CPA, Margins)
       ↓
OPERATIONAL PRODUCTS (Dashboard, Marketing, Sales, Finance, Analytics)
       ↓
COSTFY BRAIN (Contextual Diagnostics, Health Score, Guardrailed Actions)
```

---

## 2. Technology Stack

- **Framework**: TanStack Start (React 19 + Vite 8 + Nitro)
- **Routing**: TanStack Router (File-based, Type-safe)
- **State & Data Fetching**: TanStack Query (QueryOptions, Optimistic Caching)
- **Styling & Design System**: Tailwind CSS v4 + Radix UI primitives
- **Database & Auth**: Supabase PostgreSQL 15 + Supabase Auth
- **Multi-Tenancy & Security**: Row-Level Security (RLS) + RBAC (`has_workspace_permission`)
- **Server Infrastructure**: Cloudflare Worker module via Nitro

---

## 3. Core Subsystems

### 3.1 Metrics Engine (`src/lib/metrics-engine.ts`)

- The single source of truth for all mathematical financial and marketing indicators.
- Base Profit Formula:
  $$\text{Real Profit} = \text{Net Revenue} - (\text{CMV} + \text{Gateway Fees} + \text{Taxes} + \text{Ad Spend}) - \text{Fixed Costs}$$
- **Zero Fake Data Policy**: Unconfigured variables evaluate to 0 with explicit UI transparency alerts, preventing synthetic inflation of margins or false sense of security.

### 3.2 Tracking Subsystem (`public/track.js` + `src/server/tracking-handler.ts`)

- Lightweight universal JavaScript pixel.
- Manages first-touch and last-touch UTM persistence (`costfy_first_touch`, `costfy_last_touch`).
- Ingests visitor sessions and page/conversion events into `public.tracking_sessions` and `public.tracking_events`.
- Server handler validates `workspace_id` and records sessions via `supabaseAdmin`.

### 3.3 Webhook Engine (`src/server/webhook-engine.ts` + `src/server/webhook-handler.ts`)

- Ingestion endpoint: `/api/webhooks/:provider?workspace_id=:id`.
- Supported Adapters:
  - **Hotmart**: `PURCHASE_APPROVED`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, `PURCHASE_CANCELED`.
  - **Kiwify**: `paid`, `refunded`, `chargedback`, `canceled`, `waiting_payment`.
  - **Stripe**: `checkout.session.completed`, `charge.refunded`, disputes.
- Guarantees:
  - **Strict Idempotency**: Evaluates `external_id` against `orders`. Status transitions are audited; duplicates are rejected.
  - **Customer Resolution**: Links or creates customer in `public.customers`.
  - **Product & Item Resolution**: Links or creates product in `public.products` and logs items in `public.order_items`.
  - **Audit Logging**: Every incoming webhook execution is recorded in `public.audit_logs`.

### 3.4 Action Engine (`src/lib/action-engine.ts`)

- Human-in-the-loop operational mutations.
- Validates guardrails (e.g. maximum budget adjustments).
- Resolves authentic user UUIDs for immutable audit logs.

### 3.5 Brain Intelligence Layer (`src/lib/brain-engine.ts`)

- Analyzes aggregated operational metrics from `MetricsEngine`.
- Generates deterministic health scores (0-100) and prioritized diagnostic insights.
