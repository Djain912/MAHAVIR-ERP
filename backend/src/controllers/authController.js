/**
 * Authentication Controller
 * Handles login and authentication for drivers/admins
 */

import * as driverService from '../services/driverService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Login - Authenticate driver/admin
 * POST /api/auth/login
 * Query param: ?type=admin or ?type=driver (default: driver)
 */
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const loginType = req.query.type || 'driver'; // admin or driver
    
    const result = await driverService.authenticateDriver(phone, password);
    
    // Check if login type matches user role
    if (loginType === 'admin') {
      // Only Admin and Supervisor can access admin portal
      if (result.user.role !== 'Admin' && result.user.role !== 'Supervisor') {
        return errorResponse(res, 403, 'Access denied. Admin portal is only for administrators.');
      }
    } else if (loginType === 'driver') {
      // Only Drivers can access mobile app
      if (result.user.role !== 'Driver') {
        return errorResponse(res, 403, 'Access denied. This application is only for drivers.');
      }
    }
    
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile retrieved', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint exists for consistency and future stateful session management
    return successResponse(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
};
