import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { MonitoringItem, PriceHistoryPoint } from "@/types/monitoring";

export const monitoringApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<Paginated<MonitoringItem>>("/monitoring", { params }),
  get: (id: string) => api.get<MonitoringItem>(`/monitoring/${id}`),
  priceHistory: (id: string) => api.get<PriceHistoryPoint[]>(`/monitoring/${id}/price-history`),
};
