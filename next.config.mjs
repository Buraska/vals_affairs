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
    qualities: [5, 10, 25, 50, 75],
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
      {
        protocol: 'https',
        hostname: `${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`,
        pathname: `/**`,
      },
      // new URL(`${process.env.R2_ENDPOINT}/**`),
      // YouTube video thumbnails
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  output: 'standalone',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
