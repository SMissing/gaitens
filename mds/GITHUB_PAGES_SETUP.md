# GitHub Pages Deployment Setup

## ⚠️ Important Limitations

**GitHub Pages only serves static files**, which means:

- ❌ **API routes (`/api/*`) will NOT work** - All your API endpoints will fail
- ❌ **Server-side rendering** will NOT work - Pages must be pre-rendered
- ❌ **Server-side authentication** will NOT work - You'll need to refactor to client-side only
- ❌ **Dynamic routes** that fetch data server-side will NOT work

Your app currently uses many API routes for:
- Authentication (`/api/auth/*`)
- Staff management (`/api/staff`)
- Training (`/api/training`)
- Ideas (`/api/ideas`)
- Messages, grievances, meetings, etc.

**These will all break on GitHub Pages.**

## Better Alternatives

### Option 1: Vercel (Recommended) ⭐
- **Free tier** with excellent Next.js support
- **API routes work perfectly**
- **Automatic deployments** on every push
- **HTTPS and CDN** included

**Setup:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

### Option 2: Netlify
- Similar to Vercel
- Good Next.js support
- Free tier available

## If You Still Want GitHub Pages

### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. **Add Secrets to your GitHub repository:**
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
   **Note:** If your repository name is NOT `[username].github.io`, you'll need to set the base path:
   - Go to Settings → Secrets and variables → Actions → Variables
   - Add variable: `NEXT_PUBLIC_BASE_PATH` = `/[your-repo-name]` (e.g., `/GaitensLeisure`)

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

4. **The workflow will automatically:**
   - Build your app as static files
   - Deploy to GitHub Pages
   - Your site will be at: `https://[username].github.io/[repo-name]`

### What Will Break:

Since API routes won't work, you'll need to:

1. **Refactor authentication** to use Supabase client-side auth directly
2. **Remove all API route calls** and use Supabase client directly from components
3. **Convert server components** to client components that fetch data client-side
4. **Handle RLS policies** - Make sure your Supabase RLS policies allow client-side access

### Example Refactoring Needed:

**Before (API route):**
```typescript
// This won't work on GitHub Pages
const response = await fetch('/api/staff')
const staff = await response.json()
```

**After (Direct Supabase client):**
```typescript
// This will work
const supabase = createClientClient()
const { data: staff } = await supabase.from('users').select('*')
```

## Current Status

The GitHub Actions workflow is set up and ready. However, **your app will not function properly** without significant refactoring to remove API routes and convert to client-side Supabase calls.

**Recommendation:** Use Vercel instead for a working deployment without refactoring.
