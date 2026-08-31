"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { OpportunityScorePanel } from "@/components/mining/opportunity-score";
import { useMiningResult, useToggleFavorite } from "@/hooks/use-mining";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function MineradorProdutoPage({ params }: { params: { id: string } }) {
  const { data: item, isLoading, isError, refetch } = useMiningResult(params.id);
  const toggleFavorite = useToggleFavorite();
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/minerador/resultados" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para resultados
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !item ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image_url && <Image src={item.image_url} alt={item.name} fill sizes="80px" className="object-cover" />}
              </div>
              <h1 className="text-xl font-semibold tracking-tight">{item.name}</h1>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await toggleFavorite.mutateAsync({ id: item.id, favorite: !item.is_favorite });
                } catch {
                  toast({ title: "Erro ao favoritar produto.", variant: "destructive" });
                }
              }}
            >
              <Heart className={item.is_favorite ? "mr-2 h-4 w-4 fill-destructive text-destructive" : "mr-2 h-4 w-4"} />
              {item.is_favorite ? "Favoritado" : "Favoritar"}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Métricas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Field label="Preço" value={formatCurrency(item.price)} />
                <Field
                  label="Vendas/mês"
                  value={formatNumber(item.monthly_sales)}
                  badge={<EstimatedBadge dataType={item.monthly_sales_data_type} />}
                />
                <Field label="Faturamento/mês" value={formatCurrency(item.monthly_revenue)} />
                <Field label="Custo fornecedor" value={formatCurrency(item.supplier_cost)} />
                <Field label="Lucro" value={formatCurrency(item.profit)} />
                <Field label="Margem" value={formatPercent(item.margin)} />
                <Field label="ROI" value={formatPercent(item.roi)} />
                <Field label="Concorrência" value={item.competition ?? "—"} />
                <Field label="Tendência" value={item.trend ?? "—"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opportunity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <OpportunityScorePanel {...item.opportunity_score} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value, badge }: { label: string; value: string | number; badge?: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">
        {value} {badge}
      </p>
    </div>
  );
}
