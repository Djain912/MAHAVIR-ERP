/**
 * Sale Controller
 * Handles sales transaction operations
 */

import * as saleService from '../services/saleService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Test Cloudinary configuration
 * GET /api/sales/test-cloudinary
 */
export const testCloudinary = async (req, res) => {
  try {
    const config = cloudinary.config();
    return successResponse(res, 200, 'Cloudinary configuration', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? 'Configured' : 'Missing',
      api_secret: config.api_secret ? 'Configured' : 'Missing'
    });
  } catch (error) {
    return errorResponse(res, 500, 'Cloudinary test failed: ' + error.message);
  }
};

/**
 * Create a new sale
 * POST /api/sales
 */
export const createSale = async (req, res, next) => {
  try {
    const sale = await saleService.createSale(req.body);
    return successResponse(res, 201, 'Sale created successfully', sale);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload cheque image
 * POST /api/sales/upload-cheque
 */
export const uploadChequeImage = async (req, res, next) => {
  try {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.log('No file in request');
      console.log('Files object:', req.files);
      return errorResponse(res, 400, 'No image file provided');
    }
    
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fieldname: req.file.fieldname
    });
    
    console.log('Uploading to Cloudinary...');
    
    try {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'cheques');
      console.log('Upload successful:', imageUrl);
      return successResponse(res, 200, 'Cheque image uploaded successfully', { imageUrl });
    } catch (cloudinaryError) {
      console.error('Cloudinary error:', cloudinaryError);
      return errorResponse(res, 500, 'Failed to upload to Cloudinary: ' + cloudinaryError.message);
    }
  } catch (error) {
    console.error('Upload controller error:', error);
    console.error('Error stack:', error.stack);
    return errorResponse(res, 500, 'Upload failed: ' + error.message);
  }
};

/**
 * Get all sales
 * GET /api/sales
 */
export const getAllSales = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      retailerId: req.query.retailerId,
      dispatchId: req.query.dispatchId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await saleService.getAllSales(filters, page, limit);
    
    // For backward compatibility, return just sales array if pagination not requested
    const data = req.query.page ? result : result.sales;
    
    return successResponse(res, 200, 'Sales retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get sale by ID
 * GET /api/sales/:id
 */
export const getSaleById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    return successResponse(res, 200, 'Sale retrieved successfully', sale);
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales by driver
 * GET /api/sales/driver/:driverId
 */
export const getSalesByDriver = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { date } = req.query;
    
    const sales = await saleService.getSalesByDriver(driverId, date);
    return successResponse(res, 200, 'Sales retrieved successfully', sales);
  } catch (error) {
    next(error);
  }
};

/**
 * Get daily sales summary for driver
 * GET /api/sales/driver/:driverId/summary
 */
export const getDailySalesSummary = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return errorResponse(res, 400, 'Date parameter is required');
    }
    
    const summary = await saleService.getDailySalesSummary(driverId, date);
    return successResponse(res, 200, 'Daily sales summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reconciliation report for dispatch
 * GET /api/sales/reconciliation/:dispatchId
 */
export const getReconciliationReport = async (req, res, next) => {
  try {
    const report = await saleService.getReconciliationReport(req.params.dispatchId);
    return successResponse(res, 200, 'Reconciliation report generated successfully', report);
  } catch (error) {
    next(error);
  }
};

/**
 * Get sale statistics
 * GET /api/sales/stats
 */
export const getSaleStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await saleService.getSaleStats(startDate, endDate);
    return successResponse(res, 200, 'Sale statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
