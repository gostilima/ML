import { api } from "@/services/api/client";
import type { Paginated } from "@/types/api";
import type { Supplier, SupplierPayload, SupplierProduct, SupplierProductPayload } from "@/types/suppliers";

export const suppliersApi = {
  list: (params?: { search?: string; page?: number; per_page?: number }) =>
    api.get<Paginated<Supplier>>("/suppliers", { params }),
  get: (id: string) => api.get<Supplier>(`/suppliers/${id}`),
  create: (payload: SupplierPayload) => api.post<Supplier>("/suppliers", payload),
  update: (id: string, payload: Partial<SupplierPayload>) => api.put<Supplier>(`/suppliers/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/suppliers/${id}`),

  addProduct: (supplierId: string, payload: SupplierProductPayload) =>
    api.post<SupplierProduct>(`/suppliers/${supplierId}/products`, payload),
  removeProduct: (supplierId: string, productId: string) =>
    api.delete<void>(`/suppliers/${supplierId}/products/${productId}`),
};
