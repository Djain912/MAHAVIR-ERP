/**
 * Sale Service
 * API calls for sales management
 */

import api from './api';

export const getAllSales = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/sales?${params}`);
  return response.data;
};

export const getSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

export const getReconciliationReport = async (dispatchId) => {
  const response = await api.get(`/sales/reconciliation/${dispatchId}`);
  return response.data;
};

export const getSaleStats = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  const response = await api.get(`/sales/stats?${params}`);
  return response.data;
};
