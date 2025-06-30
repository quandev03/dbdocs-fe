import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse URL query parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const tokenType = searchParams.get('tokenType');
        const expiresIn = searchParams.get('expiresIn');
        const provider = searchParams.get('provider');

        // Validate required parameters
        if (!token) {
          throw new Error('Missing authentication token');
        }

        // Prepare token data
        const tokenData = {
          accessToken: token,
          refreshToken: refreshToken || undefined,
          tokenType: tokenType || 'Bearer',
          expiresIn: expiresIn ? parseInt(expiresIn) : 86400000, // Default 24 hours
          provider: provider || undefined
        };

        console.log('Received OAuth callback with token data:', {
          ...tokenData,
          accessToken: '***', // Hide token in logs
          refreshToken: refreshToken ? '***' : undefined // Hide refresh token in logs
        });

        // Save token to AuthService
        authService.saveToken(tokenData);

        // Fetch user information using dbdocsApiService  
        const { default: dbdocsApiService } = await import('../../services/dbdocsApiService');
        const userInfo = await dbdocsApiService.getCurrentUser();
        
        // Save user to authService for caching
        if (userInfo) {
          authService.saveUser(userInfo);
        }

        if (userInfo) {
          // Refresh auth context
          await refreshUserInfo();

          // Redirect to dashboard
          console.log('OAuth login successful, redirecting to dashboard');
          navigate('/', { replace: true });
        } else {
          throw new Error('Failed to fetch user information');
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);

        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, refreshUserInfo]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4">
          <Alert
            message="Authentication Error"
            description={error}
            type="error"
            showIcon
          />
          <p className="text-center text-gray-600">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-lg text-gray-600">Đang xử lý đăng nhập...</p>
        <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export default AuthCallback;
