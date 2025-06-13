import React, { ReactNode } from 'react';
import AuthRedirect from './AuthRedirect';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component for routes that require authentication
 * This is now just a wrapper around AuthRedirect
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return (
    <AuthRedirect
      authenticatedRedirect="/"
      unauthenticatedRedirect="/login"
      requireAuth={true}
    >
      {children}
    </AuthRedirect>
  );
};

export default ProtectedRoute; 