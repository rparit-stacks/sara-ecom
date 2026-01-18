/**
 * Validation utilities for image uploads
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 100; // Minimum width or height
const MAX_DIMENSION = 10000; // Maximum width or height

/**
 * Validate file type
 */
function validateFileType(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const mimeType = file.mimetype?.toLowerCase();
  const originalName = file.originalname?.toLowerCase() || '';
  const extension = originalName.split('.').pop();

  // Check MIME type
  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Check file extension
  if (extension && !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(`Invalid file extension: ${extension}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  return true;
}

/**
 * Validate file size
 */
function validateFileSize(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  return true;
}

/**
 * Validate image dimensions
 */
async function validateDimensions(sharp, buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      throw new Error('Unable to read image dimensions');
    }

    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      throw new Error(`Image dimensions too small. Minimum: ${MIN_DIMENSION}x${MIN_DIMENSION}px`);
    }

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      throw new Error(`Image dimensions too large. Maximum: ${MAX_DIMENSION}x${MAX_DIMENSION}px`);
    }

    return { width, height };
  } catch (error) {
    if (error.message.includes('dimensions')) {
      throw error;
    }
    throw new Error('Invalid image file or corrupted image');
  }
}

/**
 * Validate all aspects of uploaded file
 */
async function validateImageFile(file, sharp) {
  // Validate file type
  validateFileType(file);

  // Validate file size
  validateFileSize(file);

  // Validate dimensions (requires reading the image)
  const dimensions = await validateDimensions(sharp, file.buffer);

  return dimensions;
}

module.exports = {
  validateFileType,
  validateFileSize,
  validateDimensions,
  validateImageFile,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MIN_DIMENSION,
  MAX_DIMENSION
};
