/**
 * Expense Service
 * API calls for expense management
 */

import api from './api';

/**
 * Create new expense
 */
export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data.data || response.data;
};

/**
 * Get all expenses with optional filters
 */
export const getAllExpenses = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.createdBy) params.append('createdBy', filters.createdBy);
  
  const response = await api.get(`/expenses?${params}`);
  return response.data.data || response.data;
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data.data || response.data;
};

/**
 * Update expense
 */
export const updateExpense = async (id, updateData) => {
  const response = await api.put(`/expenses/${id}`, updateData);
  return response.data.data || response.data;
};

/**
 * Delete expense
 */
export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data.data || response.data;
};

/**
 * Get daily expense summary
 */
export const getDailySummary = async (date = new Date().toISOString().split('T')[0]) => {
  const response = await api.get(`/expenses/summary/daily?date=${date}`);
  return response.data.data || response.data;
};

/**
 * Get monthly expense summary
 */
export const getMonthlySummary = async (month, year) => {
  const response = await api.get(`/expenses/summary/monthly?month=${month}&year=${year}`);
  return response.data.data || response.data;
};

/**
 * Approve expense
 */
export const approveExpense = async (id) => {
  const response = await api.put(`/expenses/${id}/approve`);
  return response.data.data || response.data;
};

/**
 * Reject expense
 */
export const rejectExpense = async (id, remarks) => {
  const response = await api.put(`/expenses/${id}/reject`, { remarks });
  return response.data.data || response.data;
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
