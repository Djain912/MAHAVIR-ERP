/**
 * Dispatch Service
 * API calls for driver dispatch management
 */

import api from './api';

export const createDriverDispatch = async (dispatchData) => {
  const response = await api.post('/dispatches', dispatchData);
  return response.data;
};

export const getAllDispatches = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/dispatches?${params}`);
  return response.data;
};

export const getDispatchById = async (id) => {
  const response = await api.get(`/dispatches/${id}`);
  return response.data;
};

export const getActiveDispatchForDriver = async (driverId) => {
  const response = await api.get(`/dispatches/driver/${driverId}/active`);
  return response.data;
};

export const updateDispatchStatus = async (id, status) => {
  const response = await api.put(`/dispatches/${id}/status`, { status });
  return response.data;
};

export const getDispatchStats = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  const response = await api.get(`/dispatches/stats?${params}`);
  return response.data;
};
