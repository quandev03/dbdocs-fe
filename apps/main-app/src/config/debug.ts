import { API_CONFIG } from './index';

console.log('🚀 DEBUG: Current API Configuration');
console.log('📡 API_BASE_URL:', API_CONFIG.BASE_URL);
console.log('🌐 FRONTEND_URL:', API_CONFIG.BASE_URL_FE);
console.log('🔑 Environment Variables:');
console.log('   - VITE_API_DOMAIN:', import.meta.env.VITE_API_DOMAIN);
console.log('   - VITE_FRONTEND_URL:', import.meta.env.VITE_FRONTEND_URL);
console.log('   - NODE_ENV:', import.meta.env.NODE_ENV);

// Test if we have correct fallback
if (!import.meta.env.VITE_API_DOMAIN) {
  console.log('⚠️  VITE_API_DOMAIN not set, using fallback:', API_CONFIG.BASE_URL);
} else {
  console.log('✅ VITE_API_DOMAIN is set:', import.meta.env.VITE_API_DOMAIN);
}

export const debugConfig = () => {
  return {
    apiUrl: API_CONFIG.BASE_URL,
    frontendUrl: API_CONFIG.BASE_URL_FE,
    envVars: {
      apiDomain: import.meta.env.VITE_API_DOMAIN,
      frontendUrl: import.meta.env.VITE_FRONTEND_URL,
      nodeEnv: import.meta.env.NODE_ENV,
    }
  };
}; 