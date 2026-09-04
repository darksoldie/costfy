import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/components/app/workspace-context';
import {
  ordersQuery,
  campaignsQuery,
  productsQuery,
  fixedCostsQuery,
  financialEntriesQuery,
  orderItemsQuery,
  gatewayFeesQuery,
  taxesQuery,
  adMetricsDailyQuery,
} from '@/lib/business-data';

/**
 * Hook that centralizes all data fetching needed by the Finance feature.
 * Returns raw query results (defaulted to empty arrays) together with the active workspace.
 */
export function useFinanceQueries() {
  const { active } = useWorkspace();
  const workspaceId = active?.workspace.id ?? null;

  const { data: orders = [] } = useQuery(ordersQuery(workspaceId));
  const { data: campaigns = [] } = useQuery(campaignsQuery(workspaceId));
  const { data: products = [] } = useQuery(productsQuery(workspaceId));
  const { data: fixedCosts = [] } = useQuery(fixedCostsQuery(workspaceId));
  const { data: entries = [] } = useQuery(financialEntriesQuery(workspaceId));
  const { data: orderItems = [] } = useQuery(orderItemsQuery(workspaceId));
  const { data: gatewayFees = [] } = useQuery(gatewayFeesQuery(workspaceId));
  const { data: taxes = [] } = useQuery(taxesQuery(workspaceId));
  const { data: adMetrics = [] } = useQuery(adMetricsDailyQuery(workspaceId));

  return {
    active,
    workspaceId,
    orders,
    campaigns,
    products,
    fixedCosts,
    entries,
    orderItems,
    gatewayFees,
    taxes,
    adMetrics,
  };
}
