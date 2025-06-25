import { API_CONFIG, AUTH_CONFIG } from '../config';

// Check if we have the proper API domain
let API_BASE_URL = API_CONFIG.BASE_URL;
console.log("API_CONFIG.BASE_URL:", API_CONFIG.BASE_URL);

console.log("Final API_BASE_URL:", API_BASE_URL);

const { TOKEN, TOKEN_TYPE, EXPIRES_IN, EXPIRY_TIME, USER_INFO } = AUTH_CONFIG.STORAGE_KEYS;
const { GOOGLE, GITHUB } = AUTH_CONFIG.OAUTH_ENDPOINTS;
const { WIDTH, HEIGHT } = AUTH_CONFIG.POPUP;

// TypeScript interfaces
interface TokenData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  provider?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  provider?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'dbdocs_token';
  private readonly USER_KEY = 'dbdocs_user';
  private readonly BACKEND_URL = API_BASE_URL;

  // Save token data to localStorage
  saveToken(tokenData: TokenData): void {
    if (!tokenData || !tokenData.accessToken) {
      console.error('Invalid token data');
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, tokenData.accessToken);
    localStorage.setItem(TOKEN_TYPE, tokenData.tokenType || 'Bearer');

    if (tokenData.expiresIn) {
      localStorage.setItem(EXPIRES_IN, tokenData.expiresIn.toString());
      const expirationTime = Date.now() + (tokenData.expiresIn * 1000);
      localStorage.setItem(EXPIRY_TIME, expirationTime.toString());
    }

    if (tokenData.provider) {
      localStorage.setItem('provider', tokenData.provider);
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get authorization header for API requests
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    const tokenType = localStorage.getItem(TOKEN_TYPE) || 'Bearer';
    return token ? `${tokenType} ${token}` : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token has expired
    const expiryTime = localStorage.getItem(EXPIRY_TIME);
    if (expiryTime) {
      const now = Date.now();
      if (now > parseInt(expiryTime)) {
        this.logout();
        return false;
      }
    }

    return true;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE);
    localStorage.removeItem(EXPIRES_IN);
    localStorage.removeItem(EXPIRY_TIME);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('provider');
  }

  // Save user data to localStorage
  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Login with Google
  loginWithGoogle(): void {
    const redirectUrl = `${this.BACKEND_URL}${GOOGLE}`;
    console.log('Redirecting to Google OAuth:', redirectUrl);
    window.location.href = redirectUrl;
  }

  // Login with GitHub
  loginWithGitHub(): void {
    const redirectUrl = `${this.BACKEND_URL}${GITHUB}`;
    console.log('Redirecting to GitHub OAuth:', redirectUrl);
    window.location.href = redirectUrl;
  }

  // Check token validity
  checkTokenValidity(): boolean {
    const expiryTime = localStorage.getItem(EXPIRY_TIME);
    if (!expiryTime) return true; // No expiry time set

    const now = Date.now();
    if (now > parseInt(expiryTime)) {
      this.logout();
      return false;
    }

    return true;
  }

  // Validate token with API
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${this.BACKEND_URL}/api/auth/test`, {
        headers: {
          'Authorization': this.getAuthorizationHeader() || ''
        }
      });

      if (!response.ok && response.status === 401) {
        this.logout();
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Fetch user info from API
  async fetchUserInfo(): Promise<User | null> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/user/me`, {
        headers: {
          'Authorization': this.getAuthorizationHeader() || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      this.saveUser(userInfo);
      return userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  // Legacy methods for backward compatibility
  hasToken = (): boolean => {
    return this.getToken() !== null;
  };

  clearToken = (): void => {
    this.logout();
  };

  loginWithOAuth = (url: string): Promise<{ isAuthenticated: boolean; token?: string }> => {
    if (this.isAuthenticated()) {
      return Promise.resolve({ isAuthenticated: true, token: this.getToken() || undefined });
    }

    return new Promise((resolve, reject) => {
      const width = WIDTH;
      const height = HEIGHT;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const redirectUrl = `${this.BACKEND_URL}${url}`;
      console.log('Opening OAuth popup to:', redirectUrl);

      const popup = window.open(
        redirectUrl,
        'oauth2',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);

          const token = localStorage.getItem(this.TOKEN_KEY);
          if (!token) {
            reject(new Error('Login was cancelled or failed.'));
          } else {
            resolve({
              isAuthenticated: true,
              token: token
            });
          }
        }
      }, 500);

      const handleAuth = (event: MessageEvent) => {
        console.log('Received message event:', {
          origin: event.origin,
          data: event.data,
          currentOrigin: window.location.origin
        });

        const currentOrigin = window.location.origin;

        if (event.origin !== currentOrigin && event.origin !== 'null') {
          console.log(`Received message from unexpected origin: ${event.origin}, expected: ${currentOrigin}`);
        }

        const data = event.data;
        if (data && data.accessToken) {
          console.log('Received token data from OAuth popup');

          this.saveToken(data);

          if (!popup.closed) popup.close();
          clearInterval(checkPopupClosed);

          window.removeEventListener('message', handleAuth);
          resolve({
            isAuthenticated: true,
            token: data.accessToken
          });
        } else if (data && data.error) {
          console.error('OAuth error:', data.error);

          if (!popup.closed) popup.close();
          clearInterval(checkPopupClosed);

          window.removeEventListener('message', handleAuth);
          reject(new Error(data.error));
        }
      };

      window.addEventListener('message', handleAuth);

      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleAuth);
          reject(new Error('Login timeout. Please try again.'));
        }
      }, 300000);
    });
  };

  loginWithGithub = (): Promise<{ isAuthenticated: boolean; token?: string }> => {
    return this.loginWithOAuth(GITHUB);
  };
}

export default new AuthService();
