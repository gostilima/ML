"use client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state";
import { formatDate } from "@/lib/utils";
import type { DistributionBucket, TimeSeriesPoint } from "@/types/dashboard";

const PRIMARY = "hsl(221 83% 53%)";
const SECONDARY = "hsl(142 71% 45%)";

export function TimeSeriesChart({
  title,
  data,
  isLoading,
  color = PRIMARY,
  valueFormatter,
}: {
  title: string;
  data?: TimeSeriesPoint[];
  isLoading?: boolean;
  color?: string;
  valueFormatter?: (v: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Sem dados suficientes." description="Os dados aparecerão aqui assim que houver histórico." className="py-10" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} fontSize={12} />
              <YAxis fontSize={12} tickFormatter={valueFormatter} width={60} />
              <Tooltip labelFormatter={(d) => formatDate(d as string)} formatter={(v: number) => (valueFormatter ? valueFormatter(v) : v)} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function DistributionChart({
  title,
  data,
  isLoading,
  color = SECONDARY,
}: {
  title: string;
  data?: DistributionBucket[];
  isLoading?: boolean;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Sem dados suficientes." description="Os dados aparecerão aqui assim que houver produtos analisados." className="py-10" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} width={40} />
              <Tooltip />
              <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
