import { API_CONFIG, AUTH_CONFIG } from '@main-app/config';
// Note: This is a legacy service, consider using httpClient from main-app instead
const API_BASE_URL =  API_CONFIG.BASE_URL;
export const authService = {
  // Check if token exists in localStorage
  hasToken: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Save token to localStorage
  saveToken: (tokenData: { accessToken: string; tokenType?: string; expiresIn?: number }): void => {
    localStorage.setItem('token', tokenData.accessToken);
    localStorage.setItem('tokenType', tokenData.tokenType || 'Bearer');
    if (tokenData.expiresIn) {
      const expiryTime = Date.now() + tokenData.expiresIn * 1000;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }
  },

  // Clear token (logout)
  clearToken: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user_info');
  },

  // Validate token with API
  validateToken: async (): Promise<boolean> => {
    if (!authService.hasToken()) {
      return false;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/test`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Login with Google
  loginWithGoogle: (): Promise<{ isAuthenticated: boolean; token?: string }> => {
    if (authService.hasToken()) {
      return Promise.resolve({ isAuthenticated: true });
    }

    return new Promise((resolve) => {
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const popup = window.open(
        `${API_BASE_URL}/oauth2/authorization/google`,
        'googleLogin',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        console.error('Popup blocked. Please allow popups for this site.');
        resolve({ isAuthenticated: false });
        return;
      }

      // Check if popup was closed
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          resolve({ isAuthenticated: authService.hasToken() });
        }
      }, 500);

      // Listen for messages from popup
      const handleAuth = (event: MessageEvent) => {
        // Check message origin for security
        if (event.origin !== window.location.origin) return;

        const data = event.data;
        if (data && data.accessToken) {
          // Save token to localStorage
          authService.saveToken(data);

          // Close popup and resolve promise
          if (!popup.closed) popup.close();
          clearInterval(checkPopupClosed);

          window.removeEventListener('message', handleAuth);
          resolve({ isAuthenticated: true, token: data.accessToken });
        }
      };

      window.addEventListener('message', handleAuth);
    });
  },

  // Login with GitHub
  loginWithGithub: (): Promise<{ isAuthenticated: boolean; token?: string }> => {
    if (authService.hasToken()) {
      return Promise.resolve({ isAuthenticated: true });
    }

    return new Promise((resolve) => {
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const popup = window.open(
        `${API_BASE_URL}/oauth2/authorization/github`,
        'githubLogin',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        console.error('Popup blocked. Please allow popups for this site.');
        resolve({ isAuthenticated: false });
        return;
      }

      // Check if popup was closed
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          resolve({ isAuthenticated: authService.hasToken() });
        }
      }, 500);

      // Listen for messages from popup
      const handleAuth = (event: MessageEvent) => {
        // Check message origin for security
        if (event.origin !== window.location.origin) return;

        const data = event.data;
        if (data && data.accessToken) {
          // Save token to localStorage
          authService.saveToken(data);

          // Close popup and resolve promise
          if (!popup.closed) popup.close();
          clearInterval(checkPopupClosed);

          window.removeEventListener('message', handleAuth);
          resolve({ isAuthenticated: true, token: data.accessToken });
        }
      };

      window.addEventListener('message', handleAuth);
    });
  },

  // Get current user information
  getCurrentUser: async (): Promise<any | null> => {
    if (!authService.hasToken()) {
      return null;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};
