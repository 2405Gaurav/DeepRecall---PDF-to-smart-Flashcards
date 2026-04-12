/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['pdf-parse', 'pg', 'bcryptjs', 'jsonwebtoken'],
};

module.exports = nextConfig;