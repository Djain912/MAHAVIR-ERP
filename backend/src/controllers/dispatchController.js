/**
 * Dispatch Controller
 * Handles driver dispatch operations
 */

import * as dispatchService from '../services/dispatchService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create driver dispatch
 * POST /api/dispatches
 */
export const createDriverDispatch = async (req, res, next) => {
  try {
    const dispatch = await dispatchService.createDriverDispatch(req.body);
    return successResponse(res, 201, 'Driver dispatch created successfully', dispatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all dispatches
 * GET /api/dispatches
 */
export const getAllDispatches = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const dispatches = await dispatchService.getAllDispatches(filters);
    return successResponse(res, 200, 'Dispatches retrieved successfully', dispatches);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dispatch by ID
 * GET /api/dispatches/:id
 */
export const getDispatchById = async (req, res, next) => {
  try {
    const dispatch = await dispatchService.getDriverDispatchById(req.params.id);
    return successResponse(res, 200, 'Dispatch retrieved successfully', dispatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Get active dispatch for driver
 * GET /api/dispatches/driver/:driverId/active
 */
export const getActiveDispatchForDriver = async (req, res, next) => {
  try {
    const dispatch = await dispatchService.getActiveDispatchForDriver(req.params.driverId);
    
    if (!dispatch) {
      return successResponse(res, 200, 'No active dispatch found', null);
    }
    
    return successResponse(res, 200, 'Active dispatch retrieved successfully', dispatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Update dispatch status
 * PUT /api/dispatches/:id/status
 */
export const updateDispatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const dispatch = await dispatchService.updateDispatchStatus(req.params.id, status);
    return successResponse(res, 200, 'Dispatch status updated successfully', dispatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dispatch statistics
 * GET /api/dispatches/stats
 */
export const getDispatchStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await dispatchService.getDispatchStats(startDate, endDate);
    return successResponse(res, 200, 'Dispatch statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
