import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_DOMAIN || 'http://localhost:8080';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  roles: string[];
  [key: string]: any;
}

export const userService = {
  /**
   * Get the current authenticated user's info
   */
  getCurrentUser: async (): Promise<UserInfo | null> => {
    // First check if we have the user info in localStorage
    const cachedUserInfo = localStorage.getItem('user_info');
    if (cachedUserInfo) {
      try {
        return JSON.parse(cachedUserInfo);
      } catch (e) {
        console.error('Error parsing cached user info', e);
        localStorage.removeItem('user_info');
      }
    }

    // Otherwise, fetch from API
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

      const userInfo = await response.json();
      
      // Cache the user info in localStorage
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      
      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Save user info to localStorage
   */
  saveUserInfo: (userInfo: UserInfo): void => {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  },

  /**
   * Clear user info from localStorage
   */
  clearUserInfo: (): void => {
    localStorage.removeItem('user_info');
  },

  /**
   * Check if the current user has a specific role
   */
  hasRole: async (role: string): Promise<boolean> => {
    const user = await userService.getCurrentUser();
    if (!user || !user.roles) return false;
    
    return user.roles.includes(role);
  },

  /**
   * Handle the logout process
   */
  logout: async (): Promise<void> => {
    try {
      const token = authService.getToken();
      if (token) {
        // Call logout API if needed
        // await fetch(`${API_BASE_URL}/api/auth/logout`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all auth data
      authService.clearToken();
      userService.clearUserInfo();
    }
  },

  /**
   * Check if the current session is valid
   */
  validateSession: async (): Promise<boolean> => {
    // First check if we have a token
    if (!authService.hasToken()) {
      return false;
    }
    
    // Then validate the token with the API
    try {
      const isValid = await authService.validateToken();
      if (!isValid) {
        // If token is invalid, clear the session
        userService.logout();
        return false;
      }
      
      // If token is valid, ensure we have user info
      const userInfo = await userService.getCurrentUser();
      return !!userInfo;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  },

  /**
   * Get user info by userId
   */
  getUserById: async (userId: string): Promise<{ userId: string; fullName: string; email: string; avatarUrl: string; provider: number } | null> => {
    try {
      // Always try to get a token, even if authService.hasToken() returns false
      let token = authService.getToken();
      
      // If no token from authService, try to get from localStorage directly as fallback
      if (!token) {
        const rawToken = localStorage.getItem('auth_token');
        if (rawToken) {
          try {
            // Parse the token from localStorage if it exists
            const parsedToken = JSON.parse(rawToken);
            token = parsedToken;
            console.log('Using token from localStorage');
          } catch (e) {
            console.error('Failed to parse token from localStorage:', e);
          }
        }
      }
      
      console.log(`Fetching user with ID: ${userId}`);
      console.log(`Request URL: ${API_BASE_URL}/api/v1/users/${userId}`);
      console.log('Auth token available:', !!token);

      const requestOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token.accessToken}` : '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        redirect: 'follow' as RequestRedirect
      };
      
      console.log('Request options:', JSON.stringify({
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Authorization': token ? 'Bearer [TOKEN_HIDDEN]' : ''
        }
      }, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, requestOptions);
      
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      // Get headers in a way that's compatible with all environments
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', JSON.stringify(responseHeaders, null, 2));
      console.log('Response redirected:', response.redirected);
      console.log('Response URL:', response.url);
      
      // If we get a redirect to the system user, use that endpoint instead
      if (response.status === 302 || (response.redirected && response.url.includes('/system'))) {
        console.log('User redirect detected, fetching system user instead');
        return await userService.getSystemUser();
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`User with ID ${userId} not found, falling back to system user`);
          return await userService.getSystemUser();
        } else if (response.status === 401) {
          console.warn('Unauthorized, trying system user as fallback');
          return await userService.getSystemUser();
        } else if (response.status === 302) {
          console.log('302 redirect detected, fetching system user');
          return await userService.getSystemUser();
        }
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error getting user by id:', error);
      // As a fallback, try to get the system user
      try {
        console.log('Falling back to system user after error');
        return await userService.getSystemUser();
      } catch (fallbackError) {
        console.error('System user fallback also failed:', fallbackError);
        return null;
      }
    }
  },

  /**
   * Get system user information
   * Uses the special system user endpoint for projects created by the system
   */
  getSystemUser: async (): Promise<{ userId: string; fullName: string; email: string; avatarUrl: string; provider: number } | null> => {
    try {
      // Always try to get a token, even if authService.hasToken() returns false
      let token = authService.getToken();
      
      // If no token from authService, try to get from localStorage directly as fallback
      if (!token) {
        const rawToken = localStorage.getItem('auth_token');
        if (rawToken) {
          try {
            // Parse the token from localStorage if it exists
            const parsedToken = JSON.parse(rawToken);
            token = parsedToken;
            console.log('Using token from localStorage for system user');
          } catch (e) {
            console.error('Failed to parse token from localStorage:', e);
          }
        }
      }
      
      console.log('Fetching system user');
      console.log(`Request URL: ${API_BASE_URL}/api/v1/users/system`);
      console.log('Auth token available:', !!token);

      const requestOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token.accessToken}` : '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        redirect: 'follow' as RequestRedirect
      };
      
      console.log('Request options for system user:', JSON.stringify({
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Authorization': token ? 'Bearer [TOKEN_HIDDEN]' : ''
        }
      }, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/system`, requestOptions);
      
      console.log('System user response status:', response.status);
      console.log('System user response status text:', response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to get system user info: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('System user response data:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error getting system user:', error);
      return null;
    }
  }
}; 