/**
 * Product Routes
 * Routes for product management
 */

import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validation.js';
import { productValidation } from '../utils/validation.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

/**
 * @route   GET /api/products/stats
 * @desc    Get product statistics
 * @access  Private (Admin, Supervisor)
 */
router.get('/stats', authorize('Admin', 'Supervisor'), productController.getProductStats);

/**
 * @route   GET /api/products/search/:term
 * @desc    Search products
 * @access  Private
 */
router.get('/search/:term', productController.searchProducts);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin, Supervisor)
 */
router.post('/', authorize('Admin', 'Supervisor'), validate(productValidation.create), productController.createProduct);

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Private
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', validateObjectId(), productController.getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin, Supervisor)
 */
router.put('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), validate(productValidation.update), productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete (deactivate) product
 * @access  Private (Admin, Supervisor)
 */
router.delete('/:id', authorize('Admin', 'Supervisor'), validateObjectId(), productController.deleteProduct);

export default router;
