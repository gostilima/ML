import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { ProfitabilityComparison, ProfitabilityInput, ProfitabilityResult } from "@/types/profitability";

// All financial math (commissions, fees, taxes, profit, margin, ROI,
// markup) is computed server-side. The frontend only sends inputs and
// renders whatever breakdown the backend returns — never calculates
// these values itself.
export const profitabilityApi = {
  calculate: (payload: ProfitabilityInput) => api.post<ProfitabilityResult>("/profitability/calculate", payload),
  compare: (payload: Omit<ProfitabilityInput, "logistics">) =>
    api.post<ProfitabilityComparison>("/profitability/compare", payload),
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<Paginated<ProfitabilityResult>>("/profitability", { params }),
  get: (id: string) => api.get<ProfitabilityResult>(`/profitability/${id}`),
};
