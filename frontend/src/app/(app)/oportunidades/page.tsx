"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { OpportunityScoreBadge } from "@/components/mining/opportunity-score";
import { useOpportunities } from "@/hooks/use-opportunities";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  NOVA: "Nova",
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  DESCARTADA: "Descartada",
};

export default function OportunidadesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useOpportunities({ search: search || undefined });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Oportunidades</h1>
        <p className="text-sm text-muted-foreground">Produtos identificados pelo minerador com potencial de venda.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Lista de oportunidades</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState icon={Target} title="Nenhuma oportunidade encontrada." description="Tente ampliar seus filtros." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Vendas est./mês</TableHead>
                  <TableHead>Faturamento est./mês</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/oportunidades/${o.id}`} className="flex items-center gap-3 hover:underline">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {o.image_url && <Image src={o.image_url} alt={o.name} fill sizes="40px" className="object-cover" />}
                        </div>
                        <span className="max-w-[200px] truncate font-medium">{o.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{formatCurrency(o.price)}</TableCell>
                    <TableCell>
                      {formatNumber(o.estimated_monthly_sales.value)}{" "}
                      <EstimatedBadge dataType={o.estimated_monthly_sales.data_type} />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(o.estimated_monthly_revenue.value)}{" "}
                      <EstimatedBadge dataType={o.estimated_monthly_revenue.data_type} />
                    </TableCell>
                    <TableCell>{formatPercent(o.margin)}</TableCell>
                    <TableCell>
                      <OpportunityScoreBadge {...o.opportunity_score} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{STATUS_LABEL[o.status] ?? o.status}</Badge>
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
