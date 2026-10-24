import type { NextConfig } from "next";

/**
 * Accounts zone (remote).
 * ASSET_BASE (e.g. "/accounts") is set only when the zone is composed
 * behind the container — asset URLs then resolve under the zone's path and the
 * container proxies /accounts/_next/* back to this app. Standalone runs
 * (dev/preview) leave it unset.
 */
const assetBase = process.env.ASSET_BASE;

const nextConfig: NextConfig = {
  cacheComponents: true,
  ...(assetBase ? { assetPrefix: assetBase } : {}),
  transpilePackages: ["@fintech/ui"],
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
