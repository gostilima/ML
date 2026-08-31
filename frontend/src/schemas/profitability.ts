import { z } from "zod";

export const profitabilitySchema = z.object({
  supplier_cost: z.coerce.number().min(0, "Informe o custo do fornecedor."),
  sale_price: z.coerce.number().min(0.01, "Informe o preço de venda."),
  quantity: z.coerce.number().min(1, "Informe a quantidade.").default(1),
  supplier_freight: z.coerce.number().min(0).optional(),
  packaging_cost: z.coerce.number().min(0).optional(),
  tax_percent: z.coerce.number().min(0).max(100).optional(),
  other_costs: z.coerce.number().min(0).optional(),
  weight_kg: z.coerce.number().min(0).optional(),
  length_cm: z.coerce.number().min(0).optional(),
  width_cm: z.coerce.number().min(0).optional(),
  height_cm: z.coerce.number().min(0).optional(),
  logistics: z.enum(["FULL", "MERCADO_ENVIOS", "PROPRIA"]),
});
export type ProfitabilityFormValues = z.infer<typeof profitabilitySchema>;
