/**
 * Image Processing Service
 * Handles all image operations using Sharp
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const mockupConfig = require('../config/mockupConfig');

/**
 * Normalize user-uploaded image to PNG format
 * @param {Buffer} imageBuffer - Original image buffer
 * @returns {Promise<{buffer: Buffer, metadata: Object}>} - Normalized PNG buffer and metadata
 */
async function normalizeImage(imageBuffer) {
  try {
    const image = sharp(imageBuffer);
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
 * Load mockup template from filesystem
 * @param {string} templatePath - Path to mockup template file
 * @returns {Promise<{buffer: Buffer, metadata: Object}>} - Mockup buffer and metadata
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

    const mockupBuffer = await fs.readFile(mockupPath);
    const image = sharp(mockupBuffer);
    const metadata = await image.metadata();

    return {
      buffer: mockupBuffer,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      }
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
 */
async function resizeToExact(imageBuffer, width, height) {
  try {
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error(`Invalid target size: ${width}x${height}`);
    }

    return await sharp(imageBuffer)
      .resize(width, height, { fit: 'fill' }) // fill = stretch to exact size
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
 */
async function stylizeDesign(designBuffer) {
  try {
    const blur = process.env.DESIGN_BLUR != null ? Number(process.env.DESIGN_BLUR) : 0.35;
    const saturation = process.env.DESIGN_SATURATION != null ? Number(process.env.DESIGN_SATURATION) : 0.95;
    const brightness = process.env.DESIGN_BRIGHTNESS != null ? Number(process.env.DESIGN_BRIGHTNESS) : 0.98;
    const contrast = process.env.DESIGN_CONTRAST != null ? Number(process.env.DESIGN_CONTRAST) : 1.02;
    const opacity = process.env.DESIGN_OPACITY != null ? Number(process.env.DESIGN_OPACITY) : 1.0;

    let img = sharp(designBuffer);

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
      const meta = await sharp(processed).metadata();
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
 */
async function compositeImages(designBuffer, mockupBuffer) {
  try {
    const wrinkleOpacityRaw = process.env.MOCKUP_WRINKLE_OPACITY;
    // 0 disables wrinkle pass; typical good range: 0.15 - 0.45
    const wrinkleOpacity = wrinkleOpacityRaw != null ? Number(wrinkleOpacityRaw) : 0.32;
    const useWrinklePass = Number.isFinite(wrinkleOpacity) && wrinkleOpacity > 0;

    // Base = user design (already same resolution as mockup)
    // Overlay = mockup PNG (transparent; sits on top)
    const finalBuffer = await sharp(designBuffer)
      .composite(
        [
          // Pass 1: use same mockup PNG to apply wrinkle shadows onto the design
          // This only helps if mockup PNG contains wrinkle/shadow RGB information.
          ...(useWrinklePass
            ? [
                {
                  input: mockupBuffer,
                  left: 0,
                  top: 0,
                  blend: 'multiply',
                  opacity: Math.max(0, Math.min(1, wrinkleOpacity))
                }
              ]
            : []),
          // Pass 2: normal overlay to keep edges, highlights, and overall look intact
          {
            input: mockupBuffer,
            left: 0,
            top: 0,
            blend: 'over'
          }
        ]
      )
      .png({
        compressionLevel: mockupConfig.quality.png.compressionLevel,
        adaptiveFiltering: mockupConfig.quality.png.adaptiveFiltering
      })
      .toBuffer();

    return finalBuffer;
  } catch (error) {
    throw new Error(`Failed to composite images: ${error.message}`);
  }
}

/**
 * Generate mockup from user design
 * Main function that orchestrates the entire process
 * @param {Buffer} designBuffer - User-uploaded design image
 * @param {Object} options - Optional overrides for config
 * @returns {Promise<{buffer: Buffer, metadata: Object}>} - Final mockup and metadata
 */
async function generateMockup(designBuffer, options = {}) {
  try {
    // Step 1: Load mockup template FIRST (mockup is source of truth)
    const mockup = await loadMockup(options.templatePath);
    const targetWidth = mockup.metadata.width;
    const targetHeight = mockup.metadata.height;
    if (!targetWidth || !targetHeight) {
      throw new Error('Mockup template dimensions could not be read');
    }

    // Step 2: Normalize user design to PNG
    const normalized = await normalizeImage(designBuffer);

    // Step 3: Stretch user design to EXACT mockup size (ignores aspect ratio)
    const stretchedDesign = await resizeToExact(normalized.buffer, targetWidth, targetHeight);

    // Step 4: Stylize design slightly so it blends with fabric wrinkles/shadows
    const finalDesign = await stylizeDesign(stretchedDesign);

    // Step 5: Composite (BOTTOM design, TOP mockup), output size = mockup size
    const finalBuffer = await compositeImages(
      finalDesign,
      mockup.buffer
    );

    // Get final metadata
    const finalMetadata = await sharp(finalBuffer).metadata();

    return {
      buffer: finalBuffer,
      metadata: {
        width: finalMetadata.width,
        height: finalMetadata.height,
        format: finalMetadata.format,
        size: finalBuffer.length
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
  generateMockup
};
