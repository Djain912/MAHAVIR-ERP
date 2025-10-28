/**
 * Driver Controller
 * Handles driver management operations
 */

import * as driverService from '../services/driverService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create a new driver
 * POST /api/drivers
 */
export const createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body);
    return successResponse(res, 201, 'Driver created successfully', driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all drivers
 * GET /api/drivers
 */
export const getAllDrivers = async (req, res, next) => {
  try {
    const filters = {
      role: req.query.role,
      active: req.query.active ? req.query.active === 'true' : undefined
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await driverService.getAllDrivers(filters, page, limit);
    
    // For backward compatibility, return just drivers array if pagination not requested
    const data = req.query.page ? result : result.drivers;
    
    return successResponse(res, 200, 'Drivers retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver by ID
 * GET /api/drivers/:id
 */
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    return successResponse(res, 200, 'Driver retrieved successfully', driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Update driver
 * PUT /api/drivers/:id
 */
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    return successResponse(res, 200, 'Driver updated successfully', driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (deactivate) driver
 * DELETE /api/drivers/:id
 */
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await driverService.deleteDriver(req.params.id);
    return successResponse(res, 200, 'Driver deactivated successfully', driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Update driver password
 * PUT /api/drivers/:id/password
 */
export const updateDriverPassword = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriverPassword(req.params.id, req.body.newPassword);
    return successResponse(res, 200, 'Password updated successfully', driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver statistics
 * GET /api/drivers/stats
 */
export const getDriverStats = async (req, res, next) => {
  try {
    const stats = await driverService.getDriverStats();
    return successResponse(res, 200, 'Driver statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
