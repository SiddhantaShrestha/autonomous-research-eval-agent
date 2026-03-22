/** Strong / Moderate / Weak — thresholds per product spec. */
export type StrengthTier = "Strong" | "Moderate" | "Weak";

export function scoreStrengthTier(score: number): StrengthTier {
  if (score >= 8) return "Strong";
  if (score >= 6) return "Moderate";
  return "Weak";
}

export function confidenceFromGrounding(groundingScore: number): "High" | "Medium" | "Low" {
  if (groundingScore >= 8) return "High";
  if (groundingScore >= 6) return "Medium";
  return "Low";
}
