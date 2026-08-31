import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { Competitor } from "@/types/competitors";

export const competitorsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<Paginated<Competitor>>("/competitors", { params }),
  get: (id: string) => api.get<Competitor>(`/competitors/${id}`),
};
