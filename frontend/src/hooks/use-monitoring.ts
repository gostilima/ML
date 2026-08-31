"use client";
import { useQuery } from "@tanstack/react-query";
import { monitoringApi } from "@/services/api/monitoring";

export function useMonitoringList(params?: { search?: string }) {
  return useQuery({
    queryKey: ["monitoring", params],
    queryFn: () => monitoringApi.list(params),
  });
}

export function useMonitoringItem(id: string) {
  return useQuery({
    queryKey: ["monitoring", id],
    queryFn: () => monitoringApi.get(id),
    enabled: !!id,
  });
}

export function useMonitoringPriceHistory(id: string) {
  return useQuery({
    queryKey: ["monitoring", id, "price-history"],
    queryFn: () => monitoringApi.priceHistory(id),
    enabled: !!id,
  });
}
