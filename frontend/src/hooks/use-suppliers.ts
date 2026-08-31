"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/services/api/suppliers";
import type { SupplierPayload, SupplierProductPayload } from "@/types/suppliers";

export function useSuppliers(params?: { search?: string }) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => suppliersApi.list(params),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => suppliersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload) => suppliersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SupplierPayload>) => suppliersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["suppliers", id] });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useAddSupplierProduct(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierProductPayload) => suppliersApi.addProduct(supplierId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers", supplierId] }),
  });
}

export function useRemoveSupplierProduct(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => suppliersApi.removeProduct(supplierId, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers", supplierId] }),
  });
}
