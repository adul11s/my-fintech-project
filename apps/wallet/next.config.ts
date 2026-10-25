import type { NextConfig } from "next";

// ZON-AWARE asset: container men-proxy /auth/* ke zone ini (kalau ZONE_PREFIX aktif),
// sehingga chunk assets harus bawa prefix agar hydrasi kejadian via container.
const zonePrefix = process.env.ZONE_PREFIX ?? "";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  assetPrefix: zonePrefix ? `${zonePrefix}` : undefined,
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
