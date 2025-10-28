/**
 * Attendance Service
 * Frontend API client for attendance operations
 */

import api from './api';

/**
 * Mark attendance for an employee
 */
export const markAttendance = async (employeeId, date, status, remarks = '') => {
  const response = await api.post('/attendance/mark', {
    employeeId,
    date,
    status,
    remarks
  });
  return response.data.data || response.data;
};

/**
 * Bulk mark attendance for multiple employees
 */
export const bulkMarkAttendance = async (date, attendanceRecords) => {
  const response = await api.post('/attendance/bulk-mark', {
    date,
    attendanceRecords
  });
  return response.data.data || response.data;
};

/**
 * Get daily attendance
 */
export const getDailyAttendance = async (date) => {
  const response = await api.get(`/attendance/daily?date=${date}`);
  return response.data.data || response.data;
};

/**
 * Get employee attendance summary
 */
export const getEmployeeAttendance = async (employeeId, startDate, endDate) => {
  const response = await api.get(`/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`);
  return response.data.data || response.data;
};

/**
 * Get monthly attendance report
 */
export const getMonthlyReport = async (month, year) => {
  const response = await api.get(`/attendance/monthly?month=${month}&year=${year}`);
  return response.data.data || response.data;
};

/**
 * Update attendance
 */
export const updateAttendance = async (id, status, remarks = '') => {
  const response = await api.put(`/attendance/${id}`, { status, remarks });
  return response.data.data || response.data;
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data.data || response.data;
};

export default {
  markAttendance,
  bulkMarkAttendance,
  getDailyAttendance,
  getEmployeeAttendance,
  getMonthlyReport,
  updateAttendance,
  deleteAttendance
};
