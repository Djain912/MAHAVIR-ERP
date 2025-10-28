/**
 * Counter Sale Routes
 */

import express from 'express';
import {
  createCounterSale,
  getAllCounterSales,
  getCounterSaleById,
  updateCounterSale,
  deleteCounterSale,
  getDailySummary,
  getAvailableProducts
} from '../controllers/counterSaleController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', createCounterSale);
router.get('/', getAllCounterSales);
router.get('/summary/daily', getDailySummary);
router.get('/products', getAvailableProducts);
router.get('/:id', getCounterSaleById);
router.put('/:id', updateCounterSale);
router.delete('/:id', deleteCounterSale);

export default router;
