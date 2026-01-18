/**
 * Mockup Configuration
 * Defines positioning, scaling, and canvas settings for mockup generation
 */

module.exports = {
  // NOTE:
  // Final output resolution is controlled by the mockup PNG dimensions (source of truth).
  // We do NOT force a fixed canvas here anymore.
  // `canvas` / `designArea` are kept only for backward compatibility / future optional modes.
  canvas: {
    width: 1000,
    height: 1000
  },
  designArea: {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000
  },

  // Scaling strategy: 'fit', 'cover', 'contain', 'fill'
  // Default is 'fill' because we stretch the design to mockup size (ignores aspect ratio).
  scalingStrategy: 'fill',

  // Background color (null = transparent, or hex color like '#ffffff')
  backgroundColor: null,

  // Output format
  outputFormat: 'png',

  // Quality settings
  quality: {
    png: {
      compressionLevel: 9,
      adaptiveFiltering: true
    }
  }
};
