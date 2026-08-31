"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { EstimatedBadge } from "@/components/ui/estimated-badge";
import { Badge } from "@/components/ui/badge";
import { useMonitoringItem, useMonitoringPriceHistory } from "@/hooks/use-monitoring";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/utils";

export default function MonitoramentoDetailPage({ params }: { params: { id: string } }) {
  const { data: item, isLoading, isError, refetch } = useMonitoringItem(params.id);
  const { data: history, isLoading: historyLoading } = useMonitoringPriceHistory(params.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/monitoramento" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para monitoramento
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !item ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="64px" className="object-cover" />}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{item.product_name}</h1>
              <p className="text-sm text-muted-foreground">Última verificação: {formatDateTime(item.last_checked_at)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Preço atual</p>
                <p className="text-2xl font-semibold">{formatCurrency(item.current_price)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Vendas estimadas/mês</p>
                <p className="text-2xl font-semibold">
                  {item.estimated_monthly_sales ? formatNumber(item.estimated_monthly_sales.value) : "—"}{" "}
                  {item.estimated_monthly_sales && <EstimatedBadge dataType={item.estimated_monthly_sales.data_type} />}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Alertas ativos</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold">{item.alerts_count}</p>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução de preço</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : !history || history.length === 0 ? (
                <EmptyState title="Sem histórico de preço." description="Ainda não há dados suficientes para este produto." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(d) => formatDate(d as string)} />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
