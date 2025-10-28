/**
 * Driver Routes
 * Routes for driver management (Admin only)
 */

import express from 'express';
import * as driverController from '../controllers/driverController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validation.js';
import { driverValidation } from '../utils/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

/**
 * @route   GET /api/drivers/stats
 * @desc    Get driver statistics
 * @access  Private (Admin, Supervisor)
 */
router.get('/stats', authorize('Admin', 'Supervisor'), driverController.getDriverStats);

/**
 * @route   POST /api/drivers
 * @desc    Create a new driver
 * @access  Private (Admin only)
 */
router.post('/', authorize('Admin'), validate(driverValidation.create), driverController.createDriver);

/**
 * @route   GET /api/drivers
 * @desc    Get all drivers
 * @access  Private (Admin, Supervisor)
 */
router.get('/', authorize('Admin', 'Supervisor'), driverController.getAllDrivers);

/**
 * @route   GET /api/drivers/:id
 * @desc    Get driver by ID
 * @access  Private (Admin, Supervisor)
 */
router.get('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), driverController.getDriverById);

/**
 * @route   PUT /api/drivers/:id
 * @desc    Update driver
 * @access  Private (Admin only)
 */
router.put('/:id', authorize('Admin'), validateObjectId(), validate(driverValidation.update), driverController.updateDriver);

/**
 * @route   PUT /api/drivers/:id/password
 * @desc    Update driver password
 * @access  Private (Admin only)
 */
router.put('/:id/password', authorize('Admin'), validateObjectId(), validate(driverValidation.updatePassword), driverController.updateDriverPassword);

/**
 * @route   DELETE /api/drivers/:id
 * @desc    Delete (deactivate) driver
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize('Admin'), validateObjectId(), driverController.deleteDriver);

export default router;
