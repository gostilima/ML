import type { DataField } from "@/types/common";

export interface Competitor {
  id: string;
  seller_nickname: string;
  seller_ml_id: string | null;
  reputation: string | null;
  products_count: number;
  avg_price: number | null;
  estimated_market_share: DataField<number> | null;
  estimated_monthly_sales: DataField<number> | null;
  is_official_store: boolean;
  location: string | null;
}
