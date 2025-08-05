#!/usr/bin/env node

/**
 * Script to verify current image status and sizes
 * Usage: node scripts/verify-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function verifyImages() {
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

  console.log('🔍 Current Image Status Report\n');
  console.log(`Total images to update: ${allImages.length}\n`);

  let totalSize = 0;
  let existingCount = 0;
  let placeholderCount = 0;

  allImages.forEach((image, index) => {
    const fullPath = path.join(__dirname, '..', 'public', image.current_path);
    const exists = fs.existsSync(fullPath);
    
    console.log(`${index + 1}. ${image.name}`);
    console.log(`   📁 Path: ${image.current_path}`);
    console.log(`   🔗 URL: ${image.external_url}`);
    console.log(`   📊 Status: ${image.status}`);
    
    if (exists) {
      const stats = fs.statSync(fullPath);
      const size = stats.size;
      totalSize += size;
      existingCount++;
      
      console.log(`   📏 Size: ${formatFileSize(size)}`);
      
      if (size < 3000) { // Less than 3KB likely placeholder
        console.log(`   ⚠️  Likely placeholder (very small file)`);
        placeholderCount++;
      } else {
        console.log(`   ✅ Appears to be actual image`);
      }
    } else {
      console.log(`   ❌ File not found`);
    }
    
    console.log('');
  });

  console.log('📊 Summary:');
  console.log(`   📁 Total images: ${allImages.length}`);
  console.log(`   ✅ Existing files: ${existingCount}`);
  console.log(`   ❌ Missing files: ${allImages.length - existingCount}`);
  console.log(`   ⚠️  Likely placeholders: ${placeholderCount}`);
  console.log(`   📏 Total size: ${formatFileSize(totalSize)}`);
  console.log(`   📐 Average size: ${formatFileSize(totalSize / existingCount)}`);

  if (placeholderCount > 0) {
    console.log(`\n💡 ${placeholderCount} images appear to be placeholders that should be updated.`);
  }

  // Check for ready-to-process images
  const readyImages = allImages.filter(img => 
    img.external_url && 
    img.external_url !== "TO_BE_PROVIDED" && 
    img.status === "pending"
  );

  if (readyImages.length > 0) {
    console.log(`\n🚀 ${readyImages.length} images are ready for processing (have external URLs)`);
    readyImages.forEach(img => {
      console.log(`   - ${img.name}: ${img.external_url}`);
    });
  } else {
    console.log(`\n⚠️  No images are ready for processing. Update external URLs in image-mapping.json`);
  }
}

verifyImages();