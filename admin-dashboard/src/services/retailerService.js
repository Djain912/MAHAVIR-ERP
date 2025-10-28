/**
 * Retailer Service
 * API calls for retailer management
 */

import api from './api';

export const getAllRetailers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/retailers?${params}`);
  return response.data.data || response.data;
};

export const getRetailerById = async (id) => {
  const response = await api.get(`/retailers/${id}`);
  return response.data.data || response.data;
};

export const createRetailer = async (retailerData) => {
  const response = await api.post('/retailers', retailerData);
  return response.data.data || response.data;
};

export const updateRetailer = async (id, retailerData) => {
  const response = await api.put(`/retailers/${id}`, retailerData);
  return response.data.data || response.data;
};

export const deleteRetailer = async (id) => {
  const response = await api.delete(`/retailers/${id}`);
  return response.data.data || response.data;
};

export const getAllRoutes = async () => {
  const response = await api.get('/retailers/routes/all');
  return response.data;
};
