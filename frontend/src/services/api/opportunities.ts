import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { Opportunity } from "@/types/opportunities";

export const opportunitiesApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<Paginated<Opportunity>>("/opportunities", { params }),
  get: (id: string) => api.get<Opportunity>(`/opportunities/${id}`),
};
