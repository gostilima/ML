"use client";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Small "ⓘ Estimativa" indicator shown next to any value whose backing
 * field carries `data_type === "estimated"`. Renders nothing when the
 * field is a real/measured value.
 */
export function EstimatedBadge({
  dataType,
  className,
}: {
  dataType?: "estimated" | "real" | null;
  className?: string;
}) {
  if (dataType !== "estimated") return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning cursor-default align-middle",
            className
          )}
        >
          <Info className="h-3 w-3" /> Estimativa
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Este valor é uma estimativa e não representa necessariamente vendas reais do produto.
      </TooltipContent>
    </Tooltip>
  );
}
