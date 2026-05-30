import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'horizons-cdn.hostinger.com',
      },
      {
        protocol: 'https',
        hostname: 'sdvapp.cloud',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/hcgi/platform/:path*',
        destination: 'http://127.0.0.1:8090/:path*',
      },
    ];
  },
};

export default nextConfig;
