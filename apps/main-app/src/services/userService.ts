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
  }
}; 