/** Central UI copy for evaluation / grounding messaging (professional, neutral). */

export const COPY = {
  unsupportedEmpty:
    "No clearly unsupported claims were identified in the output based on the available evidence.",
  insufficientEvidenceWeakGrounding:
    "The source material is insufficient to verify many of the claims made in the report.",
  notVerifiableWhenEmpty:
    "No items were singled out as impossible to verify solely due to limited evidence.",
  evidenceLimitationsTitle: "Evidence limitations",
} as const;

export function descriptiveVsAnalyticalLine(): string {
  return "This check measures overlap with retrieved passages, not whether every argument is logically complete.";
}

export function claimVerificationLine(chunksCount: number): string {
  if (chunksCount <= 3) {
    return "Few passages were retrieved, so line-by-line claim verification may be limited.";
  }
  return "Claim-level checks depend on retrieval coverage; they are not a substitute for reading the full source.";
}
