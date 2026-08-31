import type { DataField } from "@/types/common";

export type AdStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "UNDER_REVIEW";

export interface Advertisement {
  id: string;
  ml_item_id: string;
  title: string;
  image_url: string | null;
  price: number;
  status: AdStatus;
  estimated_visits: DataField<number> | null;
  estimated_conversion_rate: DataField<number> | null;
  sold_quantity: number | null;
  available_quantity: number | null;
  permalink: string | null;
}
