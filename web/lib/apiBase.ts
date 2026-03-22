/**
 * Evaluate endpoint URL.
 * - Production (Vercel): set NEXT_PUBLIC_API_URL to your Render service origin (no trailing slash),
 *   e.g. https://research-eval-api.onrender.com — requests go to that host + /api/evaluate.
 * - Local dev: leave unset to use the Next.js route /api/evaluate (proxies to local Python).
 */
export function getEvaluateUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    const base = raw.replace(/\/$/, "");
    return `${base}/api/evaluate`;
  }
  return "/api/evaluate";
}
