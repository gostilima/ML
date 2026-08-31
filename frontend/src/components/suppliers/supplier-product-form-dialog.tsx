"use client";
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
import { supplierProductSchema, type SupplierProductFormValues } from "@/schemas/suppliers";
import { useAddSupplierProduct } from "@/hooks/use-suppliers";
import { useToast } from "@/hooks/use-toast";
import { ApiRequestError } from "@/services/api/client";

export function SupplierProductFormDialog({
  supplierId,
  open,
  onOpenChange,
}: {
  supplierId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const mutation = useAddSupplierProduct(supplierId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierProductFormValues>({ resolver: zodResolver(supplierProductSchema) });

  async function onSubmit(values: SupplierProductFormValues) {
    try {
      await mutation.mutateAsync(values);
      toast({ title: "Item adicionado ao catálogo do fornecedor." });
      reset({ nome: "", codigo: "", preco: 0, moq: undefined, estoque: undefined, frete: undefined, prazo_dias: undefined });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Não foi possível adicionar o item.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo item do fornecedor</DialogTitle>
          <DialogDescription>Cadastre um produto ofertado por este fornecedor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" {...register("nome")} />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" {...register("codigo")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço</Label>
              <Input id="preco" type="number" step="0.01" {...register("preco")} />
              {errors.preco && <p className="text-sm text-destructive">{errors.preco.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="moq">MOQ</Label>
              <Input id="moq" type="number" {...register("moq")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque</Label>
              <Input id="estoque" type="number" {...register("estoque")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frete">Frete</Label>
              <Input id="frete" type="number" step="0.01" {...register("frete")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo_dias">Prazo (dias)</Label>
              <Input id="prazo_dias" type="number" {...register("prazo_dias")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
