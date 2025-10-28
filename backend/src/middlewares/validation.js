/**
 * Validation Middleware
 * Validates request body against Joi schemas
 */

import { errorResponse } from '../utils/response.js';

/**
 * Validate request data against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, query, params)
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return errorResponse(res, 400, 'Validation failed', errors);
    }
    
    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

/**
 * Validate MongoDB ObjectId
 * @param {String} paramName - Parameter name to validate
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    // MongoDB ObjectId regex pattern
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdPattern.test(id)) {
      return errorResponse(res, 400, `Invalid ${paramName}. Must be a valid MongoDB ObjectId.`);
    }
    
    next();
  };
};
