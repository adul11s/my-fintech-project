import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/dashboard',
  transpilePackages: ["@repo/auth", "@repo/ui"],
};

export default nextConfig;