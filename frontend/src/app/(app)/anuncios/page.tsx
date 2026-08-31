"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { useAdvertisements } from "@/hooks/use-advertisements";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "secondary" | "warning" | "destructive" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "warning" },
  CLOSED: { label: "Encerrado", variant: "secondary" },
  UNDER_REVIEW: { label: "Em revisão", variant: "destructive" },
};

export default function AnunciosPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useAdvertisements({ search: search || undefined });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Anúncios</h1>
        <p className="text-sm text-muted-foreground">Anúncios monitorados no Mercado Livre.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Lista de anúncios</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar anúncio…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState icon={Megaphone} title="Nenhum anúncio encontrado." description="Tente ampliar seus filtros." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anúncio</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Vendidos</TableHead>
                  <TableHead>Visitas est.</TableHead>
                  <TableHead>Conversão est.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => {
                  const status = STATUS_LABEL[a.status] ?? { label: a.status, variant: "secondary" as const };
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link href={`/anuncios/${a.id}`} className="flex items-center gap-3 hover:underline">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {a.image_url && <Image src={a.image_url} alt={a.title} fill sizes="40px" className="object-cover" />}
                          </div>
                          <span className="max-w-[220px] truncate font-medium">{a.title}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{formatCurrency(a.price)}</TableCell>
                      <TableCell>{formatNumber(a.sold_quantity)}</TableCell>
                      <TableCell>
                        {a.estimated_visits ? (
                          <>
                            {formatNumber(a.estimated_visits.value)}{" "}
                            <EstimatedBadge dataType={a.estimated_visits.data_type} />
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {a.estimated_conversion_rate ? (
                          <>
                            {formatPercent(a.estimated_conversion_rate.value)}{" "}
                            <EstimatedBadge dataType={a.estimated_conversion_rate.data_type} />
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
