/**
 * Expense Routes
 */

import express from 'express';
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getDailySummary,
  getMonthlySummary,
  approveExpense,
  rejectExpense
} from '../controllers/expenseController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', createExpense);
router.get('/', getAllExpenses);
router.get('/summary/daily', getDailySummary);
router.get('/summary/monthly', getMonthlySummary);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Approval routes
router.put('/:id/approve', approveExpense);
router.put('/:id/reject', rejectExpense);

export default router;
