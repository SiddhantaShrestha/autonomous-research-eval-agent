import type { PipelineResponse } from "./types";

/**
 * One-sentence product insight from existing scores and flags (no extra API).
 * Tone: professional, neutral, precise — not alarmist.
 */
export function deriveInsight(r: PipelineResponse): string {
  const ev = r.evaluation.score;
  const g = r.grounding.grounding_score;
  const nIssues = r.evaluation.issues.length;
  const nUnsup = r.grounding.unsupported_points.length;

  if (ev >= 8 && g >= 8 && nUnsup === 0 && nIssues <= 1) {
    return "Strong quality and alignment with the uploaded source—the report is well supported by the retrieved evidence.";
  }
  if (g < 6) {
    return "The available source material is limited, so many claims cannot be strongly verified. Treat this output as tentative and review the evidence directly.";
  }
  if (ev < 6) {
    return "Overall report quality has room to improve—clarity, completeness, or use of evidence may need attention before you rely on it.";
  }
  if (nUnsup >= 3 || nIssues >= 3) {
    return "Several items were flagged or not strongly supported; prioritize checking them against the source before acting on this report.";
  }
  if (g >= 8 && ev < 7.5) {
    return "Evidence support is strong, but organization or completeness could still be improved for readers.";
  }
  if (ev >= 7 && g >= 7 && (nUnsup > 0 || nIssues > 0)) {
    return "Reasonably solid output, with a few points that are not fully supported by the retrieved passages.";
  }
  return "Directionally useful—review flagged items and the source material before high-stakes decisions.";
}
