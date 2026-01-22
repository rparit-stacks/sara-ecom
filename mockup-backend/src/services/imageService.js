/**
 * Image Processing Service
 * Handles all image operations using Sharp
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const mockupConfig = require('../config/mockupConfig');

/**
 * Normalize user-uploaded image to PNG format (optimized)
 * @param {Buffer} imageBuffer - Original image buffer
 * @returns {Promise<{buffer: Buffer, metadata: Object}>} - Normalized PNG buffer and metadata
 */
async function normalizeImage(imageBuffer) {
  try {
    // Use sequential read for better memory efficiency
    const image = sharp(imageBuffer, { sequentialRead: true });
    const metadata = await image.metadata();

    // Convert to PNG and get buffer
    const pngBuffer = await image
      .png({
        compressionLevel: mockupConfig.quality.png.compressionLevel,
        adaptiveFiltering: mockupConfig.quality.png.adaptiveFiltering
      })
      .toBuffer();

    return {
      buffer: pngBuffer,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: 'png',
        channels: metadata.channels
      }
    };
  } catch (error) {
    throw new Error(`Failed to normalize image: ${error.message}`);
  }
}

/**
 * Load mockup template from filesystem (optimized for large files)
 * Uses file path directly for Sharp operations to avoid loading entire file in memory
 * @param {string} templatePath - Path to mockup template file
 * @returns {Promise<{path: string, buffer: Buffer | null, metadata: Object, useFile: boolean}>} - Mockup info
 */
async function loadMockup(templatePath = null) {
  try {
    const mockupPath = templatePath || 
      process.env.MOCKUP_TEMPLATE_PATH || 
      path.join(__dirname, '../../assets/mockups/default-mockup.png');

    // Check if file exists
    try {
      await fs.access(mockupPath);
    } catch (error) {
      throw new Error(`Mockup template not found at: ${mockupPath}`);
    }

    // Get file stats to check size
    const stats = await fs.stat(mockupPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    // For large files (>20MB), use file path directly (Sharp can process from file efficiently)
    // For smaller files, load buffer for faster operations
    const useFile = fileSizeMB > 20;
    
    // Always get metadata first (fast, doesn't load full file)
    const image = sharp(mockupPath);
    const metadata = await image.metadata();

    let buffer = null;
    if (!useFile) {
      // For smaller files, load buffer for faster composite operations
      buffer = await fs.readFile(mockupPath);
    }

    return {
      path: mockupPath,
      buffer: buffer,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      },
      useFile: useFile,
      fileSizeMB: fileSizeMB
    };
  } catch (error) {
    throw new Error(`Failed to load mockup template: ${error.message}`);
  }
}

/**
 * Resize user design to fit the design area (kept for optional future use)
 * @param {Buffer} imageBuffer - User design image buffer
 * @param {Object} targetSize - Target dimensions {width, height}
 * @param {string} strategy - Scaling strategy: 'fit', 'cover', 'contain', 'fill'
 * @returns {Promise<Buffer>} - Resized image buffer
 */
async function resizeToFit(imageBuffer, targetSize, strategy = null) {
  try {
    const image = sharp(imageBuffer);
    await image.metadata();

    // Ensure target size doesn't exceed limits
    const maxWidth = Math.min(targetSize.width, 10000);
    const maxHeight = Math.min(targetSize.height, 10000);

    const scaleStrategy = (strategy || mockupConfig.scalingStrategy || 'inside').toLowerCase();
    const resizeOptions = {
      width: maxWidth,
      height: maxHeight,
      fit: ['fill', 'cover', 'contain', 'inside', 'outside'].includes(scaleStrategy) ? scaleStrategy : 'inside',
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    };

    const resizedBuffer = await image
      .resize(resizeOptions)
      .png()
      .toBuffer();

    return resizedBuffer;
  } catch (error) {
    throw new Error(`Failed to resize image: ${error.message}`);
  }
}

/**
 * Resize user design to EXACT dimensions (stretches/warps; ignores aspect ratio).
 * This matches the requirement: mockup PNG controls resolution; design must obey it.
 * Optimized with sequential read for large images.
 */
