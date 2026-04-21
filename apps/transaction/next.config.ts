import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/transaction',
    transpilePackages: ["@repo/auth","@repo/ui"],
};

export default nextConfig;