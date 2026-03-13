/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Base path for GitHub Pages (if repo name is not username.github.io)
  // Set NEXT_PUBLIC_BASE_PATH to your repo name, e.g., '/GaitensLeisure'
  ...(process.env.NEXT_PUBLIC_BASE_PATH && { basePath: process.env.NEXT_PUBLIC_BASE_PATH }),
  ...(process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' && { trailingSlash: true }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ycfemtinonheyjtndyrm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Unoptimized images for static export (GitHub Pages)
    unoptimized: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true',
  },
  // Static export for GitHub Pages
  // WARNING: This disables API routes and server-side rendering
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ? 'export' : undefined,
  // Ensure service worker and manifest are served correctly
  // Note: headers() don't work with static export
  async headers() {
    // Skip headers for static export
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
      return []
    }
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
