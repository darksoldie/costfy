import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { campaignsQuery, type Campaign, type CampaignStatus } from "@/lib/business-data";

export interface CreateCampaignParams {
  name: string;
  platform: string;
  budget: number;
  currency: string;
  objective: string;
}

/**
 * Hook de aplicação e orquestração de dados para Marketing.
 * Encapsula consultas e mutações no Supabase com invalidação reativa de cache.
 */
export function useMarketingCampaigns(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading, error } = useQuery(campaignsQuery(workspaceId));

  const createCampaign = useMutation({
    mutationFn: async ({ name, platform, budget, currency, objective }: CreateCampaignParams) => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!name.trim()) throw new Error("Informe o nome da campanha");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          workspace_id: workspaceId,
          name: name.trim(),
          platform,
          budget,
          currency,
          objective,
          status: "active",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: CampaignStatus }) => {
      const nextStatus: CampaignStatus = currentStatus === "active" ? "paused" : "active";
      const { error } = await supabase
        .from("campaigns")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, budget }: { id: string; budget: number }) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ budget })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
    },
  });

  return {
    campaigns,
    isLoading,
    error,
    createCampaign,
    toggleStatus,
    deleteCampaign,
    updateBudget,
  };
}
