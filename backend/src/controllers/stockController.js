/**
 * Stock Controller
 * Handles warehouse stock intake operations
 */

import * as stockService from '../services/stockService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create stock intake entry
 * POST /api/stock
 */
export const createStockIn = async (req, res, next) => {
  try {
    // Normalize field names for flexibility
    const stockData = {
      productId: req.body.productId || req.body.product,
      quantity: req.body.quantity,
      batchNo: req.body.batchNo || req.body.batchNumber,
      dateReceived: req.body.dateReceived || new Date(),
      expiryDate: req.body.expiryDate,
      purchaseRate: req.body.purchaseRate,
      sellingRate: req.body.sellingRate
    };
    
    const stock = await stockService.createStockIn(stockData);
    return successResponse(res, 201, 'Stock intake recorded successfully', stock);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stock intake records
 * GET /api/stock
 */
export const getAllStockIn = async (req, res, next) => {
  try {
    const filters = {
      productId: req.query.productId,
      batchNo: req.query.batchNo,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const stockRecords = await stockService.getAllStockIn(filters);
    return successResponse(res, 200, 'Stock records retrieved successfully', stockRecords);
  } catch (error) {
    next(error);
  }
};

/**
 * Get stock intake by ID
 * GET /api/stock/:id
 */
export const getStockInById = async (req, res, next) => {
  try {
    const stock = await stockService.getStockInById(req.params.id);
    return successResponse(res, 200, 'Stock record retrieved successfully', stock);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available stock summary
 * GET /api/stock/available/summary
 */
export const getAvailableStockSummary = async (req, res, next) => {
  try {
    const summary = await stockService.getAvailableStockSummary();
    return successResponse(res, 200, 'Available stock summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available stock by product
 * GET /api/stock/available/product/:productId
 */
export const getAvailableStockByProduct = async (req, res, next) => {
  try {
    const stock = await stockService.getAvailableStockByProduct(req.params.productId);
    return successResponse(res, 200, 'Available stock retrieved successfully', stock);
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock alerts
 * GET /api/stock/alerts/low
 */
export const getLowStockAlerts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const alerts = await stockService.getLowStockAlerts(threshold);
    return successResponse(res, 200, 'Low stock alerts retrieved successfully', alerts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get stock statistics
 * GET /api/stock/stats
 */
export const getStockStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await stockService.getStockStats(startDate, endDate);
    return successResponse(res, 200, 'Stock statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
