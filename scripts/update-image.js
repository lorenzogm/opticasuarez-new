#!/usr/bin/env node

/**
 * Script to download and replace images from external URLs
 * Usage: node scripts/update-image.js <external-url> <target-path> [--dry-run]
 * 
 * Example:
 * node scripts/update-image.js "https://example.com/image.jpg" "/images/homepage/services/vision-binocular.webp"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, targetPath, dryRun = false) {
  try {
    console.log(`📥 Downloading image from: ${url}`);
    console.log(`🎯 Target path: ${targetPath}`);
    
    if (dryRun) {
      console.log('🔍 DRY RUN - No files will be modified');
      return;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure the directory exists
    const fullPath = path.join(__dirname, '..', 'public', targetPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    // Backup existing file if it exists
    if (fs.existsSync(fullPath)) {
      const backupPath = fullPath + '.backup';
      fs.copyFileSync(fullPath, backupPath);
      console.log(`💾 Backed up existing file to: ${backupPath}`);
    }

    fs.writeFileSync(fullPath, buffer);
    console.log(`✅ Successfully downloaded and saved image to: ${fullPath}`);
    console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error(`❌ Error downloading image: ${error.message}`);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
Usage: node scripts/update-image.js <external-url> <target-path> [--dry-run]

Arguments:
  <external-url>  The external URL of the image to download
  <target-path>   The target path relative to /public (e.g., /images/homepage/services/vision-binocular.webp)
  --dry-run       Preview the operation without making changes

Examples:
  node scripts/update-image.js "https://media.v2.siweb.es/example.jpg" "/images/homepage/services/vision-binocular.webp"
  node scripts/update-image.js "https://example.com/image.jpg" "/images/quienes-somos/team/juan-miguel.webp" --dry-run
`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

const [externalUrl, targetPath, ...flags] = args;
const dryRun = flags.includes('--dry-run');

// Validate inputs
if (!externalUrl.startsWith('http')) {
  console.error('❌ External URL must start with http:// or https://');
  process.exit(1);
}

if (!targetPath.startsWith('/images/')) {
  console.error('❌ Target path must start with /images/');
  process.exit(1);
}

// Run the download
downloadImage(externalUrl, targetPath, dryRun);