/**
 * Mockup Generation API Server
 * Express server for generating product mockups
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mockupRoutes = require('./src/routes/mockupRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration (allow all origins)
// Note: credentials are disabled to allow "*" origin.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/mockup', mockupRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Mockup Generation API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      generate: 'POST /api/mockup/generate',
      health: 'GET /api/mockup/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors
  const multer = require('multer');
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds maximum allowed size of 10MB'
      });
    }
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mockup Generation API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/mockup/health`);
  console.log(`📝 API docs: http://localhost:${PORT}/`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
