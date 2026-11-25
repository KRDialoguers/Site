import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Pin the project root to this folder, so a stray package-lock.json higher up
  // (e.g. in your home folder) doesn't confuse Next.js.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
