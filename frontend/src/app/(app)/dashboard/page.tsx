"use client";
import { Package, Target, Activity, Percent, TrendingUp, DollarSign, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TimeSeriesChart, DistributionChart } from "@/components/dashboard/charts";
import { useDashboardCharts, useDashboardSummary } from "@/hooks/use-dashboard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua operação no Mercado Livre.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Produtos analisados" value={formatNumber(summary?.products_analyzed)} icon={Package} isLoading={summaryLoading} />
        <KpiCard label="Oportunidades encontradas" value={formatNumber(summary?.opportunities_found)} icon={Target} isLoading={summaryLoading} />
        <KpiCard label="Produtos monitorados" value={formatNumber(summary?.products_monitored)} icon={Activity} isLoading={summaryLoading} />
        <KpiCard label="Margem média" value={formatPercent(summary?.avg_margin)} icon={Percent} isLoading={summaryLoading} />
        <KpiCard label="ROI médio" value={formatPercent(summary?.avg_roi)} icon={TrendingUp} isLoading={summaryLoading} />
        <KpiCard
          label="Faturamento potencial"
          value={formatCurrency(summary?.potential_revenue)}
          icon={DollarSign}
          isLoading={summaryLoading}
          className="col-span-2 lg:col-span-1"
        />
        <KpiCard
          label="Lucro potencial"
          value={formatCurrency(summary?.potential_profit)}
          icon={Wallet}
          isLoading={summaryLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TimeSeriesChart title="Oportunidades ao longo do tempo" data={charts?.opportunities_over_time} isLoading={chartsLoading} />
        <TimeSeriesChart
          title="Evolução de preços"
          data={charts?.price_evolution}
          isLoading={chartsLoading}
          valueFormatter={(v) => formatCurrency(v)}
        />
        <TimeSeriesChart title="Evolução da demanda" data={charts?.demand_evolution} isLoading={chartsLoading} color="hsl(38 92% 50%)" />
        <DistributionChart title="Distribuição de margens" data={charts?.margin_distribution} isLoading={chartsLoading} />
        <DistributionChart
          title="Distribuição de ROI"
          data={charts?.roi_distribution}
          isLoading={chartsLoading}
          color="hsl(221 83% 53%)"
        />
      </div>
    </div>
  );
}
