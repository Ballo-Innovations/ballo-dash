/**
 * Paths that may be reached without signing in (H-01). Everything else
 * requires a session. Keep this list short and add a comment for each entry.
 * Edge-safe: no Node imports.
 */
const PUBLIC_EXACT = new Set([
  "/login",
  "/signup", // K-02 self-service sign-up
  "/forgot-password", // K-02
  "/reset-password", // K-02
  "/verify-email", // K-02
  "/favicon.ico",
  "/robots.txt",
  "/t.js", // C-05 web tracker snippet
  "/api/health", // K-05 health check
  "/api/collect", // C-05 tracker events (rate limited)
]);

const PUBLIC_PREFIXES = [
  "/_next/", // framework assets
  "/videos/", // login background
  "/images/",
  "/api/auth/", // NextAuth sign-in and session endpoints
  "/api/public/", // explicitly public, rate-limited endpoints (sign-up, password reset, surveys)
  "/s/", // S-02 public survey pages
];

export function isPublicPath(pathname: string): boolean {
  // Reject traversal-looking paths outright rather than normalising them.
  if (pathname.includes("..") || pathname.includes("//")) return false;
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}
