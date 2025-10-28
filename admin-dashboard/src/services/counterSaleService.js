/**
 * Counter Sale Service
 * API calls for counter sale management
 */

import api from './api';

/**
 * Create new counter sale
 */
export const createCounterSale = async (saleData) => {
  const response = await api.post('/counter-sales', saleData);
  return response.data.data || response.data;
};

/**
 * Get all counter sales with optional filters
 */
export const getAllCounterSales = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.customerType) params.append('customerType', filters.customerType);
  if (filters.saleNumber) params.append('saleNumber', filters.saleNumber);
  
  const response = await api.get(`/counter-sales?${params}`);
  return response.data.data || response.data;
};

/**
 * Get counter sale by ID
 */
export const getCounterSaleById = async (id) => {
  const response = await api.get(`/counter-sales/${id}`);
  return response.data.data || response.data;
};

/**
 * Update counter sale
 */
export const updateCounterSale = async (id, updateData) => {
  const response = await api.put(`/counter-sales/${id}`, updateData);
  return response.data.data || response.data;
};

/**
 * Delete counter sale
 */
export const deleteCounterSale = async (id) => {
  const response = await api.delete(`/counter-sales/${id}`);
  return response.data.data || response.data;
};

/**
 * Get daily counter sale summary
 */
export const getDailySummary = async (date = new Date().toISOString().split('T')[0]) => {
  const response = await api.get(`/counter-sales/summary/daily?date=${date}`);
  return response.data.data || response.data;
};

/**
 * Get available products for counter sale
 */
export const getAvailableProducts = async () => {
  const response = await api.get('/counter-sales/products');
  return response.data.data || response.data;
};

export default {
  createCounterSale,
  getAllCounterSales,
  getCounterSaleById,
  updateCounterSale,
  deleteCounterSale,
  getDailySummary,
  getAvailableProducts
};
