// API Configuration
// Uses environment variables VITE_GOVERNANCE_URL and VITE_API_KEY or falls back to defaults

export const API_CONFIG = {
  // The actual API URL that the proxy forwards to
  // Can be set via VITE_GOVERNANCE_URL environment variable
  TARGET_URL: import.meta.env.VITE_GOVERNANCE_URL || 'http://localhost:8080',
  
  // The proxy route used in the application
  PROXY_ROUTE: '/api',
  
  // The API key for authentication
  // Can be set via VITE_API_KEY environment variable
  API_KEY: import.meta.env.VITE_API_KEY || ''
};

export default API_CONFIG;
