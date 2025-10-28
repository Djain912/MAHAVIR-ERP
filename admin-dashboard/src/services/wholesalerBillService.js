/**
 * Wholesaler Bill Service
 * API calls for wholesaler bill generation
 */

import api from './api';

export const getAllWholesaleBillData = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Only add params if they have values
  if (filters.startDate && filters.startDate.trim()) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate && filters.endDate.trim()) {
    params.append('endDate', filters.endDate);
  }

  const queryString = params.toString();
  const url = `/wholesalers/bill-data${queryString ? '?' + queryString : ''}`;
  
  console.log('Service calling URL:', url);
  
  try {
    const response = await api.get(url);
    console.log('Service response:', response);
    return response;
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getWholesalerBillData = async (wholesalerId, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await api.get(`/wholesalers/bill-data/${wholesalerId}?${params.toString()}`);
  return response;
};

export const generateAllWholesaleBill = async (billData) => {
  const response = await api.post('/wholesalers/generate-bill', billData, {
    responseType: 'blob' // Important for PDF download
  });
  return response;
};

export const generateWholesalerBill = async (wholesalerId, billData) => {
  const response = await api.post(`/wholesalers/generate-bill/${wholesalerId}`, billData, {
    responseType: 'blob' // Important for PDF download
  });
  return response;
};

export const getDispatchDateRange = async () => {
  const response = await api.get('/wholesalers/bill-date-range');
  return response;
};
