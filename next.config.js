/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.squareyards.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Fix for @tavily/core module resolution (uses Node.js modules)
  experimental: {
    serverComponentsExternalPackages: ['@tavily/core'],
  },
}

module.exports = nextConfig
