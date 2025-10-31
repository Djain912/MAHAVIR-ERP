import api from './api';

/**
 * Submit cash collection
 */
export const submitCashCollection = async (collectionData) => {
  try {
    const response = await api.post('/cash-collections', collectionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all cash collections with filters
 */
export const getAllCashCollections = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.driverId) params.append('driverId', filters.driverId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/cash-collections?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get cash collection by ID
 */
export const getCashCollectionById = async (id) => {
  try {
    const response = await api.get(`/cash-collections/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify cash collection
 */
export const verifyCashCollection = async (id, notes = '') => {
  try {
    const response = await api.patch(`/cash-collections/${id}/verify`, { notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Reconcile cash collection
 */
export const reconcileCashCollection = async (id, notes = '') => {
  try {
    const response = await api.patch(`/cash-collections/${id}/reconcile`, { notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update cash collection
 */
export const updateCashCollection = async (id, collectionData) => {
  try {
    const response = await api.put(`/cash-collections/${id}`, collectionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get driver cash statistics
 */
export const getDriverCashStats = async (driverId, startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/cash-collections/stats/${driverId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete cash collection
 */
export const deleteCashCollection = async (id) => {
  try {
    const response = await api.delete(`/cash-collections/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all cash collections (alias for admin dashboard)
 */
export const getCashCollections = async (filters = {}) => {
  return getAllCashCollections(filters);
};

/**
 * Update collection details (cheque, credit, bounce)
 */
export const updateCollectionDetails = async (id, details) => {
  try {
    const response = await api.patch(`/cash-collections/${id}/details`, details);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
