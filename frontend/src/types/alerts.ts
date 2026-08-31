export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}
