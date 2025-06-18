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

export const baseApiUrl = getEnvVar('VITE_API_DOMAIN');
console.log("constants/index.ts: baseApiUrl =", baseApiUrl);

export const baseSignUrl = getEnvVar('VITE_BASE_SIGNLINK_URL');

export const versionApi = '/v1';

export const FIREBASE_CONFIG = getEnvVar('VITE_FIREBASE_CONFIG_OBJECT');
export const FIREBASE_VAPID_KEY = getEnvVar('VITE_FIREBASE_VAPID_KEY');
export const APP_VERSION = getEnvVar('VITE_APP_VERSION');

export const APP_CODE = 'vnsky-internal';

export const STORAGE_KEY_PREFIX = getEnvVar('VITE_STORAGE_KEY_PREFIX') || '';
export const ACCESS_TOKEN_KEY = `${STORAGE_KEY_PREFIX}${APP_CODE}:access_token`;
export const REFRESH_TOKEN_KEY = `${STORAGE_KEY_PREFIX}${APP_CODE}:refresh_token`;
export const FCM_TOKEN_KEY = `${STORAGE_KEY_PREFIX}${APP_CODE}:fcm_token`;

export const USERNAME = 'username';
export const ADMIN_USER = 'owner';

export const OidcClientCredentials = {
  clientId: getEnvVar('VITE_INTERNAL_SITE_OIDC_CLIENT_ID'),
  clientSecret: getEnvVar('VITE_INTERNAL_SITE_CLIENT_SECRET')
};

export const GOOGLE_CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID');

export const LOADER_INIT_KEY = 'app_loader_initialized';
