/**
 * Split executive summary into scannable bullets + optional remainder narrative.
 */
export function formatExecutiveSummary(text: string): {
  bullets: string[];
  remainder: string;
} {
  const t = text.trim();
  if (!t) return { bullets: [], remainder: "" };

  const sentences = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length <= 2) {
    return { bullets: [], remainder: t };
  }

  const maxBullets = 4;
  const bullets: string[] = [];
  for (let i = 0; i < Math.min(maxBullets, sentences.length - 1); i++) {
    const s = sentences[i];
    if (s.length > 320) break;
    bullets.push(s);
  }

  if (bullets.length < 2) {
    return { bullets: [], remainder: t };
  }

  const remainder = sentences.slice(bullets.length).join(" ").trim();
  return { bullets, remainder };
}