async function resizeToExact(imageBuffer, width, height) {
  try {
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error(`Invalid target size: ${width}x${height}`);
    }

    return await sharp(imageBuffer, { sequentialRead: true })
      .resize(width, height, { 
        fit: 'fill', // fill = stretch to exact size
        kernel: 'lanczos3' // High quality resize
      })
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(`Failed to resize image to exact size: ${error.message}`);
  }
}

/**
 * Make the user design look more "fabric-like" so it blends with mockup wrinkles/shadows.
 * Tuned via env vars (all optional):
 * - DESIGN_BLUR (default 0.35)          : slight blur, 0 = off
 * - DESIGN_SATURATION (default 0.95)    : <1 desaturate
 * - DESIGN_BRIGHTNESS (default 0.98)    : <1 slightly darker
 * - DESIGN_CONTRAST (default 1.02)      : >1 slightly more contrast
 * - DESIGN_OPACITY (default 1.0)        : <1 makes design slightly see-through
 * Optimized with sequential read for large images.
 */
async function stylizeDesign(designBuffer) {
  try {
    const blur = process.env.DESIGN_BLUR != null ? Number(process.env.DESIGN_BLUR) : 0.35;
    const saturation = process.env.DESIGN_SATURATION != null ? Number(process.env.DESIGN_SATURATION) : 0.95;
    const brightness = process.env.DESIGN_BRIGHTNESS != null ? Number(process.env.DESIGN_BRIGHTNESS) : 0.98;
    const contrast = process.env.DESIGN_CONTRAST != null ? Number(process.env.DESIGN_CONTRAST) : 1.02;
    const opacity = process.env.DESIGN_OPACITY != null ? Number(process.env.DESIGN_OPACITY) : 1.0;

    let img = sharp(designBuffer, { sequentialRead: true });

    // Slight blur to reduce "sticker" sharpness on fabric
    if (Number.isFinite(blur) && blur > 0) {
      img = img.blur(Math.min(10, blur));
    }

    // Color/brightness tweaks
    img = img.modulate({
      saturation: Number.isFinite(saturation) ? Math.max(0, Math.min(2, saturation)) : 0.95,
      brightness: Number.isFinite(brightness) ? Math.max(0, Math.min(2, brightness)) : 0.98
    });

    // Contrast: sharp.linear(a, b) where a scales, b offsets
    const a = Number.isFinite(contrast) ? Math.max(0, Math.min(3, contrast)) : 1.02;
    img = img.linear(a, 0);

    const processed = await img.png().toBuffer();

    // Optional overall opacity (composite onto transparent canvas)
    if (Number.isFinite(opacity) && opacity >= 0 && opacity < 1) {
      const meta = await sharp(processed, { sequentialRead: true }).metadata();
      const w = meta.width || 1;
      const h = meta.height || 1;
      const base = sharp({
        create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
      });

      return await base
        .composite([{ input: processed, left: 0, top: 0, blend: 'over', opacity }])
        .png()
        .toBuffer();
    }

    return processed;
  } catch (error) {
    throw new Error(`Failed to stylize design: ${error.message}`);
  }
}

/**
 * Composite user design with mockup template (STRICT order):
 * - BOTTOM: user design (already resized to mockup size)
 * - TOP: mockup PNG (original size; not resized)
 * Optimized to handle both file paths and buffers for large files
 */
