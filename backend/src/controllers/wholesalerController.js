/**
 * Wholesaler Controller
 * Handles HTTP requests for wholesaler operations
 */

import * as wholesalerService from '../services/wholesalerService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create a new wholesaler
 * POST /api/wholesalers
 */
export const createWholesaler = async (req, res, next) => {
  try {
    const wholesaler = await wholesalerService.createWholesaler(req.body);
    return successResponse(res, 201, 'Wholesaler created successfully', wholesaler);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all wholesalers
 * GET /api/wholesalers
 */
export const getAllWholesalers = async (req, res, next) => {
  try {
    console.log('📦 Get all wholesalers - Query params:', req.query);
    
    const filters = {
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
      city: req.query.city,
      state: req.query.state,
      search: req.query.search
    };
    
    console.log('📦 Filters after conversion:', filters);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await wholesalerService.getAllWholesalers(filters, page, limit);
    
    console.log('📦 Found wholesalers:', result.wholesalers.length);
    console.log('📦 Pagination:', result.pagination);
    
    // Return wholesalers array as data, pagination separately
    return res.status(200).json({
      success: true,
      message: 'Wholesalers retrieved successfully',
      data: result.wholesalers,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Error fetching wholesalers:', error);
    next(error);
  }
};

/**
 * Get wholesaler by ID
 * GET /api/wholesalers/:id
 */
export const getWholesalerById = async (req, res, next) => {
  try {
    const wholesaler = await wholesalerService.getWholesalerById(req.params.id);
    return successResponse(res, 200, 'Wholesaler retrieved successfully', wholesaler);
  } catch (error) {
    next(error);
  }
};

/**
 * Update wholesaler
 * PUT /api/wholesalers/:id
 */
export const updateWholesaler = async (req, res, next) => {
  try {
    const wholesaler = await wholesalerService.updateWholesaler(req.params.id, req.body);
    return successResponse(res, 200, 'Wholesaler updated successfully', wholesaler);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete wholesaler
 * DELETE /api/wholesalers/:id
 */
export const deleteWholesaler = async (req, res, next) => {
  try {
    await wholesalerService.deleteWholesaler(req.params.id);
    return successResponse(res, 200, 'Wholesaler deleted successfully');
  } catch (error) {
    next(error);
  }
};
