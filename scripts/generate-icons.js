// Script to generate PWA icons from logo
// Requires: npm install --save-dev sharp
// Run: node scripts/generate-icons.js

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputLogo = path.join(__dirname, '../assets/pngs/GaitensAppIcon.png')
const outputDir = path.join(__dirname, '../public/icons')

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generateIcons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(inputLogo)) {
      console.error(`Logo not found at: ${inputLogo}`)
      console.log('Please ensure the logo file exists before running this script.')
      process.exit(1)
    }

    console.log('Generating PWA icons...')
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)
      
      await sharp(inputLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 1 } // Pure black background
        })
        .png()
        .toFile(outputPath)
      
      console.log(`✓ Generated ${size}x${size} icon`)
    }
    
    console.log('\n✅ All icons generated successfully!')
    console.log(`Icons saved to: ${outputDir}`)
  } catch (error) {
    console.error('Error generating icons:', error.message)
    console.log('\nTip: Install sharp first: npm install --save-dev sharp')
    process.exit(1)
  }
}

generateIcons()
