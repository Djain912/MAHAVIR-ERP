/**
 * Stock Routes
 * Routes for stock intake management
 */

import express from 'express';
import * as stockController from '../controllers/stockController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validation.js';
import { stockValidation } from '../utils/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

/**
 * @route   GET /api/stock/stats
 * @desc    Get stock statistics
 * @access  Private (Admin, Supervisor)
 */
router.get('/stats', authorize('Admin', 'Supervisor'), stockController.getStockStats);

/**
 * @route   GET /api/stock/available/summary
 * @desc    Get available stock summary
 * @access  Private (Admin, Supervisor)
 */
router.get('/available/summary', authorize('Admin', 'Supervisor'), stockController.getAvailableStockSummary);

/**
 * @route   GET /api/stock/available/product/:productId
 * @desc    Get available stock by product
 * @access  Private (Admin, Supervisor)
 */
router.get('/available/product/:productId', authorize('Admin', 'Supervisor'), validateObjectId('productId'), stockController.getAvailableStockByProduct);

/**
 * @route   GET /api/stock/alerts/low
 * @desc    Get low stock alerts
 * @access  Private (Admin, Supervisor)
 */
router.get('/alerts/low', authorize('Admin', 'Supervisor'), stockController.getLowStockAlerts);

/**
 * Middleware to normalize stock data before validation
 */
const normalizeStockData = (req, res, next) => {
  if (req.body.product && !req.body.productId) {
    req.body.productId = req.body.product;
  }
  if (req.body.batchNumber && !req.body.batchNo) {
    req.body.batchNo = req.body.batchNumber;
  }
  next();
};

/**
 * @route   POST /api/stock
 * @desc    Create stock intake entry
 * @access  Private (Admin, Supervisor)
 */
router.post('/', authorize('Admin', 'Supervisor'), normalizeStockData, validate(stockValidation.create), stockController.createStockIn);

/**
 * @route   GET /api/stock
 * @desc    Get all stock intake records
 * @access  Private (Admin, Supervisor)
 */
router.get('/', authorize('Admin', 'Supervisor'), stockController.getAllStockIn);

/**
 * @route   GET /api/stock/:id
 * @desc    Get stock intake by ID
 * @access  Private (Admin, Supervisor)
 */
router.get('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), stockController.getStockInById);

export default router;
