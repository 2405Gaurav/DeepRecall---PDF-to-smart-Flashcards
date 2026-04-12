/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['pdf-parse', 'pg', 'bcryptjs', 'jsonwebtoken'],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;