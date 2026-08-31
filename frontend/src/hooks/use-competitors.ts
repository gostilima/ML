"use client";
import { useQuery } from "@tanstack/react-query";
import { competitorsApi } from "@/services/api/competitors";

export function useCompetitors(params?: { search?: string }) {
  return useQuery({
    queryKey: ["competitors", params],
    queryFn: () => competitorsApi.list(params),
  });
}

export function useCompetitor(id: string) {
  return useQuery({
    queryKey: ["competitors", id],
    queryFn: () => competitorsApi.get(id),
    enabled: !!id,
  });
}
