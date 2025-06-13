import React, { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

interface AuthRedirectProps {
  children: ReactNode;
  authenticatedRedirect: string; // Where to redirect if authenticated
  unauthenticatedRedirect: string; // Where to redirect if not authenticated
  requireAuth: boolean; // Whether this route requires authentication
}

/**
 * A component that handles authentication-based redirects
 * If requireAuth is true, it redirects unauthenticated users to the unauthenticatedRedirect path
 * If requireAuth is false, it redirects authenticated users to the authenticatedRedirect path
 */
const AuthRedirect: React.FC<AuthRedirectProps> = ({
  children,
  authenticatedRedirect,
  unauthenticatedRedirect,
  requireAuth
}) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // If authentication is required but user is not authenticated
        navigate(unauthenticatedRedirect, { 
          state: { from: location },
          replace: true 
        });
      } else if (!requireAuth && isAuthenticated) {
        // If authentication is not required but user is authenticated
        navigate(authenticatedRedirect, { replace: true });
      }
    }
  }, [
    isAuthenticated, 
    loading, 
    navigate, 
    requireAuth, 
    authenticatedRedirect, 
    unauthenticatedRedirect,
    location
  ]);

  // While checking authentication status, show loading spinner
  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="Checking authentication..." />
      </LoadingContainer>
    );
  }

  // If we're still here, it means the user can access this route
  // (Either they're authenticated and requireAuth is true, or they're not authenticated and requireAuth is false)
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return <>{children}</>;
  }

  // This is just a fallback, but we should never reach this point due to the useEffect redirection
  return <LoadingContainer><Spin size="large" tip="Redirecting..." /></LoadingContainer>;
};

export default AuthRedirect; 