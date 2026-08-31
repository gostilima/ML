import { api } from "@/services/api/client";
import type { DashboardCharts, DashboardSummary } from "@/types/dashboard";

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
  charts: () => api.get<DashboardCharts>("/dashboard/charts"),
};
