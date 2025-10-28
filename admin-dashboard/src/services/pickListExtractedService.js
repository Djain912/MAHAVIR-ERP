/**
 * PickList Extracted Service
 * API calls for extracted pick list operations
 */

import api from './api';

export const uploadAndExtractPickList = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  const response = await api.post('/picklists-extracted/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getAllPickLists = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.active !== undefined) params.append('active', filters.active);
  if (filters.vehicleNumber) params.append('vehicleNumber', filters.vehicleNumber);
  if (filters.salesMan) params.append('salesMan', filters.salesMan);
  if (filters.loadoutType) params.append('loadoutType', filters.loadoutType);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await api.get(`/picklists-extracted?${params.toString()}`);
  return response.data;
};

export const getPickListById = async (id) => {
  const response = await api.get(`/picklists-extracted/${id}`);
  return response.data.data || response.data;
};

export const getPickListByNumber = async (pickListNumber) => {
  const response = await api.get(`/picklists-extracted/number/${pickListNumber}`);
  return response.data.data || response.data;
};

export const updatePickList = async (id, data) => {
  const response = await api.put(`/picklists-extracted/${id}`, data);
  return response.data.data || response.data;
};

export const deletePickList = async (id) => {
  const response = await api.delete(`/picklists-extracted/${id}`);
  return response.data.data || response.data;
};

export const getPickListStats = async () => {
  const response = await api.get('/picklists-extracted/stats/summary');
  return response.data;
};
