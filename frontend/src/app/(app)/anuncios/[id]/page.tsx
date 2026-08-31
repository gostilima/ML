"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { Badge } from "@/components/ui/badge";
import { useAdvertisement } from "@/hooks/use-advertisements";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function AnuncioDetailPage({ params }: { params: { id: string } }) {
  const { data: a, isLoading, isError, refetch } = useAdvertisement(params.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/anuncios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para anúncios
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !a ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {a.image_url && <Image src={a.image_url} alt={a.title} fill sizes="64px" className="object-cover" />}
              </div>
              <div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{a.ml_item_id}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Field label="Preço" value={formatCurrency(a.price)} />
            <Field label="Vendidos" value={formatNumber(a.sold_quantity)} />
            <Field label="Disponível" value={formatNumber(a.available_quantity)} />
            <div>
              <p className="text-muted-foreground">Visitas estimadas</p>
              <p className="font-medium">
                {a.estimated_visits ? (
                  <>
                    {formatNumber(a.estimated_visits.value)} <EstimatedBadge dataType={a.estimated_visits.data_type} />
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Conversão estimada</p>
              <p className="font-medium">
                {a.estimated_conversion_rate ? (
                  <>
                    {formatPercent(a.estimated_conversion_rate.value)}{" "}
                    <EstimatedBadge dataType={a.estimated_conversion_rate.data_type} />
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline">{a.status}</Badge>
            </div>
          </CardContent>
          {a.permalink && (
            <CardContent className="pt-0">
              <a
                href={a.permalink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver no Mercado Livre <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          )}
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
