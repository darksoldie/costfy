# COSTFY — PRODUCT SPECIFICATION

## 1. Positioning

Costfy is the **Intelligent Operating System for Digital Businesses**.
It eliminates operational fragmentation for digital creators, e-commerce founders, media buyers, and infoproduct entrepreneurs.

---

## 2. Core Modules

| Module            | Route                          | Primary Objective                                                                                                                                        | State                          |
| ----------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Dashboard**     | `/_authenticated/dashboard`    | Central operational radar: real-time revenue, spend, true profit, ROAS, CPA, Brain health score.                                                         | Real & Truthful                |
| **Marketing**     | `/_authenticated/marketing`    | Campaign management, budget tracking, media spend and performance KPIs.                                                                                  | Real                           |
| **Sales**         | `/_authenticated/sales`        | Consolidated orders, products, customers, ticket average, and conversion rates.                                                                          | Real (Webhook + Manual)        |
| **Finance & DRE** | `/_authenticated/finance`      | Cascading managerial DRE: Gross Revenue → Net Revenue → Variable Costs (CMV, Gateway, Taxes, Traffic) → Contribution Margin → Fixed Costs → True Profit. | Real & Truthful                |
| **Tracking**      | `/_authenticated/tracking`     | UTM Link Builder, visitor session tracking, universal tracking script tag.                                                                               | Real (Pixel + Ingestion)       |
| **Analytics**     | `/_authenticated/analytics`    | Multidimensional cross-analysis: channel attribution, campaigns, and product performance.                                                                | Real & Dynamic                 |
| **Costfy Brain**  | `/_authenticated/brain`        | Contextual AI copilot, workspace diagnostics, health score, and actionable proposals.                                                                    | Real & Heuristic               |
| **Automations**   | `/_authenticated/automations`  | Configurable rules (Trigger → Condition → Action) with safety guardrails.                                                                                | Real (Config & Storage)        |
| **Reports**       | `/_authenticated/reports`      | Executive and managerial reports with native print/PDF export.                                                                                           | Real                           |
| **Audit Logs**    | `/_authenticated/audit`        | Comprehensive activity log tracking actors (user, integration, brain).                                                                                   | Real                           |
| **Integrations**  | `/_authenticated/integrations` | Connects external checkout and ad providers with real webhook URLs.                                                                                      | Real (Hotmart, Kiwify, Stripe) |
| **Team & RBAC**   | `/_authenticated/team`         | Workspace team members and granular roles (Owner, Admin, Manager, etc.).                                                                                 | Real                           |
| **Settings**      | `/_authenticated/settings`     | Workspace parameters, base currency, and profile configuration.                                                                                          | Real                           |

---

## 3. Product Rules of Engagement

1. **Zero Fake Data**:
   - Under no circumstances shall metrics or charts simulate data that is not backed by workspace records.
   - When no data exists, display dedicated empty states guiding the user to connect integrations or create records.
2. **Truthful Product**:
   - Explicitly communicate configuration gaps (e.g. unconfigured taxes or unconfigured product costs) without guessing arbitrary percentages.
3. **Auditability**:
   - All mutations through automated engines (Action Engine, Webhook Engine) must register an audit log entry.
