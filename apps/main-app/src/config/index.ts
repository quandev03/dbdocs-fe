// Environment-specific configuration

// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_DOMAIN || 'http://localhost:8080',
  TIMEOUT: 60000, // 60 seconds
};

// Frontend configuration
export const FRONTEND_CONFIG = {
  BASE_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:4200',
};

// Auth configuration
export const AUTH_CONFIG = {
  // OAuth endpoints
  OAUTH_ENDPOINTS: {
    GOOGLE: '/oauth2/authorization/google',
    GITHUB: '/oauth2/authorization/github',
  },
  
  // Token storage keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    TOKEN_TYPE: 'tokenType',
    EXPIRES_IN: 'expiresIn',
    EXPIRY_TIME: 'tokenExpiry',
    USER_INFO: 'user_info',
  },
  
  // OAuth popup configuration
  POPUP: {
    WIDTH: 600,
    HEIGHT: 600,
  },
}; 