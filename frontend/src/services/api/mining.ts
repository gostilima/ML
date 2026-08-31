import { api } from "@/services/api/client";
import type { Category, MiningFilters, MiningResultItem, MiningSearchResult } from "@/types/mining";

export const miningApi = {
  search: (filters: MiningFilters) => api.post<MiningSearchResult>("/mining/search", filters),
  categories: (query?: string) => api.get<Category[]>("/mining/categories", { params: { q: query } }),
  getResult: (id: string) => api.get<MiningResultItem>(`/mining/results/${id}`),
  favorite: (id: string, favorite: boolean) =>
    api.patch<MiningResultItem>(`/mining/results/${id}/favorite`, { favorite }),
};
