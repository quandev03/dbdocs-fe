import { API_CONFIG, AUTH_CONFIG } from '../config';

// Check if we have the proper API domain
let API_BASE_URL = API_CONFIG.BASE_URL;
console.log("API_CONFIG.BASE_URL:", API_CONFIG.BASE_URL);

console.log("Final API_BASE_URL:", API_BASE_URL);

const { TOKEN, TOKEN_TYPE, EXPIRES_IN, EXPIRY_TIME, USER_INFO } = AUTH_CONFIG.STORAGE_KEYS;
const { GOOGLE, GITHUB } = AUTH_CONFIG.OAUTH_ENDPOINTS;
const { WIDTH, HEIGHT } = AUTH_CONFIG.POPUP;

export const authService = {
  // Check if token exists in localStorage
  hasToken: (): boolean => {
    return localStorage.getItem(TOKEN) !== null;
  },

  // Get token from localStorage
  getToken: (): { accessToken: string; tokenType: string; expiresIn?: string; expiryTime?: string } | null => {
    const token = localStorage.getItem(TOKEN);
    if (!token) return null;

    return {
      accessToken: token,
      tokenType: localStorage.getItem(TOKEN_TYPE) || 'Bearer',
      expiresIn: localStorage.getItem(EXPIRES_IN) || undefined,
      expiryTime: localStorage.getItem(EXPIRY_TIME) || undefined
    };
  },

  // Save token to localStorage
  saveToken: (tokenData: { accessToken: string; tokenType?: string; expiresIn?: number }): void => {
    if (!tokenData || !tokenData.accessToken) {
      console.error('Invalid token data');
      return;
    }

    localStorage.setItem(TOKEN, tokenData.accessToken);
    localStorage.setItem(TOKEN_TYPE, tokenData.tokenType || 'Bearer');

    if (tokenData.expiresIn) {
      localStorage.setItem(EXPIRES_IN, tokenData.expiresIn.toString());
      const expiryTime = Date.now() + (tokenData.expiresIn * 1000);
      localStorage.setItem(EXPIRY_TIME, expiryTime.toString());
    }
  },

  // Clear token (logout)
  clearToken: (): void => {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(TOKEN_TYPE);
    localStorage.removeItem(EXPIRES_IN);
    localStorage.removeItem(EXPIRY_TIME);
    localStorage.removeItem(USER_INFO);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;

    // Check if token has expired
    if (token.expiryTime) {
      const now = Date.now();
      if (now > parseInt(token.expiryTime)) {
        authService.clearToken();
        return false;
      }
    }

    return true;
  },

  // Validate token with API
  validateToken: async (): Promise<boolean> => {
    if (!authService.isAuthenticated()) {
      return false;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/test`, {
        headers: {
          'Authorization': `${token?.tokenType} ${token?.accessToken}`
        }
      });

      if (!response.ok && response.status === 401) {
        authService.clearToken();
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Login with Google
  loginWithGoogle: (): Promise<{ isAuthenticated: boolean; token?: string }> => {
    return authService.loginWithOAuth(GOOGLE);
  },

  // Login with GitHub
  loginWithGithub: (): Promise<{ isAuthenticated: boolean; token?: string }> => {
    return authService.loginWithOAuth(GITHUB);
  },

  // Handle OAuth login process
  loginWithOAuth: (url: string): Promise<{ isAuthenticated: boolean; token?: string }> => {
    if (authService.isAuthenticated()) {
      return Promise.resolve({ isAuthenticated: true, token: authService.getToken()?.accessToken });
    }

    return new Promise((resolve, reject) => {
      const width = WIDTH;
      const height = HEIGHT;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      // Determine redirect URL with proper origin
      // Use API_BASE_URL from environment variable
      console.log(`API_BASE_URL for OAuth: ${API_CONFIG.BASE_URL}`);
      const redirectUrl = `${API_CONFIG.BASE_URL}${url}`;
      console.log('Opening OAuth popup to:', redirectUrl);

      const popup = window.open(
        redirectUrl,
        'oauth2',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Check if popup was closed
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);

          // Check if we have a token
          const token = localStorage.getItem(TOKEN);
          if (!token) {
            reject(new Error('Login was cancelled or failed.'));
          } else {
            resolve({
              isAuthenticated: true,
              token: token
            });
          }
        }
      }, 500);

      // Listen for messages from popup
      const handleAuth = (event: MessageEvent) => {
        // Log message for debugging
        console.log('Received message event:', {
          origin: event.origin,
          data: event.data,
          currentOrigin: window.location.origin
        });

        // Accept messages from the backend origin or any origin if needed for cross-origin
        const currentOrigin = window.location.origin;

        if (event.origin !== currentOrigin &&
            event.origin !== 'null') {
          console.log(`Received message from unexpected origin: ${event.origin}, expected: ${currentOrigin}`);
          // Don't return immediately, continue checking for data since we might need to be lenient with origins
        }

        const data = event.data;
        if (data && data.accessToken) {
          console.log('Received token data from OAuth popup');

          // Save token to localStorage
          authService.saveToken(data);

          // Close popup and resolve promise
          if (!popup.closed) popup.close();
          clearInterval(checkPopupClosed);

          window.removeEventListener('message', handleAuth);
          resolve({
            isAuthenticated: true,
            token: data.accessToken
          });
        } else if (data && data.error) {
          console.error('OAuth error:', data.error);

          // Handle error from popup
          if (!popup.closed) popup.close();
          clearInterval(checkPopupClosed);

          window.removeEventListener('message', handleAuth);
          reject(new Error(data.error));
        }
      };

      window.addEventListener('message', handleAuth);
    });
  },

  // Get current user information
  getCurrentUser: async (): Promise<{
    email: string;
    fullName: string;
    avatarUrl: string;
  } | null> => {
    if (!authService.isAuthenticated()) {
      return null;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/users/me`, {
        headers: {
          'Authorization': `${token?.tokenType} ${token?.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.clearToken();
        }
        throw new Error('Failed to get user info');
      }

      const userInfo = await response.json();

      // Cache the user info
      localStorage.setItem(USER_INFO, JSON.stringify(userInfo));

      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};
