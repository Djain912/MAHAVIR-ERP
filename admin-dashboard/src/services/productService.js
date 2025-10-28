/**
 * Product Service
 * API calls for product management
 */

import api from './api';

export const getAllProducts = async (activeOnly = true) => {
  console.log('🔍 Fetching products with activeOnly:', activeOnly);
  const response = await api.get(`/products?active=${activeOnly}`);
  console.log('🔍 Products API response:', response);
  console.log('🔍 Products response.data:', response.data);
  // Backend returns { success, message, data }
  return response.data.data || response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data || response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data.data || response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data.data || response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data.data || response.data;
};
