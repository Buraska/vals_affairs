import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  // cacheComponents: true,
  images: {
    remotePatterns: [
      // Local dev: media via Payload API
      {
        hostname: 'localhost',
        pathname: '/api/media/file/**',
      },
      // Vercel Blob Storage (production)
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
