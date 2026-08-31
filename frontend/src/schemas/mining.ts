import { z } from "zod";

export const miningFiltersSchema = z.object({
  category: z.string().optional(),
  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().min(0).optional(),
  supplier_cost_min: z.coerce.number().min(0).optional(),
  supplier_cost_max: z.coerce.number().min(0).optional(),
  min_margin: z.coerce.number().min(0).max(100).optional(),
  min_roi: z.coerce.number().min(0).optional(),
  min_monthly_sales: z.coerce.number().min(0).optional(),
  revenue_min: z.coerce.number().min(0).optional(),
  revenue_max: z.coerce.number().min(0).optional(),
  competition: z.enum(["BAIXA", "MEDIA", "ALTA"]).optional(),
  max_weight_kg: z.coerce.number().min(0).optional(),
  seasonality: z.enum(["EXCLUIR", "PERMITIR"]).optional(),
  trend: z.enum(["CRESCENTE", "ESTAVEL", "DECRESCENTE"]).optional(),
  logistics: z.enum(["FULL", "MERCADO_ENVIOS", "PROPRIA"]).optional(),
});
export type MiningFiltersFormValues = z.infer<typeof miningFiltersSchema>;
