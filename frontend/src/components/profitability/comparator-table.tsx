import { Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProfitabilityComparison } from "@/types/profitability";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LOGISTICS_LABEL: Record<string, string> = {
  FULL: "Full",
  MERCADO_ENVIOS: "Mercado Envios",
  PROPRIA: "Própria",
};

export function ProfitabilityComparatorTable({ comparison }: { comparison: ProfitabilityComparison }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modalidade</TableHead>
          <TableHead>Logística</TableHead>
          <TableHead>Comissão</TableHead>
          <TableHead>Lucro</TableHead>
          <TableHead>Margem</TableHead>
          <TableHead>ROI</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparison.items.map((item) => (
          <TableRow key={item.logistics} className={cn(item.is_best && "bg-success/5")}>
            <TableCell className="font-medium">
              <span className="inline-flex items-center gap-2">
                {LOGISTICS_LABEL[item.logistics] ?? item.logistics}
                {item.is_best && <Award className="h-4 w-4 text-success" />}
              </span>
            </TableCell>
            <TableCell>{formatCurrency(item.breakdown.logistics_cost)}</TableCell>
            <TableCell>{formatCurrency(item.breakdown.commission)}</TableCell>
            <TableCell className={item.breakdown.profit >= 0 ? "text-success" : "text-destructive"}>
              {formatCurrency(item.breakdown.profit)}
            </TableCell>
            <TableCell>{formatPercent(item.breakdown.margin)}</TableCell>
            <TableCell>{formatPercent(item.breakdown.roi)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
