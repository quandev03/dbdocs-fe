/**
 * Environment Configuration Example
 * 
 * Tạo file .env trong thư mục apps/main-app/ với nội dung sau:
 * 
 * # Frontend Configuration
 * VITE_FRONTEND_URL=http://localhost:3000
 * 
 * # Backend API Configuration  
 * VITE_API_DOMAIN=http://localhost:8080
 * 
 * # OAuth Configuration (Optional - will use defaults if not set)
 * VITE_GOOGLE_AUTH_URL=/oauth2/authorization/google
 * VITE_GITHUB_AUTH_URL=/oauth2/authorization/github
 * 
 * # Development/Production Environment
 * NODE_ENV=development
 */

// Current configuration values (loaded from environment)
export const ENV_CONFIG = {
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
  API_DOMAIN: import.meta.env.VITE_API_DOMAIN || 'http://localhost:8080',
  GOOGLE_AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL || '/oauth2/authorization/google',
  GITHUB_AUTH_URL: import.meta.env.VITE_GITHUB_AUTH_URL || '/oauth2/authorization/github',
  NODE_ENV: import.meta.env.NODE_ENV || 'development'
};

console.log('🔧 Environment Configuration:', {
  ...ENV_CONFIG,
  // Hide sensitive info in production
  ...(ENV_CONFIG.NODE_ENV === 'production' ? {} : ENV_CONFIG)
}); 