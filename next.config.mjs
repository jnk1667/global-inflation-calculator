/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  // Modern browser targeting for smaller bundles
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
    browsersListForSwc: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
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
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'global-inflation-calculator-git-main-jonoki67-4086s-projects.vercel.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'global-inflation-calculator-ixi8huerk-jonoki67-4086s-projects.vercel.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      }
    ]
  },
}

export default nextConfig
