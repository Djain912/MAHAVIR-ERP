import api from './api';

/**
 * Get active dispatch for driver
 */
export const getActiveDispatch = async (driverId) => {
  try {
    const response = await api.get(`/dispatches/driver/${driverId}/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active dispatch:', error);
    throw error;
  }
};

/**
 * Get all dispatches for driver
 */
export const getDriverDispatches = async (driverId) => {
  try {
    const response = await api.get(`/dispatches?driverId=${driverId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching driver dispatches:', error);
    throw error;
  }
};
