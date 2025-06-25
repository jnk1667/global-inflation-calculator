/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    staticGenerationTimeout: 60,
    staticGenerationMaxConcurrency: 1,
  },
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

export default nextConfig
