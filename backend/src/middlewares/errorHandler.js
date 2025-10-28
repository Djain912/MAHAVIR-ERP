/**
 * Global Error Handler Middleware
 * Catches all errors and sends consistent error responses
 */

import { errorResponse } from '../utils/response.js';

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    return errorResponse(res, 400, 'Validation failed', errors);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(res, 409, `${field} already exists. Please use a different value.`);
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid ${err.path}: ${err.value}`);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired');
  }
  
  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'File size too large. Maximum 5MB allowed.');
    }
    return errorResponse(res, 400, `File upload error: ${err.message}`);
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  return errorResponse(res, statusCode, message);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
};
