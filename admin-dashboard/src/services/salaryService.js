/**
 * Salary Management Service
 * API calls for salary slips, advances, and leaves
 */

import api from './api';

// ============= SALARY SLIP OPERATIONS =============

/**
 * Generate salary slip for an employee
 */
export const generateSalarySlip = async (data) => {
  const response = await api.post('/salary/generate', data);
  return response.data.data || response.data;
};

/**
 * Generate salary slips for all employees
 */
export const generateAllSalarySlips = async (month, year) => {
  const response = await api.post('/salary/generate-all', { month, year });
  return response.data.data || response.data;
};

/**
 * Get all salary slips with filters
 */
export const getAllSalarySlips = async (filters = {}) => {
  const response = await api.get('/salary/slips', { params: filters });
  return response.data.data || response.data;
};

/**
 * Get salary slip by ID
 */
export const getSalarySlipById = async (id) => {
  const response = await api.get(`/salary/slips/${id}`);
  return response.data.data || response.data;
};

/**
 * Update salary slip
 */
export const updateSalarySlip = async (id, data) => {
  const response = await api.put(`/salary/slips/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Mark salary as paid
 */
export const markSalaryAsPaid = async (id, paymentData) => {
  const response = await api.post(`/salary/slips/${id}/pay`, paymentData);
  return response.data.data || response.data;
};

/**
 * Delete salary slip
 */
export const deleteSalarySlip = async (id) => {
  const response = await api.delete(`/salary/slips/${id}`);
  return response.data;
};

/**
 * Get monthly salary report
 */
export const getMonthlySalaryReport = async (month, year) => {
  const response = await api.get(`/salary/report/${month}/${year}`);
  return response.data.data || response.data;
};

// ============= SALARY ADVANCE OPERATIONS =============

/**
 * Create salary advance request
 */
export const createAdvance = async (data) => {
  const response = await api.post('/salary/advances', data);
  return response.data.data || response.data;
};

/**
 * Get all advances with filters
 */
export const getAllAdvances = async (filters = {}) => {
  const response = await api.get('/salary/advances', { params: filters });
  return response.data.data || response.data;
};

/**
 * Get advance by ID
 */
export const getAdvanceById = async (id) => {
  const response = await api.get(`/salary/advances/${id}`);
  return response.data.data || response.data;
};

/**
 * Update advance
 */
export const updateAdvance = async (id, data) => {
  const response = await api.put(`/salary/advances/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Approve advance
 */
export const approveAdvance = async (id) => {
  const response = await api.post(`/salary/advances/${id}/approve`);
  return response.data.data || response.data;
};

/**
 * Reject advance
 */
export const rejectAdvance = async (id, reason) => {
  const response = await api.post(`/salary/advances/${id}/reject`, { reason });
  return response.data.data || response.data;
};

/**
 * Get employee's pending advances
 */
export const getEmployeePendingAdvances = async (employeeId) => {
  const response = await api.get(`/salary/advances/employee/${employeeId}/pending`);
  return response.data.data || response.data;
};

/**
 * Delete advance
 */
export const deleteAdvance = async (id) => {
  const response = await api.delete(`/salary/advances/${id}`);
  return response.data;
};

// ============= LEAVE OPERATIONS =============

/**
 * Create leave application
 */
export const createLeave = async (data) => {
  const response = await api.post('/salary/leaves', data);
  return response.data.data || response.data;
};

/**
 * Get all leaves with filters
 */
export const getAllLeaves = async (filters = {}) => {
  const response = await api.get('/salary/leaves', { params: filters });
  return response.data.data || response.data;
};

/**
 * Get leave by ID
 */
export const getLeaveById = async (id) => {
  const response = await api.get(`/salary/leaves/${id}`);
  return response.data.data || response.data;
};

/**
 * Update leave
 */
export const updateLeave = async (id, data) => {
  const response = await api.put(`/salary/leaves/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Approve leave
 */
export const approveLeave = async (id, remarks = '') => {
  const response = await api.post(`/salary/leaves/${id}/approve`, { remarks });
  return response.data.data || response.data;
};

/**
 * Reject leave
 */
export const rejectLeave = async (id, reason) => {
  const response = await api.post(`/salary/leaves/${id}/reject`, { reason });
  return response.data.data || response.data;
};

/**
 * Get employee leave balance
 */
export const getEmployeeLeaveBalance = async (employeeId, year) => {
  const response = await api.get(`/salary/leaves/employee/${employeeId}/balance`, {
    params: { year }
  });
  return response.data.data || response.data;
};

/**
 * Delete leave
 */
export const deleteLeave = async (id) => {
  const response = await api.delete(`/salary/leaves/${id}`);
  return response.data;
};

// ============= EMPLOYEE SUMMARY =============

/**
 * Get employee salary summary
 */
export const getEmployeeSalarySummary = async (employeeId, year) => {
  const response = await api.get(`/salary/employee/${employeeId}/summary`, {
    params: { year }
  });
  return response.data.data || response.data;
};
