import { authService } from './authService';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiService = {
  // Call API with authentication
  callApi: async function(endpoint: string, options: ApiOptions = {}) {
    // Check authentication if required
    if (options.requireAuth !== false && !authService.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }
    
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };
    
    // Add token to header if available
    if (token) {
      headers['Authorization'] = `${token.tokenType} ${token.accessToken}`;
    }
    
    // Log request info for debugging
    console.log(`API Request: ${endpoint}`);
    console.log('Headers:', headers);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle expired token
        if (response.status === 401) {
          authService.clearToken();
          throw new Error('Session expired. Please login again.');
        }
        
        // Try to get error message from response
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // Return null for 204 No Content
      if (response.status === 204) {
        return null;
      }
      
      const data = await response.json();
      console.log(`API Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      // Clean up the timeout
      clearTimeout(timeoutId);
      
      // Handle aborted requests due to timeout
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${API_TIMEOUT / 1000} seconds`);
      }
      
      console.error('API call error:', error);
      throw error;
    }
  },
  
  // GET request
  get: <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => 
    apiService.callApi(endpoint, { ...options, method: 'GET' }) as Promise<T>,
    
  // POST request
  post: <T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => 
    apiService.callApi(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }) as Promise<T>,
    
  // PUT request
  put: <T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => 
    apiService.callApi(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    }) as Promise<T>,
    
  // DELETE request
  delete: <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => 
    apiService.callApi(endpoint, { ...options, method: 'DELETE' }) as Promise<T>
}; 