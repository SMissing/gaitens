/** @type {import('next').NextConfig} */
// Static export only for GitHub Pages (CI). Vercel sets VERCEL=1 — never export there
// or the build fails (API routes, cookies, <Html> during /404 prerender, etc.).
const isStaticExport =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' && !process.env.VERCEL

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
