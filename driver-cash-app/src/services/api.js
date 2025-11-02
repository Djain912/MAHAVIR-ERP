import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary fix: Force correct IP until cache clears
const API_URL = 'http://192.168.0.155:5000/api';

console.log('🌐 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`📤 ${config.method.toUpperCase()} ${config.url} [Token: ${token.substring(0, 20)}...]`);
      } else {
        console.log(`📤 ${config.method.toUpperCase()} ${config.url} [No token]`);
      }
      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`❌ ${error.config.method.toUpperCase()} ${error.config.url} - ${error.response.status}:`, error.response.data);
      
      // Handle 401 unauthorized - but don't clear token immediately
      // Let the screen handle it so we can show proper error message
      if (error.response.status === 401) {
        console.warn('⚠️ Authentication failed. Token might be expired or invalid.');
        // Don't auto-remove token here - let the component handle logout
        // This prevents unexpected logouts during network issues
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
