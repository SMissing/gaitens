/** @type {import('next').NextConfig} */
// Static export ONLY for the GitHub Pages workflow. Set GITHUB_PAGES_BUILD there only.
// Do NOT set this on Vercel — and remove NEXT_PUBLIC_STATIC_EXPORT from Vercel env
// if present (it used to trigger export and breaks API routes / prerender).
const isStaticExport = process.env.GITHUB_PAGES_BUILD === 'true'

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ycfemtinonheyjtndyrm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    ...(isStaticExport && { unoptimized: true }),
  },
  async headers() {
    if (isStaticExport) {
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
