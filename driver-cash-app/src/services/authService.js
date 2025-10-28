import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

/**
 * Login driver
 */
export const login = async (phone, password) => {
  try {
    console.log('🔐 Attempting login for:', phone);
    
    const response = await api.post('/auth/login', {
      phone,
      password,
    });

    console.log('📦 Response structure:', JSON.stringify(response.data, null, 2));

    // Backend returns: { success: true, message: '...', data: { token, user } }
    if (response.data && response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      
      if (token && user) {
        console.log('✅ Login successful');
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        return response.data.data;
      }
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Logout driver
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    return false;
  }
};
