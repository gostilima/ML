import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  isLoading,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {isLoading ? <Skeleton className="mt-1 h-7 w-24" /> : <p className="text-2xl font-semibold">{value}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary")}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
