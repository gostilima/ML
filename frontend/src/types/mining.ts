import type { CompetitionLevel, LogisticsType, OpportunityScore, TrendDirection } from "@/types/common";

export interface MiningFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  supplier_cost_min?: number;
  supplier_cost_max?: number;
  min_margin?: number;
  min_roi?: number;
  min_monthly_sales?: number;
  revenue_min?: number;
  revenue_max?: number;
  competition?: CompetitionLevel;
  max_weight_kg?: number;
  seasonality?: "EXCLUIR" | "PERMITIR";
  trend?: TrendDirection;
  logistics?: LogisticsType;
}

export interface MiningResultItem {
  id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  price: number;
  monthly_sales: number;
  monthly_sales_data_type: "estimated" | "real";
  monthly_revenue: number;
  supplier_cost: number | null;
  profit: number | null;
  margin: number | null;
  roi: number | null;
  competition: CompetitionLevel | null;
  trend: TrendDirection | null;
  opportunity_score: OpportunityScore;
  is_favorite: boolean;
}

export interface MiningSearchResult {
  items: MiningResultItem[];
  total: number;
}

export interface Category {
  id: string;
  name: string;
  path?: string;
}
