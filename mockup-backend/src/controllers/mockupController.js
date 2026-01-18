/**
 * Mockup Controller
 * Handles HTTP requests for mockup generation
 */

const imageService = require('../services/imageService');
const cloudinaryService = require('../services/cloudinaryService');
const validation = require('../utils/validation');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate mockup from uploaded design
 * POST /api/mockup/generate
 */
async function generateMockup(req, res) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a design image file'
      });
    }

    // Validate image file
    let dimensions;
    try {
      dimensions = await validation.validateImageFile(req.file, sharp);
    } catch (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationError.message
      });
    }

    // Parse optional query parameters
    const options = {
      // Override design area if provided
      designArea: req.query.designX && req.query.designY && req.query.designWidth && req.query.designHeight
        ? {
            x: parseInt(req.query.designX),
            y: parseInt(req.query.designY),
            width: parseInt(req.query.designWidth),
            height: parseInt(req.query.designHeight)
          }
        : undefined,
      
      // Override position if provided
      position: req.query.positionX && req.query.positionY
        ? {
            x: parseInt(req.query.positionX),
            y: parseInt(req.query.positionY)
          }
        : undefined,
      
      // Override scaling strategy
      scalingStrategy: req.query.scaling || undefined,
      
      // Override template path if provided
      templatePath: req.query.templatePath || undefined,
      
      // Override canvas size if provided
      canvasSize: req.query.canvasWidth && req.query.canvasHeight
        ? {
            width: parseInt(req.query.canvasWidth),
            height: parseInt(req.query.canvasHeight)
          }
        : undefined
    };

    // Generate mockup
    let mockupResult;
    try {
      mockupResult = await imageService.generateMockup(req.file.buffer, options);
    } catch (generationError) {
      console.error('Mockup generation error:', generationError);
      return res.status(500).json({
        error: 'Generation failed',
        message: generationError.message || 'Failed to generate mockup'
      });
    }

    // Upload to Cloudinary
    let mockupUrl;
    try {
      const uploadOptions = {
        folder: req.query.folder || 'mockups',
        public_id: req.query.publicId || undefined
      };
      
      mockupUrl = await cloudinaryService.uploadMockup(mockupResult.buffer, uploadOptions);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        error: 'Upload failed',
        message: uploadError.message || 'Failed to upload mockup to Cloudinary'
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      url: mockupUrl,
      width: mockupResult.metadata.width,
      height: mockupResult.metadata.height,
      format: mockupResult.metadata.format,
      size: mockupResult.metadata.size
    });

  } catch (error) {
    console.error('Unexpected error in generateMockup:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

/**
 * Generate mockups for ALL PNG templates in assets/mockups for ONE uploaded design
 * POST /api/mockup/generate-all
 *
 * Response:
 * {
 *   "success": true,
 *   "count": 2,
 *   "results": [
 *     { "template": "default-mockup.png", "url": "...", "width": 1000, "height": 1000 },
 *     { "template": "tshirt-front.png", "url": "...", "width": 1200, "height": 1500 }
 *   ],
 *   "errors": [
 *     { "template": "broken.png", "error": "..." }
 *   ]
 * }
 */
async function generateAllMockups(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a design image file'
      });
    }

    // Validate image file once
    try {
      await validation.validateImageFile(req.file, sharp);
    } catch (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationError.message
      });
    }

    const templatesDir =
      process.env.MOCKUP_TEMPLATES_DIR ||
      path.join(__dirname, '../../assets/mockups');

    let files;
    try {
      files = await fs.readdir(templatesDir);
    } catch (e) {
      return res.status(500).json({
        error: 'Templates folder not found',
        message: `Cannot read templates folder: ${templatesDir}`
      });
    }

    const pngTemplates = files
      .filter((f) => typeof f === 'string' && f.toLowerCase().endsWith('.png'))
      .filter((f) => f.toLowerCase() !== 'readme.png')
      .sort((a, b) => a.localeCompare(b));

    if (pngTemplates.length === 0) {
      return res.status(400).json({
        error: 'No templates found',
        message: `No .png templates found in ${templatesDir}`
      });
    }

    const folder = req.query.folder || 'mockups';
    const basePublicId = req.query.publicIdBase || 'mockup';
    const runId = Date.now();

    const results = [];
    const errors = [];

    // Sequential processing keeps memory stable
    for (let i = 0; i < pngTemplates.length; i++) {
      const template = pngTemplates[i];
      const templatePath = path.join(templatesDir, template);
      const templateBase = path.parse(template).name.replace(/[^a-z0-9_-]/gi, '_');
      const publicId = `${basePublicId}_${templateBase}_${runId}_${i}`;

      try {
        const mockupResult = await imageService.generateMockup(req.file.buffer, {
          templatePath
        });

        const url = await cloudinaryService.uploadMockup(mockupResult.buffer, {
          folder,
          public_id: publicId
        });

        results.push({
          template,
          url,
          width: mockupResult.metadata.width,
          height: mockupResult.metadata.height,
          format: mockupResult.metadata.format
        });
      } catch (e) {
        console.error(`[generateAllMockups] Failed for ${template}:`, e);
        errors.push({
          template,
          error: e?.message || String(e)
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      folder,
      templatesDir,
      results,
      errors
    });
  } catch (error) {
    console.error('Unexpected error in generateAllMockups:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

/**
 * Health check endpoint
 * GET /api/mockup/health
 */
async function healthCheck(req, res) {
  try {
    // Check if mockup template exists
    const imageService = require('../services/imageService');
    await imageService.loadMockup();
    
    return res.status(200).json({
      status: 'healthy',
      service: 'mockup-generation-api',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      service: 'mockup-generation-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  generateMockup,
  generateAllMockups,
  healthCheck
};
