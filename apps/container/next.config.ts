import type { NextConfig } from "next";

/**
 * Container (shell) QUPI — zona:
 *   /auth/*     -> REMOTE_AUTH_URL     (default http://localhost:3001)
 *   /wallet/*   -> REMOTE_WALLET_URL   (default http://localhost:3002)
 *   /credit/*   -> REMOTE_CREDIT_URL   (default http://localhost:3003)
 * Halaman utama QUPI (topup/transfer/qris/tagihan/paylater/riwayat/profil)
 * berada di container itu sendiri — build sederhana, bukan multi-zone federasi.
 */
const authUrl = process.env.REMOTE_AUTH_URL ?? "http://localhost:3001";
const walletUrl = process.env.REMOTE_WALLET_URL ?? "http://localhost:3002";
const creditUrl = process.env.REMOTE_CREDIT_URL ?? "http://localhost:3003";

const zone = (name: string, url: string) => [
  { source: `/${name}/_next/:path*`, destination: `${url}/_next/:path*` },
  { source: `/${name}`, destination: `${url}/` },
  { source: `/${name}/:path*`, destination: `${url}/:path*` },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ["@fintech/ui", "@fintech/api-client"],
  async rewrites() {
    return [...zone("auth", authUrl), ...zone("wallet", walletUrl), ...zone("credit", creditUrl)];
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
