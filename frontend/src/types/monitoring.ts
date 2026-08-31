import type { DataField } from "@/types/common";

export type MonitoringStatus = "OK" | "ALERTA" | "CRITICO" | "PAUSADO";

export interface MonitoringItem {
  id: string;
  product_id: string | null;
  product_name: string;
  image_url: string | null;
  current_price: number;
  price_change_percent: number | null;
  estimated_monthly_sales: DataField<number> | null;
  status: MonitoringStatus;
  last_checked_at: string | null;
  alerts_count: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}
