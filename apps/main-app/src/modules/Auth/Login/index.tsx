import React, { useState } from 'react';
import { Button, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import './Login.css';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading('google');
      setError(null);

      // Redirect to Google OAuth
      authService.loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed');
      setLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setLoading('github');
      setError(null);

      // Redirect to GitHub OAuth
      authService.loginWithGitHub();
    } catch (err: any) {
      console.error('GitHub login error:', err);
      setError(err.message || 'GitHub login failed');
      setLoading(null);
    }
  };

  return (
    <div className="login-container min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="login-form-section flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="login-header text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Logo variant="full" width={120} height={72} />
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome Back!
                </h1>
                <p className="text-gray-600">
                  Sign in to access your database documentation
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="login-form mt-8 space-y-6">
            {error && (
              <Alert
                message="Authentication Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                className="rounded-xl"
              />
            )}

            <div className="login-buttons space-y-4">
              {/* Google Login Button */}
            <Button
                type="default"
                size="large"
                onClick={handleGoogleLogin}
                disabled={loading !== null}
                className="google-login-btn w-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading === 'google' ? (
                  <Spin size="default" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GoogleIcon />
                    <span>Log in with Google</span>
                  </div>
                )}
            </Button>

              {/* GitHub Login Button */}
            <Button
                type="default"
                size="large"
                onClick={handleGitHubLogin}
                disabled={loading !== null}
                className="github-login-btn w-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading === 'github' ? (
                  <Spin size="default" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GithubIcon />
                    <span>Log in with GitHub</span>
                  </div>
                )}
            </Button>
            </div>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    🔒 Secure OAuth 2.0 Authentication
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="login-footer text-center text-sm text-gray-500 pt-4">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Background with Gradient */}
      <div className="login-hero-section hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900"></div>
        
        {/* Pattern Overlay */}
        <div className="hero-grid absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-lg">
          <div className="mb-8">
            <div className="hero-icon mx-auto w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="32" cy="20" rx="24" ry="8" fill="white" fillOpacity="0.9"/>
                <rect x="8" y="20" width="48" height="24" fill="white" fillOpacity="0.9"/>
                <ellipse cx="32" cy="44" rx="24" ry="8" fill="white" fillOpacity="0.9"/>
                
                <ellipse cx="32" cy="28" rx="24" ry="8" fill="white" fillOpacity="0.7"/>
                <rect x="8" y="28" width="48" height="16" fill="white" fillOpacity="0.7"/>
                <ellipse cx="32" cy="44" rx="24" ry="8" fill="white" fillOpacity="0.7"/>
                
                <circle cx="52" cy="32" r="4" fill="#22c55e"/>
              </svg>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Professional Database Documentation
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Create, manage, and share beautiful database documentation with your team. 
            Transform complex schemas into clear, interactive docs.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="feature-item flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-blue-100 font-medium">Visual Schema Designer</span>
            </div>
            <div className="feature-item flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-blue-100 font-medium">Real-time Collaboration</span>
            </div>
            <div className="feature-item flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-blue-100 font-medium">API Documentation</span>
            </div>
            <div className="feature-item flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-blue-100 font-medium">Export & Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
