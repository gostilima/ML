"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MiningFilterForm } from "@/components/mining/mining-filter-form";
import { encodeMiningFilters } from "@/lib/mining-filters";
import type { MiningFilters } from "@/types/mining";

export default function MineradorPage() {
  const router = useRouter();

  function handleSubmit(filters: MiningFilters) {
    router.push(`/minerador/resultados?f=${encodeMiningFilters(filters)}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Minerador de produtos</h1>
        <p className="text-sm text-muted-foreground">
          Encontre oportunidades de produtos no Mercado Livre com base em critérios de rentabilidade e demanda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros de mineração</CardTitle>
          <CardDescription>Refine sua busca com os filtros abaixo. Todos os campos são opcionais.</CardDescription>
        </CardHeader>
        <CardContent>
          <MiningFilterForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
