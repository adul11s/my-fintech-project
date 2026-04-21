import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/auth", "@repo/ui"],
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: 'http://localhost:3001/docs/:path*',
      },
      {
        source: '/dashboard',
        destination: 'http://localhost:3002/dashboard',
      },
      {
        source: '/dashboard/:path*',
        destination: 'http://localhost:3002/dashboard/:path*',
      },
      {
        source: '/transaction',
        destination: 'http://localhost:3003/transaction',
      },
      {
        source: '/transaction/:path*',
        destination: 'http://localhost:3003/transaction/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3004/api/:path*',
      },
    ];
  },
};

export default nextConfig;