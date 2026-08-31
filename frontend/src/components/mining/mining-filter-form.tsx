"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryCombobox } from "@/components/mining/category-combobox";
import { miningFiltersSchema, type MiningFiltersFormValues } from "@/schemas/mining";
import type { MiningFilters } from "@/types/mining";

export function MiningFilterForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues?: Partial<MiningFilters>;
  onSubmit: (filters: MiningFilters) => void;
  isSubmitting?: boolean;
}) {
  const { register, control, handleSubmit } = useForm<MiningFiltersFormValues>({
    resolver: zodResolver(miningFiltersSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label>Categoria</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => <CategoryCombobox value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="space-y-2">
          <Label>Preço (R$)</Label>
          <div className="flex gap-2">
            <Input type="number" step="0.01" placeholder="Mín." {...register("price_min")} />
            <Input type="number" step="0.01" placeholder="Máx." {...register("price_max")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Custo fornecedor (R$)</Label>
          <div className="flex gap-2">
            <Input type="number" step="0.01" placeholder="Mín." {...register("supplier_cost_min")} />
            <Input type="number" step="0.01" placeholder="Máx." {...register("supplier_cost_max")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_margin">Margem mínima (%)</Label>
          <Input id="min_margin" type="number" step="0.1" {...register("min_margin")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_roi">ROI mínimo (%)</Label>
          <Input id="min_roi" type="number" step="0.1" {...register("min_roi")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_monthly_sales">Vendas estimadas mínimas/mês</Label>
          <Input id="min_monthly_sales" type="number" {...register("min_monthly_sales")} />
        </div>

        <div className="space-y-2">
          <Label>Faturamento estimado (R$/mês)</Label>
          <div className="flex gap-2">
            <Input type="number" step="0.01" placeholder="Mín." {...register("revenue_min")} />
            <Input type="number" step="0.01" placeholder="Máx." {...register("revenue_max")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Concorrência</Label>
          <Controller
            control={control}
            name="competition"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_weight_kg">Peso máximo (kg)</Label>
          <Input id="max_weight_kg" type="number" step="0.1" {...register("max_weight_kg")} />
        </div>

        <div className="space-y-2">
          <Label>Sazonalidade</Label>
          <Controller
            control={control}
            name="seasonality"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMITIR">Permitir sazonais</SelectItem>
                  <SelectItem value="EXCLUIR">Excluir sazonais</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Tendência</Label>
          <Controller
            control={control}
            name="trend"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRESCENTE">Crescente</SelectItem>
                  <SelectItem value="ESTAVEL">Estável</SelectItem>
                  <SelectItem value="DECRESCENTE">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Logística</Label>
          <Controller
            control={control}
            name="logistics"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full</SelectItem>
                  <SelectItem value="MERCADO_ENVIOS">Mercado Envios</SelectItem>
                  <SelectItem value="PROPRIA">Própria</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
        Buscar oportunidades
      </Button>
    </form>
  );
}
