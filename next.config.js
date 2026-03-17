/** @type {import('next').NextConfig} */
// Static export ONLY on GitHub Actions (see .github/workflows/deploy-pages.yml).
// On Vercel, NEXT_PUBLIC_STATIC_EXPORT may still be set in env vars, but VERCEL is
// not always visible when this file is evaluated — so we key off GITHUB_ACTIONS
// (only true on github.com runners). Never export on Vercel or the build fails.
const isStaticExport =
  process.env.GITHUB_ACTIONS === 'true' &&
  process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'

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
