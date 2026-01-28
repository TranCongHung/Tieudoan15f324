// Environment-based API configuration
export const API_CONFIG = {
  // Development: Node.js backend
  development: {
    baseUrl: 'http://localhost:8080/api',
    useNodeJS: true
  },
  
  // Production: PHP backend on InfinityFree
  production: {
    baseUrl: '/api', // Relative URL for production
    useNodeJS: false
  }
};

// Get current environment
const getEnvironment = () => {
  // Check if we're in development mode
  return process.env.NODE_ENV === 'development' ? 'development' : 'production';
};

// Export current config
export const CURRENT_CONFIG = API_CONFIG[getEnvironment()];

// Helper to determine which API client to use
export const shouldUsePHPBackend = () => !CURRENT_CONFIG.useNodeJS;

// Export base URL for API calls
export const API_BASE_URL = CURRENT_CONFIG.baseUrl;
