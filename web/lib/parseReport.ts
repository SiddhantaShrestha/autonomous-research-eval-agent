/**
 * Split markdown report into sections by ## headings (research agent format).
 */
export function parseMarkdownSections(md: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = md.split(/\r?\n/);
  let currentTitle: string | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (currentTitle && buf.length) {
      map.set(normalizeHeading(currentTitle), buf.join("\n").trim());
    }
    buf.length = 0;
  };

  for (const line of lines) {
    const m = /^##\s+(.+)$/.exec(line);
    if (m) {
      flush();
      currentTitle = m[1].trim();
    } else if (currentTitle) {
      buf.push(line);
    }
  }
  flush();
  return map;
}

function normalizeHeading(h: string): string {
  return h.replace(/^\d+\.\s*/, "").trim().toLowerCase();
}

export function findSection(
  sections: Map<string, string>,
  ...needles: string[]
): string | null {
  for (const [key, body] of Array.from(sections.entries())) {
    for (const n of needles) {
      if (key.includes(n.toLowerCase())) return body;
    }
  }
  return null;
}

/** Turn body text into bullet items (lines starting with - or * or numbered). */
export function bodyToBullets(body: string): string[] {
  const items: string[] = [];
  for (const line of body.split(/\n/)) {
    const t = line.trim();
    if (!t) continue;
    const bullet = /^[-*•]\s+(.+)$/.exec(t);
    const num = /^\d+\.\s+(.+)$/.exec(t);
    if (bullet) items.push(bullet[1]);
    else if (num) items.push(num[1]);
    else if (items.length && t.length < 400) items.push(t);
    else if (!items.length && t.length > 0) items.push(t);
  }
  return items.length ? items : body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}
