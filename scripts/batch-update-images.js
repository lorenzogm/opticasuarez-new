#!/usr/bin/env node

/**
 * Batch script to process multiple image updates
 * Usage: node scripts/batch-update-images.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, targetPath, name) {
  try {
    console.log(`📥 [${name}] Downloading from: ${url}`);
    
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
      console.log(`📁 [${name}] Created directory: ${dir}`);
    }

    // Backup existing file if it exists
    if (fs.existsSync(fullPath)) {
      const backupPath = fullPath + '.backup';
      fs.copyFileSync(fullPath, backupPath);
      console.log(`💾 [${name}] Backed up existing file`);
    }

    fs.writeFileSync(fullPath, buffer);
    console.log(`✅ [${name}] Successfully saved (${(buffer.length / 1024).toFixed(2)} KB)`);
    
    return true;
  } catch (error) {
    console.error(`❌ [${name}] Error: ${error.message}`);
    return false;
  }
}

async function processImageMapping(dryRun = false) {
  const mappingPath = path.join(__dirname, 'image-mapping.json');
  
  if (!fs.existsSync(mappingPath)) {
    console.error('❌ image-mapping.json not found');
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const allImages = [];

  // Collect all images from the mapping
  Object.entries(mapping.images_to_update).forEach(([section, categories]) => {
    Object.entries(categories).forEach(([category, images]) => {
      images.forEach(image => {
        allImages.push({
          ...image,
          section,
          category
        });
      });
    });
  });

  console.log(`🔍 Found ${allImages.length} images to process`);
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN - Preview of images to update:');
    allImages.forEach((image, index) => {
      console.log(`${index + 1}. [${image.section}/${image.category}] ${image.name}`);
      console.log(`   Path: ${image.current_path}`);
      console.log(`   URL: ${image.external_url}`);
      console.log(`   Status: ${image.status}`);
      console.log('');
    });
    return;
  }

  // Filter only images with actual URLs (not "TO_BE_PROVIDED")
  const readyImages = allImages.filter(img => 
    img.external_url && 
    img.external_url !== "TO_BE_PROVIDED" && 
    img.status === "pending"
  );

  if (readyImages.length === 0) {
    console.log('⚠️  No images ready for processing. Update external_url fields in image-mapping.json');
    return;
  }

  console.log(`🚀 Processing ${readyImages.length} ready images...\n`);

  let successful = 0;
  let failed = 0;

  for (const image of readyImages) {
    const success = await downloadImage(
      image.external_url, 
      image.current_path, 
      `${image.section}/${image.category}/${image.name}`
    );
    
    if (success) {
      successful++;
      // Update status in mapping file
      image.status = "completed";
    } else {
      failed++;
    }
    
    // Small delay between downloads
    if (readyImages.indexOf(image) < readyImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Save updated mapping
  if (successful > 0) {
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`\n💾 Updated image-mapping.json with completed statuses`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${readyImages.length}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/batch-update-images.js [--dry-run]

Options:
  --dry-run   Preview what would be updated without making changes

Before running:
1. Edit scripts/image-mapping.json
2. Replace 'TO_BE_PROVIDED' with actual external URLs
3. Run this script to download all images
`);
  process.exit(0);
}

console.log('🖼️  Batch Image Update Tool\n');
processImageMapping(dryRun);