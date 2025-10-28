import api from './api';

/**
 * Create a new wholesaler
 */
export const createWholesaler = async (wholesalerData) => {
  try {
    const response = await api.post('/wholesalers', wholesalerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all wholesalers with filters
 */
export const getAllWholesalers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active);
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    console.log('🔍 Fetching wholesalers with URL:', `/wholesalers?${params.toString()}`);
    const response = await api.get(`/wholesalers?${params.toString()}`);
    console.log('🔍 API response:', response);
    console.log('🔍 Response data:', response.data);
    // Return the full response object which contains { success, message, data, pagination }
    // The interceptor already unwrapped response.data for us
    return response;
  } catch (error) {
    console.error('🔍 Error in getAllWholesalers:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get wholesaler by ID
 */
export const getWholesalerById = async (id) => {
  try {
    const response = await api.get(`/wholesalers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update wholesaler
 */
export const updateWholesaler = async (id, wholesalerData) => {
  try {
    const response = await api.put(`/wholesalers/${id}`, wholesalerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete wholesaler
 */
export const deleteWholesaler = async (id) => {
  try {
    const response = await api.delete(`/wholesalers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
