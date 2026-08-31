import type { OpportunityScore } from "@/types/common";

export interface ProductDimensions {
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  sku: string | null;
  ml_item_id: string | null;
  ean: string | null;
  weight_kg: number | null;
  dimensions: ProductDimensions | null;
  image_url: string | null;
  price: number | null;
  monthly_sales: number | null;
  monthly_revenue: number | null;
  supplier_cost: number | null;
  profit: number | null;
  margin: number | null;
  roi: number | null;
  opportunity_score: OpportunityScore | null;
  created_at: string;
  updated_at: string;
}

export interface ProductPayload {
  name: string;
  brand?: string;
  category?: string;
  sku?: string;
  ml_item_id?: string;
  ean?: string;
  weight_kg?: number;
  dimensions?: Partial<ProductDimensions>;
  image_url?: string;
}

export interface ProductListParams {
  page?: number;
  per_page?: number;
  search?: string;
}
