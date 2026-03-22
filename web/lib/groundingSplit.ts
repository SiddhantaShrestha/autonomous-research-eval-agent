/**
 * Split grounding strings into "unsupported vs. source" vs "limited evidence / hard to verify"
 * using lightweight heuristics (no backend changes).
 */

const LIMITED_EVIDENCE_RE =
  /\b(insufficient|limited evidence|not enough evidence|cannot (?:be )?verif|hard to verif|difficult to verif|sparse|narrow (?:evidence|passages?)|partial (?:support|visibility)|lack(?:s| of) (?:detail|data)|unclear (?:whether|if)|does not provide enough|little (?:detail|information)|few (?:details|passages))\b/i;

/** Lines that read as "not enough material to check" rather than "contradicted / absent in source". */
export function isLimitedEvidenceWording(text: string): boolean {
  return LIMITED_EVIDENCE_RE.test(text.trim());
}

export function partitionUnsupportedPoints(points: string[]): {
  unsupportedClaims: string[];
  notVerifiableLimitedEvidence: string[];
} {
  const unsupportedClaims: string[] = [];
  const notVerifiableLimitedEvidence: string[] = [];
  for (const p of points) {
    const t = p.trim();
    if (!t) continue;
    if (isLimitedEvidenceWording(t)) notVerifiableLimitedEvidence.push(t);
    else unsupportedClaims.push(t);
  }
  return { unsupportedClaims, notVerifiableLimitedEvidence };
}

/** Notes that reinforce limitations / verification bounds (not purely affirmative). */
const LIMITING_NOTE_RE =
  /\b(could benefit|more (?:critical|detail)|limitation|limited|insufficient|not enough|verify|verification|bias|uncertain|gap)\b/i;

export function partitionGroundingNotes(notes: string[]): {
  limiting: string[];
  other: string[];
} {
  const limiting: string[] = [];
  const other: string[] = [];
  for (const n of notes) {
    const t = n.trim();
    if (!t) continue;
    if (LIMITING_NOTE_RE.test(t) && !/well-supported|aligns? with|supports the key/i.test(t)) limiting.push(t);
    else other.push(t);
  }
  return { limiting, other };
}
