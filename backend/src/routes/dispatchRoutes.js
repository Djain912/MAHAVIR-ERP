/**
 * Dispatch Routes
 * Routes for driver dispatch management
 */

import express from 'express';
import * as dispatchController from '../controllers/dispatchController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validation.js';
import { driverDispatchValidation } from '../utils/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

/**
 * @route   GET /api/dispatches/stats
 * @desc    Get dispatch statistics
 * @access  Private (Admin, Supervisor)
 */
router.get('/stats', authorize('Admin', 'Supervisor'), dispatchController.getDispatchStats);

/**
 * @route   GET /api/dispatches/driver/:driverId/active
 * @desc    Get active dispatch for driver
 * @access  Private
 */
router.get('/driver/:driverId/active', validateObjectId('driverId'), dispatchController.getActiveDispatchForDriver);

/**
 * @route   POST /api/dispatches
 * @desc    Create driver dispatch
 * @access  Private (Admin, Supervisor)
 */
router.post('/', authorize('Admin', 'Supervisor'), validate(driverDispatchValidation.create), dispatchController.createDriverDispatch);

/**
 * @route   GET /api/dispatches
 * @desc    Get all dispatches
 * @access  Private (Admin, Supervisor)
 */
router.get('/', authorize('Admin', 'Supervisor'), dispatchController.getAllDispatches);

/**
 * @route   GET /api/dispatches/:id
 * @desc    Get dispatch by ID
 * @access  Private
 */
router.get('/:id', validateObjectId(), dispatchController.getDispatchById);

/**
 * @route   PUT /api/dispatches/:id/status
 * @desc    Update dispatch status
 * @access  Private (Admin, Supervisor)
 */
router.put('/:id/status', authorize('Admin', 'Supervisor'), validateObjectId(), dispatchController.updateDispatchStatus);

export default router;
