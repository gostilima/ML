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
import { supplierSchema, type SupplierFormValues } from "@/schemas/suppliers";
import type { Supplier } from "@/types/suppliers";
import { useToast } from "@/hooks/use-toast";
import { ApiRequestError } from "@/services/api/client";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}) {
  const isEdit = !!supplier;
  const { toast } = useToast();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(supplier?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({ resolver: zodResolver(supplierSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: supplier?.name ?? "",
        contact_name: supplier?.contact_name ?? "",
        email: supplier?.email ?? "",
        phone: supplier?.phone ?? "",
        website: supplier?.website ?? "",
        location: supplier?.location ?? "",
        notes: supplier?.notes ?? "",
      });
    }
  }, [open, supplier, reset]);

  async function onSubmit(values: SupplierFormValues) {
    try {
      await mutation.mutateAsync(values);
      toast({ title: isEdit ? "Fornecedor atualizado." : "Fornecedor criado com sucesso." });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Não foi possível salvar o fornecedor.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
          <DialogDescription>Dados de contato e localização do fornecedor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contato</Label>
              <Input id="contact_name" {...register("contact_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site</Label>
              <Input id="website" placeholder="https://…" {...register("website")} />
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input id="location" {...register("location")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Criar fornecedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
