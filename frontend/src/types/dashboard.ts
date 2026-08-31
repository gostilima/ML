export interface DashboardSummary {
  products_analyzed: number;
  opportunities_found: number;
  products_monitored: number;
  avg_margin: number;
  avg_roi: number;
  potential_revenue: number;
  potential_profit: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface DistributionBucket {
  label: string;
  count: number;
}

export interface DashboardCharts {
  opportunities_over_time: TimeSeriesPoint[];
  price_evolution: TimeSeriesPoint[];
  demand_evolution: TimeSeriesPoint[];
  margin_distribution: DistributionBucket[];
  roi_distribution: DistributionBucket[];
}
