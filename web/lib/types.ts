export type EvaluationPayload = {
  score: number;
  relevance: number;
  completeness: number;
  clarity: number;
  evidence_usage: number;
  issues: string[];
  suggested_fixes: string[];
};

export type GroundingPayload = {
  grounding_score: number;
  supported_points: string[];
  unsupported_points: string[];
  notes: string[];
};

export type PipelineResponse = {
  final_report: string;
  evaluation: EvaluationPayload;
  grounding: GroundingPayload;
  revision_skipped: boolean;
  revision_changed?: boolean;
  source_filename: string;
  chunks_count: number;
  unique_sources: string[];
};
