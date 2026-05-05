import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Stable typed routes — gives TypeScript errors on invalid <Link href>
  typedRoutes: true,
  // Cache Components — use the `use cache` directive for component-level caching
  cacheComponents: true,

  // Turbopack configuration (default dev bundler in Next.js 16)
  // Add custom rules/aliases here if needed.
  turbopack: {},
};

export default nextConfig;
