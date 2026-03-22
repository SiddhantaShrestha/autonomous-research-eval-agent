/**
 * Evaluate endpoint URL.
 * - Production (Vercel): set **NEXT_PUBLIC_API_URL** or **NEXT_PUBLIC_API_BASE_URL** to your Render
 *   origin (no trailing slash), e.g. https://your-api.onrender.com — requests go to /api/evaluate there.
 * - Local dev: leave both unset to use the Next.js route /api/evaluate (proxies to local Python).
 */
export function getEvaluateUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) {
    const base = raw.replace(/\/$/, "");
    return `${base}/api/evaluate`;
  }
  return "/api/evaluate";
}
