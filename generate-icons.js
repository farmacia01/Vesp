const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'artes', 'AI Background Image Addition.svg');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('Generated icon-192.png');
      
    // Generate 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('Generated icon-512.png');
      
    // Generate 180x180 (apple-touch-icon)
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');
    
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
