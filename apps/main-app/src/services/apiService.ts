import authService from './authService';
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
    
    const authHeader = authService.getAuthorizationHeader();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };
    
    // Add token to header if available
    if (authHeader) {
      headers['Authorization'] = authHeader;
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
          authService.logout();
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
      
      // Return empty object for 204 No Content or empty response
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {};
      }
      
      // Check if there's content to parse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json();
          console.log(`API Response from ${endpoint}:`, data);
          return data;
        } catch (parseError) {
          console.warn(`Failed to parse JSON response from ${endpoint}`, parseError);
          // Return empty object if JSON parsing fails
          return {};
        }
      } else {
        // For non-JSON responses, just return an empty success object
        console.log(`API Response from ${endpoint}: Non-JSON response`);
        return {};
      }
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