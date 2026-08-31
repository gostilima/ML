"use client";
import { useQuery } from "@tanstack/react-query";
import { alertsApi } from "@/services/api/alerts";

export function useAlerts(params?: { unread_only?: boolean }) {
  return useQuery({
    queryKey: ["alerts", params],
    queryFn: () => alertsApi.list(params),
  });
}
