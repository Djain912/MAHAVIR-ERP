/**
 * Wholesaler Routes
 * Routes for wholesaler management
 */

import express from 'express';
import * as wholesalerController from '../controllers/wholesalerController.js';
import * as wholesalerBillController from '../controllers/wholesalerBillController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateObjectId } from '../middlewares/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

/**
 * @route   POST /api/wholesalers
 * @desc    Create a new wholesaler
 * @access  Private (Admin, Supervisor)
 */
router.post('/', authorize('Admin', 'Supervisor'), wholesalerController.createWholesaler);

/**
 * @route   GET /api/wholesalers
 * @desc    Get all wholesalers
 * @access  Private
 */
router.get('/', wholesalerController.getAllWholesalers);

/**
 * @route   GET /api/wholesalers/bill-date-range
 * @desc    Get available dispatch date range for bills
 * @access  Private
 */
router.get('/bill-date-range', wholesalerBillController.getDispatchDateRange);

/**
 * @route   GET /api/wholesalers/bill-data
 * @desc    Get all wholesale bill data
 * @access  Private
 */
router.get('/bill-data', wholesalerBillController.getAllWholesaleBillData);

/**
 * @route   POST /api/wholesalers/generate-bill
 * @desc    Generate PDF bill for all wholesale dispatches
 * @access  Private (Admin, Supervisor)
 */
router.post('/generate-bill', authorize('Admin', 'Supervisor'), wholesalerBillController.generateAllWholesaleBill);

/**
 * @route   GET /api/wholesalers/bill-data/:wholesalerId
 * @desc    Get wholesaler bill data
 * @access  Private
 */
router.get('/bill-data/:wholesalerId', validateObjectId(), wholesalerBillController.getWholesalerBillData);

/**
 * @route   POST /api/wholesalers/generate-bill/:wholesalerId
 * @desc    Generate PDF bill for wholesaler
 * @access  Private (Admin, Supervisor)
 */
router.post('/generate-bill/:wholesalerId', authorize('Admin', 'Supervisor'), validateObjectId(), wholesalerBillController.generateWholesalerBill);

/**
 * @route   GET /api/wholesalers/:id
 * @desc    Get wholesaler by ID
 * @access  Private
 */
router.get('/:id', validateObjectId(), wholesalerController.getWholesalerById);

/**
 * @route   PUT /api/wholesalers/:id
 * @desc    Update wholesaler
 * @access  Private (Admin, Supervisor)
 */
router.put('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), wholesalerController.updateWholesaler);

/**
 * @route   DELETE /api/wholesalers/:id
 * @desc    Delete wholesaler
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('Admin'), validateObjectId(), wholesalerController.deleteWholesaler);

export default router;
