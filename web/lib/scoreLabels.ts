type Tone = "good" | "mid" | "low";

export function evaluationTone(score: number): Tone {
  if (score >= 8) return "good";
  if (score >= 6) return "mid";
  return "low";
}

export function groundingTone(score: number): Tone {
  if (score >= 8) return "good";
  if (score >= 6) return "mid";
  return "low";
}

export function evaluationHelper(score: number): string {
  if (score >= 8) return "Strong overall quality";
  if (score >= 6) return "Good overall quality";
  if (score >= 4) return "Mixed quality — room to improve";
  return "Needs significant improvement";
}

/** How well report claims are supported by retrieved evidence (not “correctness” in the abstract). */
export function groundingHelper(score: number): string {
  if (score >= 8) return "Strongly supported by evidence";
  if (score >= 5) return "Partially supported, some uncertainty";
  return "Weak support or insufficient evidence";
}

export function revisionHelper(skipped: boolean, changed?: boolean): string {
  if (skipped) return "High score — draft kept as final";
  if (changed === false) return "Reviewed — text unchanged";
  return "Output refined after review";
}

export function toneClasses(tone: Tone): { border: string; text: string } {
  switch (tone) {
    case "good":
      return {
        border: "border-emerald-500/25",
        text: "text-emerald-400/90",
      };
    case "mid":
      return {
        border: "border-amber-500/25",
        text: "text-amber-400/90",
      };
    default:
      return {
        border: "border-red-500/25",
        text: "text-red-400/90",
      };
  }
}
