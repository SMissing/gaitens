# PWA Setup Complete! 🎉

Your Gaitens Leisure Group Staff Portal is now a Progressive Web App (PWA)!

## What's Been Added

### ✅ Manifest File
- Created `/public/manifest.json` with app metadata
- Configured for standalone display mode
- Set dark theme colors

### ✅ Service Worker
- Created `/public/sw.js` for offline functionality
- Caches essential resources
- Automatically registers on page load

### ✅ PWA Meta Tags
- Added to `app/layout.tsx`
- iOS-specific meta tags for home screen installation
- Proper icon references

### ✅ Icon Generation Script
- Created `scripts/generate-icons.js`
- Generates all required icon sizes from your logo

## Next Steps

### 1. Generate Icons

Install Sharp (image processing library):
```bash
npm install --save-dev sharp
```

Then generate icons:
```bash
npm run generate-icons
```

This will create all required icon sizes in `/public/icons/` from your existing logo.

**Alternative:** If you prefer, you can use an online tool:
- Visit https://realfavicongenerator.net/
- Upload `/public/logos/gaitens-text-logo.png`
- Download and extract icons to `/public/icons/`

### 2. Test PWA Installation

**On iPhone:**
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear as a standalone app

**On Android:**
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will install as a standalone app

**On Desktop (Chrome/Edge):**
1. Look for the install icon in the address bar
2. Click "Install" to add to desktop

### 3. Verify Service Worker

1. Open DevTools (F12)
2. Go to Application tab
3. Check "Service Workers" section
4. You should see `/sw.js` registered and running

## Features Enabled

- ✅ **Installable** - Users can add to home screen
- ✅ **Offline Support** - Basic pages cached for offline access
- ✅ **Standalone Mode** - Runs without browser UI when installed
- ✅ **App-like Experience** - Full screen, no address bar
- ✅ **Fast Loading** - Cached resources load instantly

## Customization

### Update App Name
Edit `/public/manifest.json`:
```json
{
  "name": "Your Custom Name",
  "short_name": "Short Name"
}
```

### Update Theme Color
Edit `/public/manifest.json`:
```json
{
  "theme_color": "#your-color",
  "background_color": "#your-color"
}
```

Also update in `app/layout.tsx` metadata if needed.

### Add More Cached Resources
Edit `/public/sw.js` and add URLs to `urlsToCache` array.

## Troubleshooting

**Icons not showing:**
- Ensure icons are generated and in `/public/icons/`
- Check browser console for 404 errors
- Verify icon paths in `manifest.json`

**Service Worker not registering:**
- Check browser console for errors
- Ensure you're accessing via HTTPS (or localhost)
- Clear browser cache and reload

**Install prompt not appearing:**
- PWA must be served over HTTPS (or localhost)
- Manifest must be valid JSON
- Icons must exist and be accessible
- Service worker must be registered

## Production Deployment

When deploying to production:
1. Ensure HTTPS is enabled
2. Verify all icons are uploaded
3. Test installation on real devices
4. Check service worker registration

Your PWA is ready to go! 🚀
