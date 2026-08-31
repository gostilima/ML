"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { OpportunityScorePanel } from "@/components/mining/opportunity-score";
import { useOpportunity } from "@/hooks/use-opportunities";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function OportunidadeDetailPage({ params }: { params: { id: string } }) {
  const { data: o, isLoading, isError, refetch } = useOpportunity(params.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/oportunidades" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para oportunidades
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !o ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {o.image_url && <Image src={o.image_url} alt={o.name} fill sizes="80px" className="object-cover" />}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{o.name}</h1>
              <p className="text-sm text-muted-foreground">{o.category ?? "Sem categoria"}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Métricas estimadas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Preço</p>
                  <p className="font-medium">{formatCurrency(o.price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vendas/mês</p>
                  <p className="font-medium">
                    {formatNumber(o.estimated_monthly_sales.value)}{" "}
                    <EstimatedBadge dataType={o.estimated_monthly_sales.data_type} />
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Faturamento/mês</p>
                  <p className="font-medium">
                    {formatCurrency(o.estimated_monthly_revenue.value)}{" "}
                    <EstimatedBadge dataType={o.estimated_monthly_revenue.data_type} />
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margem</p>
                  <p className="font-medium">{formatPercent(o.margin)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className="font-medium">{formatPercent(o.roi)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opportunity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <OpportunityScorePanel {...o.opportunity_score} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
