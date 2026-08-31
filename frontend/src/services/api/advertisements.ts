import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { Advertisement } from "@/types/advertisements";

export const advertisementsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<Paginated<Advertisement>>("/advertisements", { params }),
  get: (id: string) => api.get<Advertisement>(`/advertisements/${id}`),
};
