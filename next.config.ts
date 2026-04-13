import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['unpdf', 'pg', 'bcryptjs', 'jsonwebtoken'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;