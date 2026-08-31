"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { useMonitoringList } from "@/hooks/use-monitoring";
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  OK: { label: "OK", variant: "success" },
  ALERTA: { label: "Alerta", variant: "warning" },
  CRITICO: { label: "Crítico", variant: "destructive" },
  PAUSADO: { label: "Pausado", variant: "secondary" },
};

export default function MonitoramentoPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useMonitoringList({ search: search || undefined });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoramento</h1>
        <p className="text-sm text-muted-foreground">Acompanhamento de preços e alertas dos produtos monitorados.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Produtos monitorados</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar produto…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState icon={Activity} title="Nenhum produto monitorado." description="Tente ampliar seus filtros." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço atual</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Vendas est./mês</TableHead>
                  <TableHead>Última verificação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => {
                  const status = STATUS_LABEL[m.status] ?? { label: m.status, variant: "secondary" as const };
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Link href={`/monitoramento/${m.id}`} className="flex items-center gap-3 hover:underline">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {m.image_url && (
                              <Image src={m.image_url} alt={m.product_name} fill sizes="40px" className="object-cover" />
                            )}
                          </div>
                          <span className="max-w-[200px] truncate font-medium">{m.product_name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{formatCurrency(m.current_price)}</TableCell>
                      <TableCell className={m.price_change_percent && m.price_change_percent < 0 ? "text-destructive" : "text-success"}>
                        {m.price_change_percent !== null ? formatPercent(m.price_change_percent) : "—"}
                      </TableCell>
                      <TableCell>
                        {m.estimated_monthly_sales ? (
                          <>
                            {formatNumber(m.estimated_monthly_sales.value)}{" "}
                            <EstimatedBadge dataType={m.estimated_monthly_sales.data_type} />
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(m.last_checked_at)}</TableCell>
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
