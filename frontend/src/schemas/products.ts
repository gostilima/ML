import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto."),
  brand: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  ml_item_id: z.string().optional(),
  ean: z.string().optional(),
  weight_kg: z.coerce.number().min(0).optional(),
  image_url: z.string().url("Informe uma URL válida.").optional().or(z.literal("")),
  length_cm: z.coerce.number().min(0).optional(),
  width_cm: z.coerce.number().min(0).optional(),
  height_cm: z.coerce.number().min(0).optional(),
});
export type ProductFormValues = z.infer<typeof productSchema>;
