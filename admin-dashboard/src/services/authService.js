/**
 * Authentication Service
 * Handles login, logout, and user profile operations
 */

import api from './api';

/**
 * Login user (Admin portal)
 */
export const login = async (phone, password) => {
  const response = await api.post('/auth/login?type=admin', { phone, password });
  const result = response.data; // axios response contains data in response.data
  
  if (result.success && result.data.token) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data; // Extract data from { success: true, data: {...} }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored user
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
