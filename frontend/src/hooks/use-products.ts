"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/services/api/products";
import type { ProductListParams, ProductPayload } from "@/types/products";

export const productsKey = (params?: ProductListParams) => ["products", params] as const;

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productsKey(params),
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProductPayload>) => productsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products", id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
