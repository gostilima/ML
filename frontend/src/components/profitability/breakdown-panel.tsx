import type { ProfitabilityBreakdown } from "@/types/profitability";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ROWS: { key: keyof ProfitabilityBreakdown; label: string; type: "currency" | "percent" }[] = [
  { key: "sale_price", label: "Preço de venda", type: "currency" },
  { key: "commission", label: "Comissão ML", type: "currency" },
  { key: "logistics_cost", label: "Logística", type: "currency" },
  { key: "fees", label: "Taxas", type: "currency" },
  { key: "taxes", label: "Impostos", type: "currency" },
  { key: "supplier_freight", label: "Frete fornecedor", type: "currency" },
  { key: "supplier_cost", label: "Custo fornecedor", type: "currency" },
];

export function ProfitabilityBreakdownPanel({ breakdown }: { breakdown: ProfitabilityBreakdown }) {
  return (
    <div className="space-y-4">
      <div className="divide-y rounded-md border">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{formatCurrency(breakdown[row.key] as number)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Lucro" value={formatCurrency(breakdown.profit)} highlight={breakdown.profit >= 0} />
        <Metric label="Margem" value={formatPercent(breakdown.margin)} highlight={breakdown.margin >= 0} />
        <Metric label="ROI" value={formatPercent(breakdown.roi)} highlight={breakdown.roi >= 0} />
        <Metric label="Markup" value={formatPercent(breakdown.markup)} highlight={breakdown.markup >= 0} />
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold", highlight ? "text-success" : "text-destructive")}>{value}</p>
    </div>
  );
}