async function compositeImages(designBuffer, mockupInput) {
  try {
    const wrinkleOpacityRaw = process.env.MOCKUP_WRINKLE_OPACITY;
    // 0 disables wrinkle pass; typical good range: 0.15 - 0.45
    const wrinkleOpacity = wrinkleOpacityRaw != null ? Number(wrinkleOpacityRaw) : 0.32;
    const useWrinklePass = Number.isFinite(wrinkleOpacity) && wrinkleOpacity > 0;

    // mockupInput can be either a buffer or {path, buffer, useFile}
    const mockupPath = typeof mockupInput === 'string' ? mockupInput : (mockupInput.path || null);
    const mockupBuffer = typeof mockupInput === 'object' && !mockupInput.path ? mockupInput : (mockupInput.buffer || null);
    const useFile = typeof mockupInput === 'object' && mockupInput.useFile === true;

    // Build composite array
    const compositeArray = [];
    
    // Pass 1: wrinkle shadows (optional)
    if (useWrinklePass) {
      compositeArray.push({
        input: useFile ? mockupPath : mockupBuffer,
        left: 0,
        top: 0,
        blend: 'multiply',
        opacity: Math.max(0, Math.min(1, wrinkleOpacity))
      });
    }
    
    // Pass 2: normal overlay
    compositeArray.push({
      input: useFile ? mockupPath : mockupBuffer,
      left: 0,
      top: 0,
      blend: 'over'
    });

    // Use optimized Sharp settings for large images
    const processor = sharp(designBuffer, {
      // Enable sequential read for large images (faster)
      sequentialRead: true,
      // Limit memory usage
      limitInputPixels: false
    });

    // For large files, output directly to JPEG to save memory and time
    // We'll compress later anyway, so PNG intermediate is wasteful
    const finalBuffer = await processor
      .composite(compositeArray)
      .jpeg({ 
        quality: 90,  // High quality, will be compressed later if needed
        mozjpeg: true // Better compression
      })
      .toBuffer();

    return finalBuffer;
  } catch (error) {
    throw new Error(`Failed to composite images: ${error.message}`);
  }
}

/**
 * Compress image to reduce file size if it exceeds the limit (optimized for speed)
 * Uses binary search approach for faster compression
 * @param {Buffer} imageBuffer - Image buffer to compress
 * @param {number} maxSizeBytes - Maximum allowed size in bytes (default: 10MB)
 * @returns {Promise<{buffer: Buffer, metadata: Object, compressed: boolean}>} - Compressed image and metadata
 */
