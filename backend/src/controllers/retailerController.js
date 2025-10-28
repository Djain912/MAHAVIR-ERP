/**
 * Retailer Controller
 * Handles retailer management operations
 */

import * as retailerService from '../services/retailerService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create a new retailer
 * POST /api/retailers
 */
export const createRetailer = async (req, res, next) => {
  try {
    const retailer = await retailerService.createRetailer(req.body);
    return successResponse(res, 201, 'Retailer created successfully', retailer);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all retailers
 * GET /api/retailers
 */
export const getAllRetailers = async (req, res, next) => {
  try {
    const filters = {
      route: req.query.route,
      active: req.query.active ? req.query.active === 'true' : undefined
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await retailerService.getAllRetailers(filters, page, limit);
    
    // For backward compatibility, return just retailers array if pagination not requested
    const data = req.query.page ? result : result.retailers;
    
    return successResponse(res, 200, 'Retailers retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get retailer by ID
 * GET /api/retailers/:id
 */
export const getRetailerById = async (req, res, next) => {
  try {
    const retailer = await retailerService.getRetailerById(req.params.id);
    return successResponse(res, 200, 'Retailer retrieved successfully', retailer);
  } catch (error) {
    next(error);
  }
};

/**
 * Update retailer
 * PUT /api/retailers/:id
 */
export const updateRetailer = async (req, res, next) => {
  try {
    const retailer = await retailerService.updateRetailer(req.params.id, req.body);
    return successResponse(res, 200, 'Retailer updated successfully', retailer);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (deactivate) retailer
 * DELETE /api/retailers/:id
 */
export const deleteRetailer = async (req, res, next) => {
  try {
    const retailer = await retailerService.deleteRetailer(req.params.id);
    return successResponse(res, 200, 'Retailer deactivated successfully', retailer);
  } catch (error) {
    next(error);
  }
};

/**
 * Get retailers by route
 * GET /api/retailers/route/:route
 */
export const getRetailersByRoute = async (req, res, next) => {
  try {
    const retailers = await retailerService.getRetailersByRoute(req.params.route);
    return successResponse(res, 200, 'Retailers retrieved successfully', retailers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all unique routes
 * GET /api/retailers/routes/all
 */
export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await retailerService.getAllRoutes();
    return successResponse(res, 200, 'Routes retrieved successfully', routes);
  } catch (error) {
    next(error);
  }
};

/**
 * Get retailer statistics
 * GET /api/retailers/stats
 */
export const getRetailerStats = async (req, res, next) => {
  try {
    const stats = await retailerService.getRetailerStats();
    return successResponse(res, 200, 'Retailer statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
