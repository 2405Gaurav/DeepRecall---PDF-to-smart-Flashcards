/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['pdf-parse', 'pg', 'otplib'],
};

module.exports = nextConfig;