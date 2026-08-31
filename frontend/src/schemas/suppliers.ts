import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Informe o nome do fornecedor."),
  contact_name: z.string().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("URL inválida.").optional().or(z.literal("")),
  location: z.string().optional(),
  notes: z.string().optional(),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const supplierProductSchema = z.object({
  nome: z.string().min(1, "Informe o nome do item."),
  codigo: z.string().optional(),
  preco: z.coerce.number().min(0, "Informe um preço válido."),
  moq: z.coerce.number().min(0).optional(),
  estoque: z.coerce.number().min(0).optional(),
  frete: z.coerce.number().min(0).optional(),
  prazo_dias: z.coerce.number().min(0).optional(),
});
export type SupplierProductFormValues = z.infer<typeof supplierProductSchema>;
