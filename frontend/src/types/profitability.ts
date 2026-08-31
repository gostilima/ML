import type { LogisticsType } from "@/types/common";

export interface ProfitabilityInput {
  supplier_cost: number;
  sale_price: number;
  quantity: number;
  supplier_freight?: number;
  packaging_cost?: number;
  tax_percent?: number;
  other_costs?: number;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  logistics: LogisticsType;
}

export interface ProfitabilityBreakdown {
  sale_price: number;
  commission: number;
  logistics_cost: number;
  fees: number;
  taxes: number;
  supplier_freight: number;
  supplier_cost: number;
  profit: number;
  margin: number;
  roi: number;
  markup: number;
}

export interface ProfitabilityResult {
  id: string;
  input: ProfitabilityInput;
  breakdown: ProfitabilityBreakdown;
  created_at: string;
}

export interface ProfitabilityComparisonItem {
  logistics: LogisticsType;
  breakdown: ProfitabilityBreakdown;
  is_best: boolean;
}

export interface ProfitabilityComparison {
  items: ProfitabilityComparisonItem[];
}
