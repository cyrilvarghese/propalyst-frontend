/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Base path for production (e.g., '/app' or '/frontend')
  // Set via NEXT_PUBLIC_BASE_PATH environment variable
  // Leave empty string for root domain deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Asset prefix (optional, usually same as basePath)
  // Useful for CDN deployment
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',

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
      {
        protocol: 'https',
        hostname: 'ayxhtlzyhpsjykxxnqqh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
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
