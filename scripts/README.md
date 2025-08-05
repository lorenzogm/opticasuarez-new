# Image Update Process

This document outlines the process for updating images from external sources to replace the current placeholder images in the application.

## Overview

The application currently uses placeholder images (1.5-2KB WebP files) that need to be replaced with actual high-quality images from external sources like `https://media.v2.siweb.es/...`.

## Current Status

- **Total images to update:** 20
- **Homepage images:** 8 (5 services + 2 locations + 1 partner)
- **Quienes somos images:** 12 (6 timeline + 4 team + 2 locations)

## Files Created

### 1. `scripts/update-image.js`
Single image download script for processing one image at a time.

**Usage:**
```bash
node scripts/update-image.js "<external-url>" "<target-path>" [--dry-run]
```

**Example:**
```bash
node scripts/update-image.js "https://media.v2.siweb.es/example.jpg" "/images/homepage/services/vision-binocular.webp"
```

### 2. `scripts/batch-update-images.js`
Batch processing script for updating multiple images at once.

**Usage:**
```bash
node scripts/batch-update-images.js [--dry-run]
```

### 3. `scripts/image-mapping.json`
Configuration file that maps all images with their external URLs and status.

## Process Steps

### Step 1: Identify External URLs
For each of the 20 images, identify the correct external URL from the source system (e.g., `https://media.v2.siweb.es/...`).

### Step 2: Update Mapping File
Edit `scripts/image-mapping.json` and replace `"TO_BE_PROVIDED"` with the actual external URLs.

Example:
```json
{
  "name": "Vision Binocular",
  "current_path": "/images/homepage/services/vision-binocular.webp",
  "external_url": "https://media.v2.siweb.es/uploaded_thumb_big/a57aaa5c420fd0bd0f0d9e3ffabce143/img_1083_1.jpg",
  "status": "pending"
}
```

### Step 3: Preview Changes (Optional)
Run a dry-run to see what would be updated:
```bash
node scripts/batch-update-images.js --dry-run
```

### Step 4: Download Images
Execute the batch update:
```bash
node scripts/batch-update-images.js
```

Or update images one by one:
```bash
node scripts/update-image.js "https://external-url.com/image.jpg" "/images/path/to/image.webp"
```

### Step 5: Verify Results
1. Check that images were downloaded successfully
2. Start the development server: `npm run dev`
3. Visit both pages to verify images display correctly:
   - Homepage: `http://localhost:5173/`
   - Quienes somos: `http://localhost:5173/quienes-somos`

### Step 6: Build and Test
```bash
npm run build
```

## Image Categories

### Homepage Images (`/app/content/homepage.json`)

**Services (5 images):**
- `/images/homepage/services/vision-binocular.webp`
- `/images/homepage/services/terapia-visual.webp`
- `/images/homepage/services/contactologia.webp`
- `/images/homepage/services/vision-pediatrica.webp`
- `/images/homepage/services/control-de-miopia.webp`

**Locations (2 images):**
- `/images/homepage/locations/optica-bulevar.webp`
- `/images/homepage/locations/optica-centro.webp`

**Partners (1 image):**
- `/images/homepage/partners/kit-digital-2024.webp`

### Quienes Somos Images (`/app/content/quienes-somos.json`)

**Timeline (6 images):**
- `/images/quienes-somos/timeline/vision-pediatrica.webp` (1940)
- `/images/quienes-somos/timeline/optica-centro.webp` (1960)
- `/images/quienes-somos/timeline/juan-miguel.webp` (1970)
- `/images/quienes-somos/timeline/liderazgo.webp` (1998)
- `/images/quienes-somos/timeline/equipo-profesional.webp` (2009)
- `/images/quienes-somos/timeline/centro-bulevar.webp` (2020)

**Team (4 images):**
- `/images/quienes-somos/team/juan-miguel.webp`
- `/images/quienes-somos/team/juan-pedro.webp`
- `/images/quienes-somos/team/clara-santiago.webp`
- `/images/quienes-somos/team/vanessa-cantero.webp`

**Locations (2 images):**
- `/images/quienes-somos/locations/optica-centro.webp`
- `/images/quienes-somos/locations/optica-bulevar.webp`

## Features

- **Automatic backup:** Existing files are backed up before replacement
- **Directory creation:** Automatically creates directories if they don't exist
- **Error handling:** Proper error messages for failed downloads
- **Progress tracking:** Shows download progress and file sizes
- **Status tracking:** Updates status in mapping file as images are processed
- **Dry-run mode:** Preview changes without making modifications

## Next Steps

1. **Obtain External URLs:** Get the actual external URLs for each of the 20 images
2. **Update Mapping:** Edit `scripts/image-mapping.json` with the real URLs
3. **Execute Updates:** Run the batch update script
4. **Test thoroughly:** Verify all images display correctly in both pages
5. **Deploy:** Build and deploy the updated application

## Notes

- All current images are placeholder WebP files (400x300, ~1.5-2KB each)
- The issue specifically mentions ensuring images are "correct and not placeholders"
- External URL pattern mentioned: `https://media.v2.siweb.es/uploaded_thumb_big/...`
- Original format should be preserved when downloading