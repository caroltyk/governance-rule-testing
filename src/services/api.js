import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

// Function to get settings - now uses environment variables for API key
const getSettings = () => {
  try {
    const savedSettings = localStorage.getItem('governanceSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Only return non-sensitive settings from localStorage
      return {
        apiUrl: '/api', // Always use proxy route
        apiKey: API_CONFIG.API_KEY // Use environment variable
      };
    }
  } catch (error) {
    console.error('Error parsing saved settings:', error);
  }
  
  // Return default settings if none found or error occurred
  // Note: The actual API URL is configured in vite.config.js proxy
  return {
    apiUrl: '/api', // Always use proxy route
    apiKey: API_CONFIG.API_KEY // Use environment variable
  };
};

// Create axios instance with dynamic base URL and interceptors
const createApiInstance = () => {
  const settings = getSettings();
  
  // Use the default proxy route for all API calls
  const baseURL = '/api';
  
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    withCredentials: true,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const currentSettings = getSettings();
      // Ensure API key is always included with current settings
      config.headers['X-API-Key'] = currentSettings.apiKey;
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      console.log('API Response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access');
      }
      
      // Add more specific error handling
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        error.message = 'Network error: Unable to connect to the governance service. Please check if the service is running.';
      } else if (error.response?.status === 404) {
        error.message = 'API endpoint not found. Please check if the governance service is properly configured.';
      } else if (error.response?.status >= 500) {
        error.message = 'Server error: The governance service encountered an internal error.';
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

let api = createApiInstance();

// Listen for settings changes and recreate the API instance
window.addEventListener('governanceSettingsChanged', (event) => {
  api = createApiInstance();
});

export default api;
