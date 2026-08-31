"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { Badge } from "@/components/ui/badge";
import { useCompetitor } from "@/hooks/use-competitors";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function ConcorrenteDetailPage({ params }: { params: { id: string } }) {
  const { data: c, isLoading, isError, refetch } = useCompetitor(params.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/concorrentes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para concorrentes
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !c ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{c.seller_nickname}</CardTitle>
              {c.is_official_store && <Badge variant="secondary">Loja oficial</Badge>}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Field label="Reputação" value={c.reputation} />
            <Field label="Localização" value={c.location} />
            <Field label="Produtos anunciados" value={formatNumber(c.products_count)} />
            <Field label="Preço médio" value={formatCurrency(c.avg_price)} />
            <div>
              <p className="text-muted-foreground">Market share estimado</p>
              <p className="font-medium">
                {c.estimated_market_share ? (
                  <>
                    {formatPercent(c.estimated_market_share.value)}{" "}
                    <EstimatedBadge dataType={c.estimated_market_share.data_type} />
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Vendas/mês estimadas</p>
              <p className="font-medium">
                {c.estimated_monthly_sales ? (
                  <>
                    {formatNumber(c.estimated_monthly_sales.value)}{" "}
                    <EstimatedBadge dataType={c.estimated_monthly_sales.data_type} />
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
