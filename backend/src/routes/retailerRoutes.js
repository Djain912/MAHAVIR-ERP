/**
 * Retailer Routes
 * Routes for retailer management
 */

import express from 'express';
import * as retailerController from '../controllers/retailerController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validation.js';
import { retailerValidation } from '../utils/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

/**
 * @route   GET /api/retailers/stats
 * @desc    Get retailer statistics
 * @access  Private (Admin, Supervisor)
 */
router.get('/stats', authorize('Admin', 'Supervisor'), retailerController.getRetailerStats);

/**
 * @route   GET /api/retailers/routes/all
 * @desc    Get all unique routes
 * @access  Private
 */
router.get('/routes/all', retailerController.getAllRoutes);

/**
 * @route   POST /api/retailers
 * @desc    Create a new retailer
 * @access  Private (Admin, Supervisor)
 */
router.post('/', authorize('Admin', 'Supervisor'), validate(retailerValidation.create), retailerController.createRetailer);

/**
 * @route   GET /api/retailers
 * @desc    Get all retailers
 * @access  Private
 */
router.get('/', retailerController.getAllRetailers);

/**
 * @route   GET /api/retailers/route/:route
 * @desc    Get retailers by route
 * @access  Private
 */
router.get('/route/:route', retailerController.getRetailersByRoute);

/**
 * @route   GET /api/retailers/:id
 * @desc    Get retailer by ID
 * @access  Private
 */
router.get('/:id', validateObjectId(), retailerController.getRetailerById);

/**
 * @route   PUT /api/retailers/:id
 * @desc    Update retailer
 * @access  Private (Admin, Supervisor)
 */
router.put('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), validate(retailerValidation.update), retailerController.updateRetailer);

/**
 * @route   DELETE /api/retailers/:id
 * @desc    Delete (deactivate) retailer
 * @access  Private (Admin, Supervisor)
 */
router.delete('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), retailerController.deleteRetailer);

export default router;
