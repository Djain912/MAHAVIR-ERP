/**
 * Authentication Routes
 * Routes for login, logout, and profile
 */

import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { driverValidation } from '../utils/validation.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login driver/admin
 * @access  Public
 */
router.post('/login', validate(driverValidation.login), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

export default router;
