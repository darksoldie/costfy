import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  utmLinksQuery,
  trackingSessionsQuery,
  type UtmLink,
  type TrackingSession,
} from "@/lib/business-data";

export interface CreateUtmLinkParams {
  name?: string;
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
}

/**
 * Hook de aplicação e orquestração de dados para a feature Tracking.
 * Encapsula consultas a links UTM e sessões de tráfego, além da mutação
 * para criação de novos links parametrizados com invalidação reativa de cache.
 */
export function useTrackingData(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const { data: utmLinks = [], isLoading: loadingLinks } = useQuery(utmLinksQuery(workspaceId));
  const { data: sessions = [], isLoading: loadingSessions } = useQuery(
    trackingSessionsQuery(workspaceId),
  );

  const createUtmLink = useMutation({
    mutationFn: async (params: CreateUtmLinkParams) => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!params.destinationUrl) throw new Error("Informe uma URL de destino válida");
      if (!params.utmSource || !params.utmCampaign) throw new Error("Preencha Source e Campaign");

      const shortCode = Math.random().toString(36).substring(2, 8);

      const { data, error } = await supabase
        .from("utm_links")
        .insert({
          workspace_id: workspaceId,
          name: params.name?.trim() || `${params.utmSource} - ${params.utmCampaign}`,
          destination_url: params.destinationUrl,
          utm_source: params.utmSource.trim(),
          utm_medium: params.utmMedium.trim(),
          utm_campaign: params.utmCampaign.trim(),
          utm_content: params.utmContent?.trim() || null,
          utm_term: params.utmTerm?.trim() || null,
          short_code: shortCode,
          click_count: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as UtmLink;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["utm-links", workspaceId] });
    },
  });

  return {
    utmLinks,
    loadingLinks,
    sessions,
    loadingSessions,
    createUtmLink,
  };
}
