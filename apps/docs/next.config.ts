import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/docs',
  transpilePackages: ["@repo/auth", "@repo/ui"],
};

export default nextConfig;