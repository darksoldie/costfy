-- ============================================================
-- COSTFY BILLING: UPDATE ANNUAL PLAN PRICING (20% EFFECTIVE DISCOUNT)
-- Migration: 20260903000000_update_plans_annual_discount.sql
-- Description: Updates annual prices for Starter, Growth, and Scale
--              to reflect the approved 20% effective discount over 12 months.
--              Starter: 59,90 * 12 * 0.80 = R$ 575,04 -> R$ 575,00 (57500 centavos)
--              Growth: 149,90 * 12 * 0.80 = R$ 1.439,04 -> R$ 1.439,00 (143900 centavos)
--              Scale: 299,90 * 12 * 0.80 = R$ 2.879,04 -> R$ 2.879,00 (287900 centavos)
-- ============================================================

UPDATE public.plans
SET annual_price = 57500, updated_at = now()
WHERE slug = 'starter';

UPDATE public.plans
SET annual_price = 143900, updated_at = now()
WHERE slug = 'growth';

UPDATE public.plans
SET annual_price = 287900, updated_at = now()
WHERE slug = 'scale';
