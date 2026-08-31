"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miningApi } from "@/services/api/mining";
import type { MiningFilters } from "@/types/mining";

export function useMiningSearch(filters: MiningFilters | null) {
  return useQuery({
    queryKey: ["mining", "search", filters],
    queryFn: () => miningApi.search(filters as MiningFilters),
    enabled: !!filters,
  });
}

export function useMiningCategories(query: string) {
  return useQuery({
    queryKey: ["mining", "categories", query],
    queryFn: () => miningApi.categories(query),
    staleTime: 5 * 60_000,
  });
}

export function useMiningResult(id: string) {
  return useQuery({
    queryKey: ["mining", "results", id],
    queryFn: () => miningApi.getResult(id),
    enabled: !!id,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) => miningApi.favorite(id, favorite),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mining"] });
    },
  });
}
