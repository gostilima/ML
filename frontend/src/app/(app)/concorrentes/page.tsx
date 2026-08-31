"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { useCompetitors } from "@/hooks/use-competitors";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function ConcorrentesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useCompetitors({ search: search || undefined });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Concorrentes</h1>
        <p className="text-sm text-muted-foreground">Vendedores identificados como concorrentes nas suas categorias.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Lista de concorrentes</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar vendedor…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum concorrente encontrado." description="Tente ampliar seus filtros." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Reputação</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Preço médio</TableHead>
                  <TableHead>Market share est.</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/concorrentes/${c.id}`} className="font-medium hover:underline">
                        {c.seller_nickname}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.reputation ?? "—"}</TableCell>
                    <TableCell>{formatNumber(c.products_count)}</TableCell>
                    <TableCell>{formatCurrency(c.avg_price)}</TableCell>
                    <TableCell>
                      {c.estimated_market_share ? (
                        <>
                          {formatPercent(c.estimated_market_share.value)}{" "}
                          <EstimatedBadge dataType={c.estimated_market_share.data_type} />
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {c.is_official_store ? <Badge variant="secondary">Loja oficial</Badge> : <Badge variant="outline">Independente</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
