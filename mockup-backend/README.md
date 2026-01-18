# Mockup Generation API

A Node.js/Express backend service that generates product mockups by compositing user-uploaded designs with transparent PNG mockup templates. Uses Sharp for fast image processing and Cloudinary for result storage.

## Features

- Simple image compositing (layering user design + mockup overlay)
- Supports JPG, PNG, and WebP input formats
- Always outputs PNG format
- Automatic image normalization and resizing
- Cloudinary integration for result storage
- Configurable positioning and scaling
- Fast and reliable using Sharp library

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Cloudinary account (or use existing credentials)

## Installation

1. Navigate to the mockup-backend directory:
```bash
cd mockup-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- Cloudinary credentials
- Mockup template path
- Port (default: 3001)

4. Add mockup template:
   - Place your transparent PNG mockup template in `assets/mockups/`
   - Default filename: `default-mockup.png`
   - Or configure path via `MOCKUP_TEMPLATE_PATH` in `.env`

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Generate Mockup

**POST** `/api/mockup/generate`

Generate a mockup by compositing a user-uploaded design with the mockup template.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `design` file field
- Optional query parameters:
  - `designX`, `designY`, `designWidth`, `designHeight` - Override design area
  - `positionX`, `positionY` - Override design position
  - `scaling` - Scaling strategy (`fit`, `cover`, `contain`, `fill`)
  - `templatePath` - Custom mockup template path
  - `canvasWidth`, `canvasHeight` - Override canvas size
  - `folder` - Cloudinary folder (default: `mockups`)
  - `publicId` - Custom Cloudinary public_id

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../mockup.png",
  "width": 2000,
  "height": 2000,
  "format": "png",
  "size": 1234567
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3001/api/mockup/generate \
  -F "design=@/path/to/user-design.jpg" \
  -F "scaling=fit"
```

**Example using JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('design', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/mockup/generate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Mockup URL:', result.url);
```

### Health Check

**GET** `/api/mockup/health`

Check if the service is running and mockup template is accessible.

**Response:**
```json
{
  "status": "healthy",
  "service": "mockup-generation-api",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

## Configuration

### Mockup Configuration

Edit `src/config/mockupConfig.js` to customize:
- Canvas size (default: 2000x2000)
- Design area position and dimensions
- Scaling strategy
- Background color
- Output quality settings

### Environment Variables

See `.env.example` for all available configuration options.

## How It Works

1. **User uploads design** (JPG, PNG, or WebP)
2. **Image normalization**: Convert to PNG, validate dimensions
3. **Load mockup template**: Read transparent PNG from filesystem
4. **Resize design**: Scale user design to fit configured area
5. **Composite images**: Layer design under mockup overlay
6. **Upload to Cloudinary**: Store result and get URL
7. **Return URL**: Send generated mockup URL to client

## Image Compositing Process

```
[Transparent Canvas]
    ↓
[User Design] (positioned at x, y)
    ↓
[Mockup Overlay] (with transparency preserved)
    ↓
[Final PNG Output]
```

## Error Handling

The API returns appropriate HTTP status codes:
- `400` - Bad Request (validation errors, invalid file)
- `500` - Internal Server Error (processing errors, Cloudinary failures)
- `503` - Service Unavailable (health check fails)

Error response format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Integration with Frontend

### React/TypeScript Example

```typescript
import { useState } from 'react';

const generateMockup = async (file: File) => {
  const formData = new FormData();
  formData.append('design', file);

  const response = await fetch('http://localhost:3001/api/mockup/generate', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to generate mockup');
  }

  const data = await response.json();
  return data.url;
};

// Usage
const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    try {
      const mockupUrl = await generateMockup(file);
      console.log('Generated mockup:', mockupUrl);
    } catch (error) {
      console.error('Error:', error);
    }
  }
};
```

## File Structure

```
mockup-backend/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env                      # Environment variables
├── .env.example              # Example env file
├── src/
│   ├── routes/
│   │   └── mockupRoutes.js   # API routes
│   ├── controllers/
│   │   └── mockupController.js # Request handlers
│   ├── services/
│   │   ├── imageService.js   # Sharp image processing
│   │   └── cloudinaryService.js # Cloudinary uploads
│   ├── config/
│   │   └── mockupConfig.js   # Mockup configuration
│   └── utils/
│       └── validation.js     # File validation
└── assets/
    └── mockups/
        └── default-mockup.png # Mockup template
```

## Dependencies

- **express** - Web framework
- **sharp** - Fast image processing
- **cloudinary** - Image storage and CDN
- **multer** - File upload handling
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## Development

### Running Tests

Currently, manual testing is recommended. Test with various image formats and sizes.

### Debugging

Set `NODE_ENV=development` in `.env` to see detailed error stacks in responses.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure proper CORS origins
3. Use process manager (PM2, systemd, etc.)
4. Set up reverse proxy (nginx, etc.)
5. Configure Cloudinary production settings

## Troubleshooting

### Mockup template not found
- Check `MOCKUP_TEMPLATE_PATH` in `.env`
- Ensure template file exists at specified path
- Verify file permissions

### Cloudinary upload fails
- Verify Cloudinary credentials in `.env`
- Check network connectivity
- Review Cloudinary dashboard for errors

### Image processing errors
- Verify input image is valid
- Check file size limits
- Ensure Sharp is properly installed (may require native dependencies)

## License

ISC

## Support

For issues or questions, refer to the main project documentation.
