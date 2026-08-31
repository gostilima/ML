"use client";
import { useQuery } from "@tanstack/react-query";
import { opportunitiesApi } from "@/services/api/opportunities";

export function useOpportunities(params?: { search?: string }) {
  return useQuery({
    queryKey: ["opportunities", params],
    queryFn: () => opportunitiesApi.list(params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunities", id],
    queryFn: () => opportunitiesApi.get(id),
    enabled: !!id,
  });
}
