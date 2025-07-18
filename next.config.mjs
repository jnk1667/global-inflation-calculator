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
