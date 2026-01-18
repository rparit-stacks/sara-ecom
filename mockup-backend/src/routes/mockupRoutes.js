/**
 * Mockup Routes
 * Defines API endpoints for mockup generation
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const mockupController = require('../controllers/mockupController');

// Configure multer for file uploads
// Store file in memory as buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Basic file type check (detailed validation in controller)
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

/**
 * POST /api/mockup/generate
 * Generate mockup from uploaded design image
 * 
 * Request:
 *   - multipart/form-data with 'design' file field
 *   - Optional query params:
 *     - designX, designY, designWidth, designHeight: Override design area
 *     - positionX, positionY: Override design position
 *     - scaling: Scaling strategy (fit, cover, contain, fill)
 *     - templatePath: Custom mockup template path
 *     - canvasWidth, canvasHeight: Override canvas size
 *     - folder: Cloudinary folder (default: 'mockups')
 *     - publicId: Custom Cloudinary public_id
 * 
 * Response:
 *   {
 *     "success": true,
 *     "url": "https://res.cloudinary.com/...",
 *     "width": 2000,
 *     "height": 2000,
 *     "format": "png",
 *     "size": 1234567
 *   }
 */
router.post('/generate', upload.single('design'), mockupController.generateMockup);

/**
 * POST /api/mockup/generate-all
 * Generate mockups for ALL .png templates in assets/mockups for ONE uploaded design.
 *
 * Request:
 *  - multipart/form-data with 'design' file field
 *  - Optional query params:
 *    - folder: Cloudinary folder (default: 'mockups')
 *    - publicIdBase: base prefix for Cloudinary public_id (default: 'mockup')
 *
 * Response:
 *  {
 *    "success": true,
 *    "count": 2,
 *    "results": [{ "template": "...", "url": "...", "width": 1000, "height": 1000, "format": "png" }],
 *    "errors": [{ "template": "...", "error": "..." }]
 *  }
 */
router.post('/generate-all', upload.single('design'), mockupController.generateAllMockups);

/**
 * GET /api/mockup/health
 * Health check endpoint
 */
router.get('/health', mockupController.healthCheck);

module.exports = router;
