# Deployment Guide

## Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications:

1. Go to [vercel.com](https://vercel.com) and sign up/login with your GitHub account
2. Click "New Project" and import your repository: `SMissing/glg`
3. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click "Deploy"
5. Your app will be live at `https://glg.vercel.app` (or your custom domain)

**Vercel env:** Do **not** set `GITHUB_PAGES_BUILD` or `NEXT_PUBLIC_STATIC_EXPORT` (those are only for the GitHub Pages workflow). Set `NODE_ENV` to `production` or leave it unset. Use the default output (not `out`).

Vercel automatically:
- Builds your Next.js app
- Deploys on every push to main
- Provides HTTPS and CDN
- Handles serverless functions for API routes

## Option 2: GitHub Pages (Static Export)

The repo uses `.github/workflows/deploy-pages.yml`, which sets **`GITHUB_PAGES_BUILD=true`** during `npm run build` so `next.config.js` enables `output: 'export'`. That flow is limited (no real API routes on Pages). **Vercel does not use that variable.**

## Option 3: Other Platforms

- **Netlify**: Similar to Vercel, good Next.js support
- **Railway**: Good for full-stack apps
- **Render**: Simple deployment platform
