/**
 * Salary Slip Service
 * Frontend API client for salary slip operations
 */

import api from './api';

/**
 * Generate salary slip for employee
 */
export const generateSalarySlip = async ({ employeeId, month, year, commission }) => {
  const response = await api.post('/salary-slips/generate', {
    employeeId,
    month,
    year,
    commission
  });
  return response.data.data || response.data;
};

/**
 * Bulk generate salary slips for all employees
 */
export const bulkGenerateSalarySlips = async ({ month, year, commissions }) => {
  const response = await api.post('/salary-slips/bulk-generate', {
    month,
    year,
    commissions
  });
  return response.data.data || response.data;
};

/**
 * Get all salary slips with filters
 */
export const getAllSalarySlips = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.month) params.append('month', filters.month);
  if (filters.year) params.append('year', filters.year);
  if (filters.status) params.append('status', filters.status);
  if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
  if (filters.employeeId) params.append('employeeId', filters.employeeId);

  const response = await api.get(`/salary-slips?${params.toString()}`);
  return response.data.data || response.data;
};

/**
 * Get single salary slip by ID
 */
export const getSalarySlipById = async (id) => {
  const response = await api.get(`/salary-slips/${id}`);
  return response.data.data || response.data;
};

/**
 * Update salary slip
 */
export const updateSalarySlip = async (id, updates) => {
  const response = await api.put(`/salary-slips/${id}`, updates);
  return response.data.data || response.data;
};

/**
 * Approve salary slip
 */
export const approveSalarySlip = async (id) => {
  const response = await api.put(`/salary-slips/${id}/approve`);
  return response.data.data || response.data;
};

/**
 * Mark salary slip as paid
 */
export const markAsPaid = async (id, paymentDetails) => {
  const response = await api.put(`/salary-slips/${id}/pay`, paymentDetails);
  return response.data.data || response.data;
};

/**
 * Get monthly salary report
 */
export const getMonthlyReport = async (month, year) => {
  const response = await api.get(`/salary-slips/report/monthly?month=${month}&year=${year}`);
  return response.data.data || response.data;
};

/**
 * Delete salary slip
 */
export const deleteSalarySlip = async (id) => {
  const response = await api.delete(`/salary-slips/${id}`);
  return response.data.data || response.data;
};

export default {
  generateSalarySlip,
  bulkGenerateSalarySlips,
  getAllSalarySlips,
  getSalarySlipById,
  updateSalarySlip,
  approveSalarySlip,
  markAsPaid,
  getMonthlyReport,
  deleteSalarySlip
};
