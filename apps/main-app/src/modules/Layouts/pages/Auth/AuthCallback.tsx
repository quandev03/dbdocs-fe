import React, { useEffect } from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';
import { AUTH_CONFIG } from '../../../../config';

const { TOKEN, TOKEN_TYPE, EXPIRES_IN, EXPIRY_TIME } = AUTH_CONFIG.STORAGE_KEYS;

const CallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
`;

const CallbackMessage = styled.h3`
  margin-top: 16px;
  color: #333;
`;

/**
 * Component to handle OAuth authentication redirects
 * Extracts token from URL and sends it to the parent window
 */
const AuthCallback: React.FC = () => {
  useEffect(() => {
    // Extract token from URL
    const parseAuthTokens = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      
      // Check query params first, then hash params
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const tokenType = urlParams.get('token_type') || hashParams.get('token_type') || 'Bearer';
      const expiresIn = urlParams.get('expires_in') || hashParams.get('expires_in');
      const error = urlParams.get('error') || hashParams.get('error');
      
      return {
        accessToken: accessToken || undefined,
        refreshToken: refreshToken || undefined,
        tokenType: tokenType || undefined,
        expiresIn: expiresIn ? parseInt(expiresIn, 10) : undefined,
        error: error || undefined
      };
    };

    const tokens = parseAuthTokens();
    
    if (tokens.accessToken) {
      // Save token directly to localStorage to avoid cross-origin issues
      localStorage.setItem(TOKEN, tokens.accessToken);
      if (tokens.tokenType) {
        localStorage.setItem(TOKEN_TYPE, tokens.tokenType);
      }
      if (tokens.expiresIn) {
        localStorage.setItem(EXPIRES_IN, tokens.expiresIn.toString());
        const expiryTime = Date.now() + (tokens.expiresIn * 1000);
        localStorage.setItem(EXPIRY_TIME, expiryTime.toString());
      }
      
      // Send token to parent window via postMessage
      if (window.opener) {
        try {
          // Use window.opener.origin if available
          const openerOrigin = window.opener.origin || window.location.origin || '*';
          console.log('Posting message to origin:', openerOrigin);
          window.opener.postMessage(tokens, openerOrigin);
          
          // Close the popup after a short delay
          setTimeout(() => window.close(), 1000);
        } catch (e) {
          console.error('Error posting message to opener origin:', e);
          
          // Fallback to '*' origin (less secure but necessary for cross-origin)
          try {
            window.opener.postMessage(tokens, '*');
            setTimeout(() => window.close(), 1000);
          } catch (e2) {
            console.error('Error posting message with wildcard origin:', e2);
          }
        }
      }
    } else if (tokens.error) {
      // Handle error
      console.error('Authentication error:', tokens.error);
      if (window.opener) {
        try {
          const openerOrigin = window.opener.origin || window.location.origin || '*';
          window.opener.postMessage({ error: tokens.error }, openerOrigin);
        } catch (e) {
          try {
            window.opener.postMessage({ error: tokens.error }, '*');
          } catch (e2) {
            console.error('Error posting error message:', e2);
          }
        }
        setTimeout(() => window.close(), 1000);
      }
    }
  }, []);

  return (
    <CallbackContainer>
      <Spin size="large" />
      <CallbackMessage>Authentication successful! You can close this window.</CallbackMessage>
    </CallbackContainer>
  );
};

export default AuthCallback; 