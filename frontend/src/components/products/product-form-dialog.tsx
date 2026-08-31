"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema, type ProductFormValues } from "@/schemas/products";
import type { Product } from "@/types/products";
import { useToast } from "@/hooks/use-toast";
import { ApiRequestError } from "@/services/api/client";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}) {
  const isEdit = !!product;
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? "",
        brand: product?.brand ?? "",
        category: product?.category ?? "",
        sku: product?.sku ?? "",
        ml_item_id: product?.ml_item_id ?? "",
        ean: product?.ean ?? "",
        weight_kg: product?.weight_kg ?? undefined,
        image_url: product?.image_url ?? "",
        length_cm: product?.dimensions?.length_cm ?? undefined,
        width_cm: product?.dimensions?.width_cm ?? undefined,
        height_cm: product?.dimensions?.height_cm ?? undefined,
      });
    }
  }, [open, product, reset]);

  async function onSubmit(values: ProductFormValues) {
    try {
      const { length_cm, width_cm, height_cm, ...rest } = values;
      const payload = {
        ...rest,
        dimensions: { length_cm, width_cm, height_cm },
      };
      await mutation.mutateAsync(payload);
      toast({ title: isEdit ? "Produto atualizado." : "Produto criado com sucesso." });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Não foi possível salvar o produto.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>Preencha os dados cadastrais do produto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" {...register("brand")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" {...register("category")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ml_item_id">ID do anúncio ML</Label>
              <Input id="ml_item_id" placeholder="MLB123456789" {...register("ml_item_id")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ean">EAN</Label>
              <Input id="ean" {...register("ean")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Peso (kg)</Label>
              <Input id="weight_kg" type="number" step="0.01" {...register("weight_kg")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length_cm">Comprimento (cm)</Label>
              <Input id="length_cm" type="number" step="0.1" {...register("length_cm")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width_cm">Largura (cm)</Label>
              <Input id="width_cm" type="number" step="0.1" {...register("width_cm")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height_cm">Altura (cm)</Label>
              <Input id="height_cm" type="number" step="0.1" {...register("height_cm")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">URL da imagem</Label>
            <Input id="image_url" placeholder="https://…" {...register("image_url")} />
            {errors.image_url && <p className="text-sm text-destructive">{errors.image_url.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
