export const baseApiUrl =
  (window as unknown as { _env_: { [key: string]: string } })._env_
    ?.VITE_BASE_API_URL ?? import.meta.env.VITE_BASE_API_URL;

export const baseSignUrl =
  (window as unknown as { _env_: { [key: string]: string } })._env_
    ?.VITE_BASE_SIGNLINK_URL ?? import.meta.env.VITE_BASE_SIGNLINK_URL;

export const versionApi = '/v1';

export const FIREBASE_CONFIG =
  (window as unknown as { _env_: { [key: string]: string } })._env_
    ?.VITE_FIREBASE_CONFIG_OBJECT ??
  import.meta.env.VITE_FIREBASE_CONFIG_OBJECT;
export const FIREBASE_VAPID_KEY =
  (window as unknown as { _env_: { [key: string]: string } })._env_
    ?.VITE_FIREBASE_VAPID_KEY ?? import.meta.env.VITE_FIREBASE_VAPID_KEY;
export const APP_VERSION = (
  window as unknown as { _env_: { [key: string]: string } }
)._env_?.VITE_APP_VERSION;

export const APP_CODE = 'vnsky-internal';

export const STORAGE_KEY_PREFIX =
  (window as unknown as { _env_: { [key: string]: string } })._env_
    ?.VITE_STORAGE_KEY_PREFIX ?? '';
export const ACCESS_TOKEN_KEY = `${STORAGE_KEY_PREFIX}${APP_CODE}:access_token`;
export const REFRESH_TOKEN_KEY = `${STORAGE_KEY_PREFIX}${APP_CODE}:refresh_token`;
export const FCM_TOKEN_KEY = `${STORAGE_KEY_PREFIX}${APP_CODE}:fcm_token`;

export const USERNAME = 'username';
export const ADMIN_USER = 'owner';

export const OidcClientCredentials = {
  clientId:
    (window as unknown as { _env_: { [key: string]: string | number } })._env_
      ?.VITE_INTERNAL_SITE_OIDC_CLIENT_ID ??
    import.meta.env.VITE_INTERNAL_SITE_OIDC_CLIENT_ID,
  clientSecret:
    (window as unknown as { _env_: { [key: string]: string | number } })._env_
      ?.VITE_INTERNAL_SITE_CLIENT_SECRET ??
    import.meta.env.VITE_INTERNAL_SITE_CLIENT_SECRET,
};
export const GOOGLE_CLIENT_ID =
  (window as unknown as { _env_: { [key: string]: string } })._env_
    ?.VITE_GOOGLE_CLIENT_ID ?? import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const LOADER_INIT_KEY = 'app_loader_initialized';
