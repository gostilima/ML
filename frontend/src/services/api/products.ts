import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { Product, ProductListParams, ProductPayload } from "@/types/products";

export const productsApi = {
  list: (params?: ProductListParams) => api.get<Paginated<Product>>("/products", { params }),
  get: (id: string) => api.get<Product>(`/products/${id}`),
  create: (payload: ProductPayload) => api.post<Product>("/products", payload),
  update: (id: string, payload: Partial<ProductPayload>) => api.put<Product>(`/products/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/products/${id}`),
};
