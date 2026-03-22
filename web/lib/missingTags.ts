/**
 * Derive compact "missing info" tags from free-text lists (keyword heuristics).
 */
const PATTERNS: { re: RegExp; tag: string }[] = [
  { re: /\b(cost|price|fee|budget|pricing)\b/i, tag: "Cost" },
  { re: /\b(audience|attendee|participant|student|trainee)\b/i, tag: "Target audience" },
  { re: /\b(duration|length|hours?|schedule|timeline)\b/i, tag: "Duration" },
  { re: /\b(instructor|facilitator|trainer|speaker)\b/i, tag: "Instructor info" },
  { re: /\b(location|venue|address|where)\b/i, tag: "Location" },
  { re: /\b(outcome|objective|result|kpi|metric)\b/i, tag: "Outcomes" },
  { re: /\b(program|module|curriculum|syllabus)\b/i, tag: "Program structure" },
  { re: /\b(date|deadline|when)\b/i, tag: "Dates" },
  { re: /\b(contact|email|phone)\b/i, tag: "Contact" },
  { re: /\b(evidence|source|citation)\b/i, tag: "Evidence" },
];

export function deriveMissingTags(lines: string[]): string[] {
  const seen = new Set<string>();
  for (const line of lines) {
    for (const { re, tag } of PATTERNS) {
      if (re.test(line)) seen.add(tag);
    }
  }
  return Array.from(seen).sort();
}
