import authService from './authService';
import httpClient from './httpClient';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL);
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
      const response = await httpClient.get('/api/v1/users/me');
      const userInfo = response.data;

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
      authService.logout();
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
   * Get user info by userId (with auto refresh token)
   */
  getUserById: async (userId: string): Promise<{ userId: string; fullName: string; email: string; avatarUrl: string; provider: number } | null> => {
    try {
      console.log(`Fetching user with ID: ${userId}`);
      
      const response = await httpClient.get(`/api/v1/users/${userId}`);
      const data = response.data;
      
      console.log('Response data:', JSON.stringify(data, null, 2));
      return data;
    } catch (error: any) {
      console.error('Error getting user by id:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        console.warn(`User with ID ${userId} not found, falling back to system user`);
        return await userService.getSystemUser();
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized, trying system user as fallback');
        return await userService.getSystemUser();
      }
      
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
   * Get system user information (with auto refresh token)
   * Uses the special system user endpoint for projects created by the system
   */
  getSystemUser: async (): Promise<{ userId: string; fullName: string; email: string; avatarUrl: string; provider: number } | null> => {
    try {
      console.log('Fetching system user');
      
      const response = await httpClient.get('/api/v1/users/system');
      const data = response.data;
      
      console.log('System user response data:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error getting system user:', error);
      return null;
    }
  }
};
