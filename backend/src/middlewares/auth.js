/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

import { verifyToken } from '../utils/jwtUtils.js';
import { errorResponse } from '../utils/response.js';
import Driver from '../models/Driver.js';

/**
 * Verify JWT token from Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided. Authorization denied.');
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🎫 Token received (first 20 chars):', token.substring(0, 20) + '...');
    
    // Verify token
    const decoded = verifyToken(token);
    console.log('✅ Token decoded - ID:', decoded.id, '| Role:', decoded.role);
    
    // Check if user still exists
    const user = await Driver.findById(decoded.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 401, 'User not found. Token invalid.');
    }
    
    if (!user.active) {
      return errorResponse(res, 401, 'User account is deactivated.');
    }
    
    console.log('👤 User authenticated:', user.name, '| Role:', user.role);
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return errorResponse(res, 401, error.message || 'Token verification failed.');
  }
};

/**
 * Authorize specific roles
 * @param  {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }
    
    console.log('🔐 Authorization check - User role:', req.user.role, '| Required roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, `Access denied. ${roles.join(',') || 'Unknown'} role required.`);
    }
    
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work both authenticated and unauthenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await Driver.findById(decoded.id).select('-password');
      
      if (user && user.active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
