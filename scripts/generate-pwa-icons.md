# PWA Icon Generation Guide

To generate PWA icons, you can use one of these methods:

## Option 1: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `/logos/gaitens-text-logo.png` or `/logos/gaitens-logo-white.png`
3. Generate icons for all sizes
4. Download and extract to `/public/icons/`

## Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:
```bash
# Create icons directory
mkdir -p public/icons

# Generate icons from logo
convert public/logos/gaitens-text-logo.png -resize 72x72 public/icons/icon-72x72.png
convert public/logos/gaitens-text-logo.png -resize 96x96 public/icons/icon-96x96.png
convert public/logos/gaitens-text-logo.png -resize 128x128 public/icons/icon-128x128.png
convert public/logos/gaitens-text-logo.png -resize 144x144 public/icons/icon-144x144.png
convert public/logos/gaitens-text-logo.png -resize 152x152 public/icons/icon-152x152.png
convert public/logos/gaitens-text-logo.png -resize 192x192 public/icons/icon-192x192.png
convert public/logos/gaitens-text-logo.png -resize 384x384 public/icons/icon-384x384.png
convert public/logos/gaitens-text-logo.png -resize 512x512 public/icons/icon-512x512.png
```

## Option 3: Using Sharp (Node.js)
Install sharp: `npm install --save-dev sharp`
Then create a script to generate icons.

## Required Icon Sizes
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

All icons should be PNG format with transparent or dark background.
