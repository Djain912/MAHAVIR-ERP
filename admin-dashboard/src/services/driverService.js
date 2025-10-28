/**
 * Driver Service
 * API calls for driver management
 */

import api from './api';

export const getAllDrivers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/drivers?${params}`);
  // Backend returns { success, message, data }
  return response.data.data || response.data;
};

export const getDriverById = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data.data || response.data;
};

export const createDriver = async (driverData) => {
  const response = await api.post('/drivers', driverData);
  return response.data.data || response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data.data || response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data.data || response.data;
};

export const updateDriverPassword = async (id, newPassword) => {
  const response = await api.put(`/drivers/${id}/password`, { newPassword });
  return response.data.data || response.data;
};

export const getDriverStats = async () => {
  const response = await api.get('/drivers/stats');
  return response.data.data || response.data;
};
