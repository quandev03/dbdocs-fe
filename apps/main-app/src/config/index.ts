// Environment-specific configuration

// Utility function to safely get environment variables
const getEnvVar = (name: string): string => {
  // First try to get from window._env_ (for Docker/runtime environment)
  if (typeof window !== 'undefined' &&
      (window as unknown as { _env_: { [key: string]: string } })._env_?.[name]) {
    return (window as unknown as { _env_: { [key: string]: string } })._env_[name];
  }

  // Then try import.meta.env (for buildtime environment)
  if (import.meta.env[name]) {
    return import.meta.env[name];
  }

  // Return empty string if not found
  return '';
}

// API configuration
export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_API_DOMAIN') || 'https://api-dbdocs.mmoall.com',
  TIMEOUT: 60000, // 60 seconds
  BASE_URL_FE: getEnvVar('VITE_FRONTEND_URL') || 'https://dbdocs.mmoall.com'
};

// Log for debugging
console.log("config/index.ts - API_CONFIG.BASE_URL:", API_CONFIG.BASE_URL);

// Frontend configuration
export const FRONTEND_CONFIG = {
  BASE_URL: getEnvVar('VITE_FRONTEND_URL') || (typeof window !== 'undefined' ? window.location.origin : ''),
  ORIGIN: typeof window !== 'undefined' ? window.location.origin : getEnvVar('VITE_FRONTEND_URL'),
};

// Auth configuration
export const AUTH_CONFIG = {
  // OAuth endpoints
  OAUTH_ENDPOINTS: {
    GOOGLE: getEnvVar('VITE_GOOGLE_AUTH_URL') || '/oauth2/authorization/google',
    GITHUB: getEnvVar('VITE_GITHUB_AUTH_URL') || '/oauth2/authorization/github',
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
