/**
 * Expense Controller
 * Handle daily expense operations
 */

import Expense from '../models/Expense.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create new expense
 * POST /api/expenses
 */
export const createExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const expense = await Expense.create(expenseData);
    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'name role')
      .populate('approvedBy', 'name role');
    
    return successResponse(res, 201, 'Expense created successfully', populatedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Get all expenses with filters
 * GET /api/expenses?startDate=&endDate=&category=&status=
 */
export const getAllExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, status, createdBy } = req.query;
    
    const filter = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    
    const expenses = await Expense.find(filter)
      .populate('createdBy', 'name role')
      .populate('approvedBy', 'name role')
      .sort({ date: -1, createdAt: -1 });
    
    // Calculate summary
    const summary = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byCategory: {}
    };
    
    expenses.forEach(exp => {
      if (!summary.byCategory[exp.category]) {
        summary.byCategory[exp.category] = { count: 0, amount: 0 };
      }
      summary.byCategory[exp.category].count++;
      summary.byCategory[exp.category].amount += exp.amount;
    });
    
    return successResponse(res, 200, 'Expenses retrieved successfully', {
      expenses,
      summary
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get expense by ID
 * GET /api/expenses/:id
 */
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('approvedBy', 'name role');
    
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    
    return successResponse(res, 200, 'Expense retrieved successfully', expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Update expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name role')
     .populate('approvedBy', 'name role');
    
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    
    return successResponse(res, 200, 'Expense updated successfully', expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    
    return successResponse(res, 200, 'Expense deleted successfully');
  } catch (error) {
    console.error('Error deleting expense:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get daily summary
 * GET /api/expenses/summary/daily?date=2025-10-25
 */
export const getDailySummary = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    const { summary, total } = await Expense.getDailySummary(date);
    
    return successResponse(res, 200, 'Daily summary retrieved successfully', {
      date,
      summary,
      total
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get monthly summary
 * GET /api/expenses/summary/monthly?month=10&year=2025
 */
export const getMonthlySummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    
    const summary = await Expense.getMonthlySummary(month, year);
    
    return successResponse(res, 200, 'Monthly summary retrieved successfully', {
      month,
      year,
      summary
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Approve expense
 * PUT /api/expenses/:id/approve
 */
export const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user.id
      },
      { new: true }
    ).populate('createdBy', 'name role')
     .populate('approvedBy', 'name role');
    
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    
    return successResponse(res, 200, 'Expense approved successfully', expense);
  } catch (error) {
    console.error('Error approving expense:', error);
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Reject expense
 * PUT /api/expenses/:id/reject
 */
export const rejectExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        approvedBy: req.user.id,
        remarks: req.body.remarks
      },
      { new: true }
    ).populate('createdBy', 'name role')
     .populate('approvedBy', 'name role');
    
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    
    return successResponse(res, 200, 'Expense rejected successfully', expense);
  } catch (error) {
    console.error('Error rejecting expense:', error);
    return errorResponse(res, 400, error.message);
  }
};

export default {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getDailySummary,
  getMonthlySummary,
  approveExpense,
  rejectExpense
};
