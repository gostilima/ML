"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfitabilityForm } from "@/components/profitability/profitability-form";
import { ProfitabilityBreakdownPanel } from "@/components/profitability/breakdown-panel";
import { ProfitabilityComparatorTable } from "@/components/profitability/comparator-table";
import { EmptyState } from "@/components/ui/state";
import { useCalculateProfitability, useCompareProfitability } from "@/hooks/use-profitability";
import { useToast } from "@/hooks/use-toast";
import { ApiRequestError } from "@/services/api/client";
import { Calculator } from "lucide-react";
import type { ProfitabilityResult, ProfitabilityComparison } from "@/types/profitability";

export default function RentabilidadePage() {
  const calculate = useCalculateProfitability();
  const compare = useCompareProfitability();
  const { toast } = useToast();
  const [result, setResult] = useState<ProfitabilityResult | null>(null);
  const [comparison, setComparison] = useState<ProfitabilityComparison | null>(null);

  async function handleCalculate(values: Parameters<typeof calculate.mutateAsync>[0]) {
    try {
      const res = await calculate.mutateAsync(values);
      setResult(res);
      setComparison(null);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Não foi possível calcular a rentabilidade.";
      toast({ title: "Erro no cálculo", description: message, variant: "destructive" });
    }
  }

  async function handleCompare(values: Parameters<typeof compare.mutateAsync>[0]) {
    try {
      const res = await compare.mutateAsync(values);
      setComparison(res);
      setResult(null);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Não foi possível comparar as modalidades.";
      toast({ title: "Erro na comparação", description: message, variant: "destructive" });
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calculadora de rentabilidade</h1>
        <p className="text-sm text-muted-foreground">
          Simule custos, comissões e impostos para descobrir a margem e o ROI reais de um produto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da simulação</CardTitle>
          <CardDescription>Todos os cálculos financeiros são realizados pelo servidor.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfitabilityForm
            onCalculate={handleCalculate}
            onCompare={handleCompare}
            isCalculating={calculate.isPending}
            isComparing={compare.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <ProfitabilityBreakdownPanel breakdown={result.breakdown} />
          ) : comparison ? (
            <ProfitabilityComparatorTable comparison={comparison} />
          ) : (
            <EmptyState
              icon={Calculator}
              title="Nenhum cálculo realizado ainda."
              description="Preencha o formulário acima e clique em Calcular ou Comparar modalidades."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
