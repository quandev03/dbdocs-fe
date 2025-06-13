// Token keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_INFO_KEY = 'user_info';

/**
 * Sets the authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Gets the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Removes the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Sets the refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Gets the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Checks if a user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Sets user info in localStorage
 */
export const setUserInfo = (userInfo: any): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

/**
 * Gets user info from localStorage
 */
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * Removes user info from localStorage
 */
export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY);
};

/**
 * Logs out the user by removing all auth data
 */
export const logout = (): void => {
  removeAuthToken();
  removeUserInfo();
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Parse auth tokens from the URL hash/query parameters
 * Used for handling OAuth redirects
 */
export const parseAuthTokensFromUrl = (): { 
  accessToken?: string; 
  refreshToken?: string;
  tokenType?: string;
  error?: string;
} => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  // Check query params first, then hash params
  const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
  const tokenType = urlParams.get('token_type') || hashParams.get('token_type');
  const error = urlParams.get('error') || hashParams.get('error');
  
  return {
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    tokenType: tokenType || undefined,
    error: error || undefined
  };
}; 