async function compressImageIfNeeded(imageBuffer, maxSizeBytes = 10 * 1024 * 1024) {
  try {
    const currentSize = imageBuffer.length;
    
    // If already under limit, return as is
    if (currentSize <= maxSizeBytes) {
      const metadata = await sharp(imageBuffer).metadata();
      return {
        buffer: imageBuffer,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: currentSize
        },
        compressed: false
      };
    }

    console.log(`Image size ${(currentSize / 1024 / 1024).toFixed(2)}MB exceeds limit ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB. Compressing...`);
    const startTime = Date.now();

    const initialMetadata = await sharp(imageBuffer).metadata();
    let currentWidth = initialMetadata.width;
    let currentHeight = initialMetadata.height;
    
    // Calculate target dimensions more accurately
    // Estimate: JPEG at 80% quality ≈ 0.3-0.5 bytes per pixel for typical images
    const targetPixels = (maxSizeBytes * 0.9) / 0.4; // Conservative estimate
    const currentPixels = currentWidth * currentHeight;
    
    let compressedBuffer = imageBuffer;
    
    // If image is way too large, resize first (faster than quality reduction)
    if (currentPixels > targetPixels * 1.5) {
      const scale = Math.sqrt(targetPixels / currentPixels);
      currentWidth = Math.floor(currentWidth * scale);
      currentHeight = Math.floor(currentHeight * scale);
      
      compressedBuffer = await sharp(imageBuffer, { sequentialRead: true })
        .resize(currentWidth, currentHeight, { 
          fit: 'inside', 
          withoutEnlargement: true,
          kernel: 'lanczos3' // High quality resize
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    }

    // Binary search for optimal quality (faster than linear attempts)
    if (compressedBuffer.length > maxSizeBytes) {
      let minQuality = 60;
      let maxQuality = 90;
      let bestBuffer = compressedBuffer;
      let bestQuality = 85;
      
      // Binary search: find highest quality that fits under limit
      while (maxQuality - minQuality > 5) {
        const testQuality = Math.floor((minQuality + maxQuality) / 2);
        
        const testBuffer = await sharp(compressedBuffer, { sequentialRead: true })
          .jpeg({ quality: testQuality, mozjpeg: true })
          .toBuffer();
        
        if (testBuffer.length <= maxSizeBytes) {
          bestBuffer = testBuffer;
          bestQuality = testQuality;
          minQuality = testQuality;
        } else {
          maxQuality = testQuality;
        }
      }
      
      compressedBuffer = bestBuffer;
      
      // If still too large, reduce dimensions slightly
      if (compressedBuffer.length > maxSizeBytes) {
        const scale = Math.sqrt((maxSizeBytes * 0.95) / compressedBuffer.length);
        currentWidth = Math.floor(currentWidth * scale);
        currentHeight = Math.floor(currentHeight * scale);
        
        compressedBuffer = await sharp(imageBuffer, { sequentialRead: true })
          .resize(currentWidth, currentHeight, { 
            fit: 'inside', 
            withoutEnlargement: true,
            kernel: 'lanczos3'
          })
          .jpeg({ quality: bestQuality, mozjpeg: true })
          .toBuffer();
      }
    }

    const finalMetadata = await sharp(compressedBuffer).metadata();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Compressed to ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB (${finalMetadata.width}x${finalMetadata.height}) in ${elapsed}s`);

    return {
      buffer: compressedBuffer,
      metadata: {
        width: finalMetadata.width,
        height: finalMetadata.height,
        format: finalMetadata.format || 'jpeg',
        size: compressedBuffer.length
      },
      compressed: true
    };
  } catch (error) {
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}

/**
 * Generate mockup from user design (optimized for large mockup files)
 * Main function that orchestrates the entire process
 * @param {Buffer} designBuffer - User-uploaded design image
 * @param {Object} options - Optional overrides for config
 * @returns {Promise<{buffer: Buffer, metadata: Object}>} - Final mockup and metadata
 */
async function generateMockup(designBuffer, options = {}) {
  try {
    const startTime = Date.now();
    console.log('Starting mockup generation...');

    // Step 1: Load mockup template FIRST (mockup is source of truth)
    // For large files, this uses file path directly instead of loading entire buffer
    const mockup = await loadMockup(options.templatePath);
    const targetWidth = mockup.metadata.width;
    const targetHeight = mockup.metadata.height;
    if (!targetWidth || !targetHeight) {
      throw new Error('Mockup template dimensions could not be read');
    }

    if (mockup.useFile) {
      console.log(`Using file-based processing for large mockup (${mockup.fileSizeMB.toFixed(2)}MB)`);
    }

    // Step 2: Normalize user design to PNG (small file, fast)
    const normalized = await normalizeImage(designBuffer);

    // Step 3: Stretch user design to EXACT mockup size (ignores aspect ratio)
    // Use optimized Sharp settings for large images
    const stretchedDesign = await sharp(normalized.buffer, { sequentialRead: true })
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .png()
      .toBuffer();

    // Step 4: Stylize design slightly so it blends with fabric wrinkles/shadows
    const finalDesign = await stylizeDesign(stretchedDesign);

    // Step 5: Composite (BOTTOM design, TOP mockup), output size = mockup size
    // Pass mockup object (with path/buffer info) for efficient processing
    const finalBuffer = await compositeImages(
      finalDesign,
      mockup.useFile ? mockup : mockup.buffer
    );

    // Step 6: Compress if needed (for Cloudinary 10MB limit)
    // This uses optimized binary search for faster compression
    const maxSizeBytes = options.maxSizeBytes || 10 * 1024 * 1024; // 10MB default
    const compressed = await compressImageIfNeeded(finalBuffer, maxSizeBytes);

    // Get final metadata
    const finalMetadata = compressed.metadata;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Mockup generation completed in ${elapsed}s`);

    return {
      buffer: compressed.buffer,
      metadata: {
        width: finalMetadata.width,
        height: finalMetadata.height,
        format: finalMetadata.format,
        size: compressed.buffer.length,
        compressed: compressed.compressed
      }
    };
  } catch (error) {
    throw new Error(`Mockup generation failed: ${error.message}`);
  }
}

module.exports = {
  normalizeImage,
  loadMockup,
  resizeToFit,
  resizeToExact,
  compositeImages,
  compressImageIfNeeded,
  generateMockup
};
