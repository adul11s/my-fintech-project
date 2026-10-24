import type { NextConfig } from "next";

/**
 * Loans zone (remote). See apps/accounts/next.config.ts for the ASSET_BASE pattern.
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
