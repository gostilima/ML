import type { DataField, OpportunityScore } from "@/types/common";

export interface Opportunity {
  id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  category: string | null;
  price: number;
  estimated_monthly_sales: DataField<number>;
  estimated_monthly_revenue: DataField<number>;
  margin: number | null;
  roi: number | null;
  opportunity_score: OpportunityScore;
  status: "NOVA" | "EM_ANALISE" | "APROVADA" | "DESCARTADA";
  created_at: string;
}
