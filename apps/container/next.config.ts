import type { NextConfig } from "next";

/**
 * Container (shell) of the micro-frontend.
 * Unknown paths are proxied to remote zones — the same composition pattern
 * used at scale with Next.js multi-zones:
 *
 *   /accounts/*  ->  REMOTE_ACCOUNTS_URL (default http://localhost:3001)
 *   /loans/*     ->  REMOTE_LOANS_URL    (default http://localhost:3002)
 */
const accountingUrl = process.env.REMOTE_ACCOUNTS_URL ?? "http://localhost:3001";
const loansUrl = process.env.REMOTE_LOANS_URL ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ["@fintech/ui"],
  async rewrites() {
    return [
      // Zone build assets resolve under the zone path (see assetPrefix in the zones).
      { source: "/accounts/_next/:path*", destination: `${accountingUrl}/_next/:path*` },
      { source: "/loans/_next/:path*", destination: `${loansUrl}/_next/:path*` },
      // Strip the zone prefix before proxying page routes.
      { source: "/accounts", destination: `${accountingUrl}/` },
      { source: "/accounts/:path*", destination: `${accountingUrl}/:path*` },
      { source: "/loans", destination: `${loansUrl}/` },
      { source: "/loans/:path*", destination: `${loansUrl}/:path*` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
