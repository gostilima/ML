"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { ProfitabilityBreakdownPanel } from "@/components/profitability/breakdown-panel";
import { useProfitabilityResult } from "@/hooks/use-profitability";
import { formatDateTime } from "@/lib/utils";

export default function RentabilidadeDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError, refetch } = useProfitabilityResult(params.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/rentabilidade" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para rentabilidade
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Simulação de {formatDateTime(data.created_at)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitabilityBreakdownPanel breakdown={data.breakdown} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
