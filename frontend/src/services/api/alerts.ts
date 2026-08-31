import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { Alert } from "@/types/alerts";

export const alertsApi = {
  list: (params?: { page?: number; per_page?: number; unread_only?: boolean }) =>
    api.get<Paginated<Alert>>("/alerts", { params }),
  markRead: (id: string) => api.patch<Alert>(`/alerts/${id}/read`),
  markAllRead: () => api.post<void>("/alerts/read-all"),
};
