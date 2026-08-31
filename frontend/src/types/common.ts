export type LogisticsType = "FULL" | "MERCADO_ENVIOS" | "PROPRIA";

export type TrendDirection = "CRESCENTE" | "ESTAVEL" | "DECRESCENTE";

export type CompetitionLevel = "BAIXA" | "MEDIA" | "ALTA";

export interface DataField<T> {
  value: T;
  data_type: "estimated" | "real";
}

export interface OpportunityScoreBreakdown {
  demanda: number;
  consistencia: number;
  margem: number;
  concorrencia: number;
  crescimento: number;
  logistica: number;
  recompra: number;
}

export type OpportunityClassification =
  | "EXCELENTE"
  | "BOA"
  | "MODERADA"
  | "BAIXA"
  | "DESCARTAR";

export interface OpportunityScore {
  score: number;
  classification: OpportunityClassification;
  breakdown: OpportunityScoreBreakdown;
}
