/**
 * Cheque Management Service
 * Frontend API client for cheque operations
 */

import api from './api';

/**
 * Get all cheques with filters
 */
export const getAllCheques = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.bankName) params.append('bankName', filters.bankName);
    if (filters.retailerId) params.append('retailerId', filters.retailerId);
    if (filters.driverId) params.append('driverId', filters.driverId);
    if (filters.chequeNumber) params.append('chequeNumber', filters.chequeNumber);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/cheques?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error in getAllCheques:', error);
    throw error;
  }
};

/**
 * Get single cheque by ID
 */
export const getChequeById = async (chequeId) => {
  const response = await api.get(`/cheques/${chequeId}`);
  return response.data;
};

/**
 * Create new cheque
 */
export const createCheque = async (chequeData) => {
  const response = await api.post('/cheques', chequeData);
  return response.data;
};

/**
 * Update cheque status
 */
export const updateChequeStatus = async (chequeId, status, remarks = '') => {
  const response = await api.put(`/cheques/${chequeId}/status`, {
    status,
    remarks
  });
  return response.data;
};

/**
 * Bulk update cheque status
 */
export const bulkUpdateChequeStatus = async (chequeIds, status, remarks = '') => {
  const response = await api.put('/cheques/bulk-status', {
    chequeIds,
    status,
    remarks
  });
  return response.data;
};

/**
 * Delete cheque (admin only)
 */
export const deleteCheque = async (chequeId) => {
  const response = await api.delete(`/cheques/${chequeId}`);
  return response.data;
};

/**
 * Get cheque summary
 */
export const getChequeSummary = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await api.get(`/cheques/summary?${params.toString()}`);
  return response.data;
};

/**
 * Get bank-wise summary
 */
export const getBankWiseSummary = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await api.get(`/cheques/bank-summary?${params.toString()}`);
  return response.data;
};

/**
 * Get cheque statistics
 */
export const getChequeStats = async () => {
  const response = await api.get('/cheques/stats');
  return response.data;
};

/**
 * Import cheques from sales
 */
export const importChequesFromSales = async () => {
  const response = await api.post('/cheques/import-from-sales');
  return response.data;
};

/**
 * Download PDF report
 */
export const downloadChequePDF = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  if (filters.bankName) params.append('bankName', filters.bankName);
  if (filters.retailerId) params.append('retailerId', filters.retailerId);
  if (filters.driverId) params.append('driverId', filters.driverId);

  const response = await api.get(`/cheques/pdf?${params.toString()}`, {
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cheque-report-${Date.now()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return response.data;
};

export default {
  getAllCheques,
  getChequeById,
  createCheque,
  updateChequeStatus,
  bulkUpdateChequeStatus,
  deleteCheque,
  getChequeSummary,
  getBankWiseSummary,
  getChequeStats,
  importChequesFromSales,
  downloadChequePDF
};
