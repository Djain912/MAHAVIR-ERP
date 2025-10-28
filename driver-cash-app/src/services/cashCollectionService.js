import api from './api';

/**
 * Submit cash collection
 */
export const submitCashCollection = async (collectionData) => {
  try {
    console.log('💰 Submitting cash collection:', JSON.stringify(collectionData, null, 2));
    
    const response = await api.post('/cash-collections', collectionData);
    
    console.log('✅ Cash collection submitted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting cash collection:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get driver's cash collections
 */
export const getDriverCollections = async (driverId, filters = {}) => {
  try {
    const params = new URLSearchParams({
      driverId,
      ...filters
    });
    
    const response = await api.get(`/cash-collections?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

/**
 * Get cash collection by ID
 */
export const getCollectionById = async (collectionId) => {
  try {
    const response = await api.get(`/cash-collections/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching collection details:', error);
    throw error;
  }
};

/**
 * Update cash collection (before verification)
 */
export const updateCashCollection = async (collectionId, collectionData) => {
  try {
    const response = await api.put(`/cash-collections/${collectionId}`, collectionData);
    return response.data;
  } catch (error) {
    console.error('Error updating cash collection:', error);
    throw error;
  }
};

/**
 * Get driver cash statistics
 */
export const getDriverStats = async (driverId, startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/cash-collections/stats/${driverId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    throw error;
  }
};
