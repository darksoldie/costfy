import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { type FinancialEntry } from "@/lib/business-data";

export interface CreateFixedCostParams {
  name: string;
  category: string;
  amount: number;
}

export interface CreateFinancialEntryParams {
  description: string;
  type: FinancialEntry["type"];
  category: string;
  amount: number;
}

/**
 * Hook de mutações financeiras (Custos Fixos e Lançamentos Avulsos).
 * Encapsula inserções no Supabase e invalidação de cache do TanStack Query.
 */
export function useFinanceMutations(workspaceId: string | null, baseCurrency = "BRL") {
  const queryClient = useQueryClient();

  const createFixedCost = useMutation({
    mutationFn: async ({ name, category, amount }: CreateFixedCostParams) => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!name.trim()) throw new Error("Informe o nome do custo");
      if (!amount || amount <= 0) throw new Error("Informe o valor");

      const { data, error } = await supabase
        .from("fixed_costs")
        .insert({
          workspace_id: workspaceId,
          name: name.trim(),
          category,
          amount,
          currency: baseCurrency,
          start_date: new Date().toISOString().slice(0, 10),
          active: true,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fixed-costs", workspaceId] });
    },
  });

  const createEntry = useMutation({
    mutationFn: async ({ description, type, category, amount }: CreateFinancialEntryParams) => {
      if (!workspaceId) throw new Error("Workspace não selecionado");
      if (!description.trim()) throw new Error("Informe a descrição");
      if (!amount || amount <= 0) throw new Error("Informe o valor");

      const { data, error } = await supabase
        .from("financial_entries")
        .insert({
          workspace_id: workspaceId,
          description: description.trim(),
          type,
          category,
          amount,
          amount_base_currency: amount,
          currency: baseCurrency,
          entry_date: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["financial-entries", workspaceId] });
    },
  });

  return {
    createFixedCost,
    createEntry,
  };
}
