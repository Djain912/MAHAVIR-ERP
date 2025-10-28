/**
 * Sale Routes
 * Routes for sales transaction management
 */

import express from 'express';
import * as saleController from '../controllers/saleController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validation.js';
import { saleValidation } from '../utils/validation.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Test endpoint (no auth required)
router.get('/test-cloudinary', saleController.testCloudinary);

// Protect all routes
router.use(authenticate);

/**
 * @route   POST /api/sales/upload-cheque
 * @desc    Upload cheque image
 * @access  Private (Driver)
 */
router.post('/upload-cheque', upload.single('cheque'), saleController.uploadChequeImage);

/**
 * @route   GET /api/sales/stats
 * @desc    Get sale statistics
 * @access  Private (Admin, Supervisor)
 */
router.get('/stats', authorize('Admin', 'Supervisor'), saleController.getSaleStats);

/**
 * @route   GET /api/sales/reconciliation/:dispatchId
 * @desc    Get reconciliation report for dispatch
 * @access  Private (Admin, Supervisor)
 */
router.get('/reconciliation/:dispatchId', authorize('Admin', 'Supervisor'), validateObjectId('dispatchId'), saleController.getReconciliationReport);

/**
 * @route   GET /api/sales/driver/:driverId/summary
 * @desc    Get daily sales summary for driver
 * @access  Private
 */
router.get('/driver/:driverId/summary', validateObjectId('driverId'), saleController.getDailySalesSummary);

/**
 * @route   GET /api/sales/driver/:driverId
 * @desc    Get sales by driver
 * @access  Private
 */
router.get('/driver/:driverId', validateObjectId('driverId'), saleController.getSalesByDriver);

/**
 * @route   POST /api/sales
 * @desc    Create a new sale
 * @access  Private (Driver)
 */
router.post('/', validate(saleValidation.create), saleController.createSale);

/**
 * @route   GET /api/sales
 * @desc    Get all sales
 * @access  Private (Admin, Supervisor)
 */
router.get('/', authorize('Admin', 'Supervisor'), saleController.getAllSales);

/**
 * @route   GET /api/sales/:id
 * @desc    Get sale by ID
 * @access  Private
 */
router.get('/:id', validateObjectId(), saleController.getSaleById);

export default router;
