import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../services';

// Auth context state type
interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Auth context type
interface AuthContextType extends AuthState {
  login: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshUserInfo: () => Promise<{ success: boolean; error?: string }>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | null>(null);

// Provider props type
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        const userInfoStr = localStorage.getItem('user_info');
        let userInfo = null;
        
        if (userInfoStr) {
          try {
            userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            console.error('Error parsing user info from localStorage:', e);
          }
        }
        
        setState({
          user: userInfo,
          loading: false,
          error: null,
          isAuthenticated: isAuthenticated
        });
      } catch (err) {
        console.error('Auth check error:', err);
        setState({
          user: null,
          loading: false,
          error: 'Failed to verify authentication status',
          isAuthenticated: false
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (provider: 'google' | 'github') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let result;
      
      if (provider === 'google') {
        result = await authService.loginWithGoogle();
      } else {
        result = await authService.loginWithGithub();
      }
      
      if (result.isAuthenticated) {
        // Get user info from localStorage if available
        const userInfoStr = localStorage.getItem('user_info');
        let userInfo = null;
        
        if (userInfoStr) {
          try {
            userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            console.error('Error parsing user info from localStorage:', e);
          }
        }
        
        setState({
          user: userInfo,
          loading: false,
          error: null,
          isAuthenticated: true
        });
        
        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication failed',
          isAuthenticated: false
        }));
        
        return { success: false, error: 'Authentication failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isAuthenticated: false
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Clear tokens and user data
      authService.clearToken();
      localStorage.removeItem('user_info');
      
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // Refresh user info
  const refreshUserInfo = async () => {
    if (!state.isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Get user info from localStorage if available
      const userInfoStr = localStorage.getItem('user_info');
      let userInfo = null;
      
      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
        } catch (e) {
          console.error('Error parsing user info from localStorage:', e);
        }
      }
      
      setState(prev => ({
        ...prev,
        user: userInfo,
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh user info';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // Create context value
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 