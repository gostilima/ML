import { Badge } from "@/components/ui/badge";
import type { MLConnectionStatus } from "@/types/integrations";
import { CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react";

const CONFIG: Record<MLConnectionStatus, { label: string; variant: "success" | "secondary" | "warning" | "destructive"; icon: typeof CheckCircle2 }> = {
  CONNECTED: { label: "Conectado", variant: "success", icon: CheckCircle2 },
  DISCONNECTED: { label: "Desconectado", variant: "secondary", icon: Circle },
  EXPIRED: { label: "Expirado", variant: "warning", icon: AlertTriangle },
  ERROR: { label: "Erro", variant: "destructive", icon: XCircle },
};

export function MLStatusBadge({ status }: { status: MLConnectionStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.DISCONNECTED;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="gap-1">
      <Icon className="h-3.5 w-3.5" /> {cfg.label}
    </Badge>
  );
}
