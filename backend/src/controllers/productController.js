/**
 * Product Controller
 * Handles product management operations
 */

import * as productService from '../services/productService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create a new product
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products
 * GET /api/products
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    
    const result = await productService.getAllProducts(activeOnly, page, limit);
    
    // For backward compatibility, return just products array if pagination not requested
    const data = req.query.page ? result : result.products;
    
    return successResponse(res, 200, 'Products retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (deactivate) product
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    return successResponse(res, 200, 'Product deactivated successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 * GET /api/products/search/:term
 */
export const searchProducts = async (req, res, next) => {
  try {
    const products = await productService.searchProducts(req.params.term);
    return successResponse(res, 200, 'Search results retrieved successfully', products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product statistics
 * GET /api/products/stats
 */
export const getProductStats = async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    return successResponse(res, 200, 'Product statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
