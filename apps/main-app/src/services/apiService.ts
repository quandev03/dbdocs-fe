import authService from './authService';
import httpClient from './httpClient';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  params?: Record<string, any>;
}

export const apiService = {
  // Call API with authentication (using httpClient with auto refresh token)
  callApi: async function(endpoint: string, options: ApiOptions = {}) {
    try {
      const method = (options.method || 'GET').toLowerCase();
      const data = options.body ? JSON.parse(options.body as string) : undefined;
      
      console.log(`API Request: ${method.toUpperCase()} ${endpoint}`);
      
      let response;
      
      switch (method) {
        case 'get':
          response = await httpClient.get(endpoint, { 
            params: options.params,
            timeout: API_TIMEOUT 
          });
          break;
        case 'post':
          response = await httpClient.post(endpoint, data, { timeout: API_TIMEOUT });
          break;
        case 'put':
          response = await httpClient.put(endpoint, data, { timeout: API_TIMEOUT });
          break;
        case 'delete':
          response = await httpClient.delete(endpoint, { timeout: API_TIMEOUT });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      console.log(`API Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('API call error:', error);
      
      // Preserve original error handling for compatibility
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `API Error: ${error.response?.status || 'Unknown'}`;
      throw new Error(errorMessage);
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