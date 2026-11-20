/**
 * Ballo Dash web app (Next.js 16, Pages Router, Turbopack).
 *
 * All data comes from the API (ballo-dash-api). The browser only talks to this
 * app's domain: /api/* is forwarded to API_ORIGIN, so the API's session cookie
 * is first-party and no CORS is needed.
 */
const apiOrigin = process.env.API_ORIGIN;
if (!apiOrigin && process.env.NODE_ENV === "production") {
  throw new Error("API_ORIGIN must be set (the Ballo Dash API base URL, e.g. https://api.example.com)");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Sass adds a byte-order mark to CSS that contains non-ASCII characters; once
  // stylesheets are concatenated it lands mid-file and PostCSS rejects it.
  sassOptions: { charset: false },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin ?? "http://localhost:3001"}/api/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.google.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
