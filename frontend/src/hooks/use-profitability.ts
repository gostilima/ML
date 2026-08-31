"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { profitabilityApi } from "@/services/api/profitability";
import type { ProfitabilityInput } from "@/types/profitability";

export function useCalculateProfitability() {
  return useMutation({
    mutationFn: (payload: ProfitabilityInput) => profitabilityApi.calculate(payload),
  });
}

export function useCompareProfitability() {
  return useMutation({
    mutationFn: (payload: Omit<ProfitabilityInput, "logistics">) => profitabilityApi.compare(payload),
  });
}

export function useProfitabilityList(params?: { page?: number }) {
  return useQuery({
    queryKey: ["profitability", params],
    queryFn: () => profitabilityApi.list(params),
  });
}

export function useProfitabilityResult(id: string) {
  return useQuery({
    queryKey: ["profitability", id],
    queryFn: () => profitabilityApi.get(id),
    enabled: !!id,
  });
}
