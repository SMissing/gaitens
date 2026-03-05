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

Vercel automatically:
- Builds your Next.js app
- Deploys on every push to main
- Provides HTTPS and CDN
- Handles serverless functions for API routes

## Option 2: GitHub Pages (Static Export)

If you want to use GitHub Pages, you'll need to export as static HTML. However, this won't work with:
- API routes (`/api/*`)
- Server Components that fetch data
- Authentication (Supabase client-side only)

To set up static export:

1. Update `next.config.js`:
```js
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
}
```

2. Build and deploy:
```bash
npm run build
# Then push the 'out' folder to gh-pages branch
```

## Option 3: Other Platforms

- **Netlify**: Similar to Vercel, good Next.js support
- **Railway**: Good for full-stack apps
- **Render**: Simple deployment platform
