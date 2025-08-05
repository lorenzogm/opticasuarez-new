#!/usr/bin/env node

/**
 * Browser-based image extraction script using Playwright
 * Handles JavaScript-rendered content and modern websites
 * Usage: node scripts/browser-extract-images.js [--homepage] [--quienes-somos] [--all]
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
 * Install Playwright if needed
 */
async function ensureBrowserInstalled() {
  try {
    // Try to import playwright
    const { chromium } = await import('playwright');
    return chromium;
  } catch (error) {
    console.log('📦 Playwright not found. Installing...');
    
    // Install playwright
    const { execSync } = await import('child_process');
    execSync('npm install playwright', { stdio: 'inherit' });
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    
    // Import again after installation
    const { chromium } = await import('playwright');
    return chromium;
  }
}

/**
 * Extract images using browser automation
 */
async function extractImagesWithBrowser(url, pageType) {
  const chromium = await ensureBrowserInstalled();
  
  console.log(`🌐 Opening browser for: ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Set viewport and user agent
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for images to load
    await page.waitForTimeout(3000);
    
    // Extract all image information
    const images = await page.evaluate(() => {
      const imageElements = document.querySelectorAll('img, picture source, [style*="background-image"]');
      const extractedImages = [];
      
      imageElements.forEach(element => {
        let src = '';
        let alt = '';
        let context = '';
        
        if (element.tagName === 'IMG') {
          src = element.src || element.dataset.src || element.dataset.lazySrc;
          alt = element.alt || element.title || '';
          
          // Get surrounding text for context
          const parent = element.closest('section, div, article') || element.parentElement;
          if (parent) {
            const textContent = parent.textContent || '';
            context = textContent.substring(0, 200).trim();
          }
        } else if (element.tagName === 'SOURCE') {
          src = element.srcset?.split(' ')[0] || element.src;
        } else if (element.style.backgroundImage) {
          const bgMatch = element.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (bgMatch) {
            src = bgMatch[1];
          }
        }
        
        // Filter valid image URLs
        if (src && 
            (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp')) &&
            !src.includes('favicon') &&
            !src.includes('data:image') &&
            src.length > 10) {
          
          // Get computed dimensions
          const rect = element.getBoundingClientRect();
          
          extractedImages.push({
            url: src,
            alt: alt,
            context: context,
            width: rect.width || 'unknown',
            height: rect.height || 'unknown',
            visible: rect.width > 0 && rect.height > 0,
            element_type: element.tagName.toLowerCase()
          });
        }
      });
      
      return extractedImages;
    });
    
    console.log(`📸 Extracted ${images.length} images from ${pageType}`);
    
    return images;
    
  } catch (error) {
    console.error(`❌ Error extracting from ${url}:`, error.message);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Smart categorization based on context, alt text, and URL patterns
 */
function smartCategorizeImages(images, pageType) {
  const categorized = {
    services: [],
    locations: [],
    team: [],
    timeline: [],
    partners: [],
    high_priority: [],
    medium_priority: [],
    low_priority: []
  };
  
  images.forEach(image => {
    const url = image.url.toLowerCase();
    const context = (image.context || '').toLowerCase();
    const alt = (image.alt || '').toLowerCase();
    const combined = `${url} ${context} ${alt}`;
    
    // Priority scoring
    let priority = 0;
    
    // Size-based priority
    if (typeof image.width === 'number' && typeof image.height === 'number') {
      const area = image.width * image.height;
      if (area > 50000) priority += 3; // Large images
      else if (area > 10000) priority += 2; // Medium images
      else priority += 1; // Small images
    }
    
    // Visibility priority
    if (image.visible) priority += 2;
    
    // Service-related patterns
    if (/visio|binocular|terapia|visual|contacto|lentilla|miopia|pediatr/i.test(combined)) {
      categorized.services.push({ ...image, priority, category: 'services' });
      priority += 3;
    }
    // Location patterns
    else if (/centro|bulevar|óptica|optica|establecimiento|tienda|local/i.test(combined)) {
      categorized.locations.push({ ...image, priority, category: 'locations' });
      priority += 3;
    }
    // Team patterns
    else if (/juan|miguel|pedro|clara|santiago|vanessa|cantero|equipo|profesional|director/i.test(combined)) {
      categorized.team.push({ ...image, priority, category: 'team' });
      priority += 3;
    }
    // Timeline/history patterns
    else if (/historia|año|timeline|apertura|hogar|liderazgo|1940|1960|1970|1998|2009|2020/i.test(combined)) {
      categorized.timeline.push({ ...image, priority, category: 'timeline' });
      priority += 3;
    }
    // Partner patterns
    else if (/kit|digital|partner|programa|logo/i.test(combined)) {
      categorized.partners.push({ ...image, priority, category: 'partners' });
      priority += 2;
    }
    
    // Assign to priority categories
    if (priority >= 6) {
      categorized.high_priority.push({ ...image, priority });
    } else if (priority >= 3) {
      categorized.medium_priority.push({ ...image, priority });
    } else {
      categorized.low_priority.push({ ...image, priority });
    }
  });
  
  // Sort each category by priority
  Object.keys(categorized).forEach(key => {
    categorized[key].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  });
  
  return categorized;
}

/**
 * Generate smart URL suggestions for image mapping
 */
function generateUrlSuggestions(extractedData) {
  const mappingPath = path.join(__dirname, 'image-mapping.json');
  
  if (!fs.existsSync(mappingPath)) {
    console.error('❌ image-mapping.json not found');
    return;
  }
  
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const suggestions = {};
  
  // Analyze each image in the mapping
  Object.entries(mapping.images_to_update).forEach(([section, categories]) => {
    suggestions[section] = {};
    
    Object.entries(categories).forEach(([category, images]) => {
      suggestions[section][category] = [];
      
      images.forEach(mappingImage => {
        const imageName = mappingImage.name.toLowerCase();
        const description = (mappingImage.description || '').toLowerCase();
        
        // Find potential matches from extracted data
        const pageData = extractedData[section === 'quienes_somos' ? 'quienes_somos' : 'homepage'];
        const matches = [];
        
        if (pageData && pageData[category]) {
          pageData[category].forEach(extractedImage => {
            let score = 0;
            const combined = `${extractedImage.url} ${extractedImage.context} ${extractedImage.alt}`.toLowerCase();
            
            // Name matching
            const nameWords = imageName.split(/\s+/);
            nameWords.forEach(word => {
              if (word.length > 2 && combined.includes(word)) {
                score += 3;
              }
            });
            
            // Description matching
            const descWords = description.split(/\s+/);
            descWords.forEach(word => {
              if (word.length > 3 && combined.includes(word)) {
                score += 2;
              }
            });
            
            // Priority from extraction
            score += (extractedImage.priority || 0);
            
            if (score > 0) {
              matches.push({
                ...extractedImage,
                match_score: score,
                suggested_for: mappingImage.name
              });
            }
          });
        }
        
        // Sort matches by score
        matches.sort((a, b) => b.match_score - a.match_score);
        
        suggestions[section][category].push({
          mapping_image: mappingImage.name,
          current_path: mappingImage.current_path,
          top_suggestions: matches.slice(0, 3) // Top 3 matches
        });
      });
    });
  });
  
  return suggestions;
}

/**
 * Main extraction and analysis process
 */
async function runExtractionProcess(pages = ['homepage', 'quienes_somos']) {
  const extractedData = {};
  
  for (const pageType of pages) {
    console.log(`\n🔍 Processing ${pageType} page...`);
    
    const images = await extractImagesWithBrowser(URLS[pageType], pageType);
    
    if (images.length > 0) {
      const categorized = smartCategorizeImages(images, pageType);
      extractedData[pageType] = categorized;
      
      // Log summary
      console.log(`📊 ${pageType} analysis:`);
      Object.entries(categorized).forEach(([category, imgs]) => {
        if (imgs.length > 0) {
          console.log(`   ${category}: ${imgs.length} images`);
        }
      });
    } else {
      console.log(`⚠️  No images found for ${pageType}`);
    }
  }
  
  return extractedData;
}

/**
 * Save comprehensive analysis results
 */
function saveAnalysisResults(extractedData, suggestions) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save extracted data
  const extractedPath = path.join(__dirname, `extracted-images-${timestamp}.json`);
  fs.writeFileSync(extractedPath, JSON.stringify({
    extraction_date: new Date().toISOString(),
    extracted_data: extractedData,
    total_images: Object.values(extractedData).reduce((acc, page) => 
      acc + Object.values(page || {}).reduce((pageAcc, category) => 
        pageAcc + (Array.isArray(category) ? category.length : 0), 0), 0)
  }, null, 2));
  
  // Save suggestions
  const suggestionsPath = path.join(__dirname, `url-suggestions-${timestamp}.json`);
  fs.writeFileSync(suggestionsPath, JSON.stringify({
    generation_date: new Date().toISOString(),
    suggestions: suggestions,
    instructions: [
      "Review the suggestions for each image in your mapping",
      "Copy the best matching URLs to image-mapping.json",
      "Replace 'TO_BE_PROVIDED' with the selected URLs",
      "Run: node scripts/batch-update-images.js"
    ]
  }, null, 2));
  
  console.log(`\n💾 Results saved:`);
  console.log(`   📸 Extracted images: ${extractedPath}`);
  console.log(`   💡 URL suggestions: ${suggestionsPath}`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/browser-extract-images.js [options]

Options:
  --homepage      Extract only homepage images
  --quienes-somos Extract only "quienes somos" page images  
  --all          Extract from both pages (default)
  --help, -h     Show this help message

This script uses browser automation to:
1. Load the actual website pages
2. Extract all images including JavaScript-rendered content
3. Categorize images intelligently based on content and context
4. Generate smart URL suggestions for your image mapping

Examples:
  node scripts/browser-extract-images.js --homepage
  node scripts/browser-extract-images.js --all
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

console.log('🤖 Advanced Image Extraction Tool with Browser Automation\n');
console.log(`📄 Processing pages: ${pagesToProcess.join(', ')}`);

// Run the process
runExtractionProcess(pagesToProcess)
  .then(extractedData => {
    console.log('\n🧠 Generating smart URL suggestions...');
    const suggestions = generateUrlSuggestions(extractedData);
    
    saveAnalysisResults(extractedData, suggestions);
    
    console.log('\n✅ Advanced extraction complete!');
    console.log('📋 Next steps:');
    console.log('   1. Review the generated url-suggestions-*.json file');
    console.log('   2. Copy the best matching URLs to image-mapping.json');
    console.log('   3. Run: node scripts/batch-update-images.js');
  })
  .catch(error => {
    console.error('❌ Extraction failed:', error);
    
    // Fallback to simple fetch method
    console.log('\n🔄 Falling back to simple extraction method...');
    console.log('   Run: node scripts/extract-image-urls.js');
    
    process.exit(1);
  });