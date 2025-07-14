/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },

  // Headers for better SEO and performance
  async headers() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'global-inflation-calculator-git-main-jonoki67-4086s-projects.vercel.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'global-inflation-calculator-ixi8huerk-jonoki67-4086s-projects.vercel.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/data/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/calculator',
        destination: '/',
        permanent: true,
      },
      {
        source: '/inflation-calculator',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
