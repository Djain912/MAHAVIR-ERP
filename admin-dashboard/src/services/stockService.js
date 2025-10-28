/**
 * Stock Service
 * API calls for stock management
 */

import api from './api';

export const getAllStock = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/stock?${params}`);
  return response.data.data || response.data;
};

export const createStock = async (stockData) => {
  const response = await api.post('/stock', stockData);
  return response.data.data || response.data;
};

export const createStockIn = async (stockData) => {
  const response = await api.post('/stock', stockData);
  return response.data.data || response.data;
};

export const getStockSummary = async () => {
  const response = await api.get('/stock/available/summary');
  return response.data.data || response.data;
};

export const getAvailableStockSummary = async () => {
  const response = await api.get('/stock/available/summary');
  return response.data.data || response.data;
};

export const getAvailableStockByProduct = async (productId) => {
  const response = await api.get(`/stock/available/product/${productId}`);
  return response.data.data || response.data;
};

export const getLowStockAlerts = async (threshold = 10) => {
  const response = await api.get(`/stock/alerts/low?threshold=${threshold}`);
  return response.data.data || response.data;
};

export const getStockStats = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  const response = await api.get(`/stock/stats?${params}`);
  return response.data.data || response.data;
};
