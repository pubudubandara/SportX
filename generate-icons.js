const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes for Android
const androidSizes = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
];

// Icon sizes for iOS
const iosSizes = [
  { size: 20, scale: 1, name: 'AppIcon-20x20@1x.png' },
  { size: 40, scale: 2, name: 'AppIcon-20x20@2x.png' },
  { size: 60, scale: 3, name: 'AppIcon-20x20@3x.png' },
  { size: 29, scale: 1, name: 'AppIcon-29x29@1x.png' },
  { size: 58, scale: 2, name: 'AppIcon-29x29@2x.png' },
  { size: 87, scale: 3, name: 'AppIcon-29x29@3x.png' },
  { size: 40, scale: 1, name: 'AppIcon-40x40@1x.png' },
  { size: 80, scale: 2, name: 'AppIcon-40x40@2x.png' },
  { size: 120, scale: 3, name: 'AppIcon-40x40@3x.png' },
  { size: 60, scale: 1, name: 'AppIcon-60x60@1x.png' },
  { size: 120, scale: 2, name: 'AppIcon-60x60@2x.png' },
  { size: 180, scale: 3, name: 'AppIcon-60x60@3x.png' },
  { size: 1024, scale: 1, name: 'AppIcon-1024x1024@1x.png' },
];

const sourceIcon = './assets/icon.png'; // You'll need to place your icon here

async function generateAndroidIcons() {
  console.log('Generating Android icons...');
  
  for (const { size, folder } of androidSizes) {
    const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', folder);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'ic_launcher.png');
    const roundOutputPath = path.join(outputDir, 'ic_launcher_round.png');
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(roundOutputPath);
    
    console.log(`✓ Generated ${folder}/ic_launcher.png (${size}x${size})`);
  }
}

async function generateiOSIcons() {
  console.log('\nGenerating iOS icons...');
  
  const outputDir = path.join(__dirname, 'ios', 'SportX', 'Images.xcassets', 'AppIcon.appiconset');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const { size, name } of iosSizes) {
    const outputPath = path.join(outputDir, name);
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }
}

async function generateIcons() {
  try {
    if (!fs.existsSync(sourceIcon)) {
      console.error(`❌ Source icon not found at: ${sourceIcon}`);
      console.log('Please place your icon.png file in the assets folder');
      return;
    }
    
    await generateAndroidIcons();
    await generateiOSIcons();
    
    console.log('\n✅ All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. For Android: Icons are ready to use');
    console.log('2. For iOS: Run "cd ios && pod install" then rebuild');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons();
