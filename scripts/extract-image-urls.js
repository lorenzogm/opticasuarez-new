#!/usr/bin/env node

/**
 * Script to extract image URLs from the Óptica Suárez website pages
 * Usage: node scripts/extract-image-urls.js [--homepage] [--quienes-somos] [--all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL configuration
const URLS = {
  homepage: 'https://opticasuarezjaen.com/',
  quienes_somos: 'https://opticasuarezjaen.com/quienes-somos'
};

/**
 * Fetch and parse HTML from a URL
 */
async function fetchPageContent(url) {
  try {
    console.log(`🔍 Fetching content from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    return html;
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Extract image URLs from HTML content
 */
function extractImageUrls(html, pageType) {
  const images = [];
  
  // Patterns to match different image sources
  const patterns = [
    // img tags with src
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    // picture source tags
    /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi,
    // CSS background images
    /background-image:\s*url\(["']?([^"')]+)["']?\)/gi,
    // data-src (lazy loading)
    /data-src=["']([^"']+)["']/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1];
      
      // Filter for relevant image formats and exclude small icons/logos
      if (url && 
          (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp')) &&
          !url.includes('favicon') &&
          !url.includes('logo') &&
          !url.includes('icon') &&
          url.length > 20) {
        
        // Convert relative URLs to absolute
        const absoluteUrl = url.startsWith('http') ? url : new URL(url, URLS[pageType] || URLS.homepage).href;
        
        if (!images.some(img => img.url === absoluteUrl)) {
          images.push({
            url: absoluteUrl,
            context: extractImageContext(html, url),
            alt: extractAltText(html, url),
            size: 'unknown'
          });
        }
      }
    }
  });
  
  return images;
}

/**
 * Extract context around image usage (nearby text, alt attributes, etc.)
 */
function extractImageContext(html, imageUrl) {
  const imgRegex = new RegExp(`<img[^>]*src=["']${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const match = html.match(imgRegex);
  
  if (match) {
    const imgTag = match[0];
    
    // Extract alt text
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    if (altMatch) {
      return altMatch[1];
    }
    
    // Extract title
    const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);
    if (titleMatch) {
      return titleMatch[1];
    }
  }
  
  return '';
}

/**
 * Extract alt text from image
 */
function extractAltText(html, imageUrl) {
  const imgRegex = new RegExp(`<img[^>]*src=["']${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*alt=["']([^"']*)["']`, 'i');
  const match = html.match(imgRegex);
  return match ? match[1] : '';
}

/**
 * Categorize images based on URL patterns and context
 */
function categorizeImages(images, pageType) {
  const categorized = {
    services: [],
    locations: [],
    team: [],
    timeline: [],
    partners: [],
    other: []
  };
  
  images.forEach(image => {
    const url = image.url.toLowerCase();
    const context = (image.context || '').toLowerCase();
    const alt = (image.alt || '').toLowerCase();
    
    // Service-related keywords
    if (context.includes('vision') || context.includes('terapia') || context.includes('contacto') || 
        alt.includes('vision') || alt.includes('terapia') || alt.includes('contacto') ||
        url.includes('servicio') || url.includes('service')) {
      categorized.services.push(image);
    }
    // Location-related keywords
    else if (context.includes('centro') || context.includes('bulevar') || context.includes('óptica') ||
             alt.includes('centro') || alt.includes('bulevar') || alt.includes('óptica') ||
             url.includes('centro') || url.includes('bulevar') || url.includes('location')) {
      categorized.locations.push(image);
    }
    // Team/people keywords
    else if (context.includes('juan') || context.includes('clara') || context.includes('vanessa') ||
             alt.includes('juan') || alt.includes('clara') || alt.includes('vanessa') ||
             context.includes('equipo') || context.includes('team') ||
             url.includes('team') || url.includes('equipo')) {
      categorized.team.push(image);
    }
    // Timeline/history keywords
    else if (context.includes('historia') || context.includes('año') || context.includes('timeline') ||
             alt.includes('historia') || alt.includes('año') || alt.includes('timeline') ||
             url.includes('historia') || url.includes('timeline')) {
      categorized.timeline.push(image);
    }
    // Partner keywords
    else if (context.includes('kit') || context.includes('digital') || context.includes('partner') ||
             alt.includes('kit') || alt.includes('digital') || alt.includes('partner') ||
             url.includes('kit') || url.includes('partner')) {
      categorized.partners.push(image);
    }
    else {
      categorized.other.push(image);
    }
  });
  
  return categorized;
}

/**
 * Save extracted URLs to a JSON file
 */
function saveExtractedUrls(extractedData, outputPath) {
  const data = {
    extraction_date: new Date().toISOString(),
    total_images: Object.values(extractedData).reduce((acc, page) => 
      acc + Object.values(page || {}).reduce((pageAcc, category) => 
        pageAcc + (Array.isArray(category) ? category.length : 0), 0), 0),
    pages: extractedData,
    instructions: {
      next_steps: [
        "Review the extracted image URLs",
        "Match them with the appropriate images in image-mapping.json",
        "Update the external_url fields in image-mapping.json",
        "Run: node scripts/batch-update-images.js"
      ]
    }
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved extracted URLs to: ${outputPath}`);
}

/**
 * Main extraction process
 */
async function extractImagesFromPages(pages = ['homepage', 'quienes_somos']) {
  const extractedData = {};
  
  for (const pageType of pages) {
    console.log(`\n🔍 Processing ${pageType} page...`);
    
    const html = await fetchPageContent(URLS[pageType]);
    if (!html) {
      console.log(`⚠️  Skipping ${pageType} due to fetch error`);
      continue;
    }
    
    const images = extractImageUrls(html, pageType);
    console.log(`📸 Found ${images.length} potential images`);
    
    const categorized = categorizeImages(images, pageType);
    extractedData[pageType] = categorized;
    
    // Log summary
    Object.entries(categorized).forEach(([category, imgs]) => {
      if (imgs.length > 0) {
        console.log(`   ${category}: ${imgs.length} images`);
      }
    });
  }
  
  return extractedData;
}

/**
 * Update image mapping with extracted URLs
 */
async function updateImageMapping(extractedData) {
  const mappingPath = path.join(__dirname, 'image-mapping.json');
  
  if (!fs.existsSync(mappingPath)) {
    console.error('❌ image-mapping.json not found');
    return;
  }
  
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  let updatedCount = 0;
  
  console.log('\n🔄 Attempting to match extracted URLs with mapping entries...');
  
  // This is a basic matching algorithm - in practice, manual review would be needed
  Object.entries(mapping.images_to_update).forEach(([section, categories]) => {
    Object.entries(categories).forEach(([category, images]) => {
      images.forEach(image => {
        if (image.external_url === "TO_BE_PROVIDED") {
          // Try to find a matching image from extracted data
          const pageData = extractedData[section === 'quienes_somos' ? 'quienes_somos' : 'homepage'];
          if (pageData && pageData[category] && pageData[category].length > 0) {
            const bestMatch = pageData[category][0]; // Take first match for now
            console.log(`✅ Matched ${image.name} with ${bestMatch.url}`);
            image.external_url = bestMatch.url;
            updatedCount++;
          }
        }
      });
    });
  });
  
  if (updatedCount > 0) {
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`\n💾 Updated ${updatedCount} URLs in image-mapping.json`);
  } else {
    console.log('\n⚠️  No automatic matches found. Manual review recommended.');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/extract-image-urls.js [options]

Options:
  --homepage      Extract only homepage images
  --quienes-somos Extract only "quienes somos" page images  
  --all          Extract from both pages (default)
  --auto-update  Automatically update image-mapping.json with best matches
  --help, -h     Show this help message

Examples:
  node scripts/extract-image-urls.js --homepage
  node scripts/extract-image-urls.js --all --auto-update
`);
  process.exit(0);
}

// Determine which pages to process
let pagesToProcess = ['homepage', 'quienes_somos'];

if (args.includes('--homepage')) {
  pagesToProcess = ['homepage'];
} else if (args.includes('--quienes-somos')) {
  pagesToProcess = ['quienes_somos'];
}

console.log('🕷️  Image URL Extraction Tool\n');
console.log(`📄 Processing pages: ${pagesToProcess.join(', ')}`);

// Run the extraction
extractImagesFromPages(pagesToProcess)
  .then(extractedData => {
    const outputPath = path.join(__dirname, 'extracted-image-urls.json');
    saveExtractedUrls(extractedData, outputPath);
    
    if (args.includes('--auto-update')) {
      return updateImageMapping(extractedData);
    }
    
    console.log('\n✅ Extraction complete!');
    console.log('📋 Next steps:');
    console.log('   1. Review extracted-image-urls.json');
    console.log('   2. Manually update image-mapping.json with correct URLs');
    console.log('   3. Run: node scripts/batch-update-images.js');
  })
  .catch(error => {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  });