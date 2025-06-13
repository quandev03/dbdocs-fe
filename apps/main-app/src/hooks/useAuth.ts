import { useEffect, useState } from 'react';
import { authService, userService } from '../services';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

/**
 * Custom hook for authentication
 * Provides authentication state and user information
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists and is valid
        const isValid = await userService.validateSession();
        
        if (isValid) {
          // If valid, fetch user information
          const userInfo = await userService.getCurrentUser();
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: userInfo,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (provider: 'google' | 'github') => {
    try {
      const result = provider === 'google' 
        ? await authService.loginWithGoogle()
        : await authService.loginWithGithub();
      
      if (result.isAuthenticated) {
        const userInfo = await userService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: userInfo,
        });
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error(`${provider} login error:`, error);
      return { success: false, error: `${provider} login failed` };
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  const refreshUserInfo = async () => {
    try {
      const userInfo = await userService.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user: userInfo,
      }));
      return { success: true };
    } catch (error) {
      console.error('Error refreshing user info:', error);
      return { success: false, error: 'Failed to refresh user info' };
    }
  };

  return {
    ...authState,
    login,
    logout,
    refreshUserInfo,
  };
}; 