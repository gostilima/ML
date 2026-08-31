"use client";
import { useQuery } from "@tanstack/react-query";
import { advertisementsApi } from "@/services/api/advertisements";

export function useAdvertisements(params?: { search?: string }) {
  return useQuery({
    queryKey: ["advertisements", params],
    queryFn: () => advertisementsApi.list(params),
  });
}

export function useAdvertisement(id: string) {
  return useQuery({
    queryKey: ["advertisements", id],
    queryFn: () => advertisementsApi.get(id),
    enabled: !!id,
  });
}
