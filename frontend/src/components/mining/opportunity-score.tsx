import type { OpportunityClassification, OpportunityScore } from "@/types/common";
import { cn } from "@/lib/utils";

const CLASSIFICATION_LABEL: Record<OpportunityClassification, string> = {
  EXCELENTE: "Excelente",
  BOA: "Boa",
  MODERADA: "Moderada",
  BAIXA: "Baixa",
  DESCARTAR: "Descartar",
};

const CLASSIFICATION_COLOR: Record<OpportunityClassification, string> = {
  EXCELENTE: "text-success",
  BOA: "text-success",
  MODERADA: "text-warning",
  BAIXA: "text-warning",
  DESCARTAR: "text-destructive",
};

const BAR_LABEL: Record<keyof OpportunityScore["breakdown"], string> = {
  demanda: "Demanda",
  consistencia: "Consistência",
  margem: "Margem",
  concorrencia: "Concorrência",
  crescimento: "Crescimento",
  logistica: "Logística",
  recompra: "Recompra",
};

export function OpportunityScoreBadge({ score, classification }: Pick<OpportunityScore, "score" | "classification">) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("text-lg font-bold", CLASSIFICATION_COLOR[classification])}>{Math.round(score)}</span>
      <span className="text-xs text-muted-foreground">/100</span>
      <span className={cn("text-xs font-medium", CLASSIFICATION_COLOR[classification])}>
        {CLASSIFICATION_LABEL[classification]}
      </span>
    </div>
  );
}

export function OpportunityScorePanel({ score, classification, breakdown }: OpportunityScore) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Opportunity Score</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", CLASSIFICATION_COLOR[classification])}>
              {Math.round(score)}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-semibold",
            classification === "DESCARTAR" ? "bg-destructive/10" : "bg-muted",
            CLASSIFICATION_COLOR[classification]
          )}
        >
          {CLASSIFICATION_LABEL[classification]}
        </span>
      </div>

      <div className="space-y-2">
        {(Object.keys(breakdown) as (keyof OpportunityScore["breakdown"])[]).map((key) => {
          const value = breakdown[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{BAR_LABEL[key]}</span>
                <span className="font-medium">{Math.round(value)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
