"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Columns3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profitabilitySchema, type ProfitabilityFormValues } from "@/schemas/profitability";

export function ProfitabilityForm({
  onCalculate,
  onCompare,
  isCalculating,
  isComparing,
}: {
  onCalculate: (values: ProfitabilityFormValues) => void;
  onCompare: (values: Omit<ProfitabilityFormValues, "logistics">) => void;
  isCalculating?: boolean;
  isComparing?: boolean;
}) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ProfitabilityFormValues>({
    resolver: zodResolver(profitabilitySchema),
    defaultValues: { quantity: 1, logistics: "MERCADO_ENVIOS" },
  });

  return (
    <form onSubmit={handleSubmit(onCalculate)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="supplier_cost">Custo fornecedor (R$)</Label>
          <Input id="supplier_cost" type="number" step="0.01" {...register("supplier_cost")} />
          {errors.supplier_cost && <p className="text-sm text-destructive">{errors.supplier_cost.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_price">Preço de venda (R$)</Label>
          <Input id="sale_price" type="number" step="0.01" {...register("sale_price")} />
          {errors.sale_price && <p className="text-sm text-destructive">{errors.sale_price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input id="quantity" type="number" {...register("quantity")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier_freight">Frete fornecedor (R$)</Label>
          <Input id="supplier_freight" type="number" step="0.01" {...register("supplier_freight")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="packaging_cost">Embalagem (R$)</Label>
          <Input id="packaging_cost" type="number" step="0.01" {...register("packaging_cost")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_percent">Imposto (%)</Label>
          <Input id="tax_percent" type="number" step="0.01" {...register("tax_percent")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="other_costs">Outros custos (R$)</Label>
          <Input id="other_costs" type="number" step="0.01" {...register("other_costs")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight_kg">Peso (kg)</Label>
          <Input id="weight_kg" type="number" step="0.01" {...register("weight_kg")} />
        </div>
        <div className="space-y-2">
          <Label>Logística</Label>
          <Controller
            control={control}
            name="logistics"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isCalculating}>
          {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
          Calcular
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isComparing}
          onClick={handleSubmit(() => {
            const { logistics, ...rest } = getValues();
            onCompare(rest);
          })}
        >
          {isComparing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Columns3 className="mr-2 h-4 w-4" />}
          Comparar modalidades
        </Button>
      </div>
    </form>
  );
}
