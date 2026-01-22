/**
 * Cloudinary Service
 * Handles uploading generated mockups to Cloudinary
 */

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Configure Cloudinary
 */
function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (cloudinaryUrl) {
    // Parse Cloudinary URL format: cloudinary://api_key:api_secret@cloud_name
    cloudinary.config(cloudinaryUrl);
  } else {
    // Fallback configuration (from ecom-backend)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dm7eyzc0c',
      api_key: process.env.CLOUDINARY_API_KEY || '988261371328627',
      api_secret: process.env.CLOUDINARY_API_SECRET || '5JNztGOWVc5e7gsWespVYb8e2bg'
    });
  }
}

// Initialize on module load
configureCloudinary();

/**
 * Convert buffer to stream for Cloudinary upload
 */
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Upload mockup image to Cloudinary
 * @param {Buffer} imageBuffer - The generated mockup image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
async function uploadMockup(imageBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    // Check file size before upload (Cloudinary free plan limit: 10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const fileSize = imageBuffer.length;
    
    if (fileSize > maxSizeBytes) {
      const errorMsg = `File size too large. Got ${fileSize}. Maximum is ${maxSizeBytes}. Upgrade your plan to enjoy higher limits https://www.cloudinary.com/pricing/upgrades/file-limit`;
      console.error('Upload rejected:', errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    // Determine format from buffer or options
    const format = options.format || (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 ? 'jpg' : 'png');
    
    const uploadOptions = {
      folder: options.folder || 'mockups',
      resource_type: 'image',
      format: format,
      overwrite: true,
      ...options
    };

    // Remove format from options if it was added (Cloudinary handles it automatically)
    delete uploadOptions.format;

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload mockup to Cloudinary: ${error.message}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const imageStream = bufferToStream(imageBuffer);
    imageStream.pipe(uploadStream);
  });
}

/**
 * Upload mockup from file path (alternative method)
 */
async function uploadMockupFromPath(filePath, options = {}) {
  try {
    const uploadOptions = {
      folder: options.folder || 'mockups',
      resource_type: 'image',
      format: 'png',
      overwrite: true,
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload mockup to Cloudinary: ${error.message}`);
  }
}

module.exports = {
  uploadMockup,
  uploadMockupFromPath,
  configureCloudinary
};
