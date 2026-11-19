/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Type and lint errors fail the build (H-05).
  eslint: { dirs: ["src"] },
  // Sass adds a byte-order mark to CSS that contains non-ASCII characters; once
  // Next concatenates stylesheets it lands mid-file and PostCSS 8.5 rejects it.
  sassOptions: { charset: false },
  webpack(config, { isServer }) {
    if (isServer) {
      // Browser-only library; keep it out of the server bundle.
      config.externals = ["react-syntax-highlighter", ...config.externals];
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.google.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
