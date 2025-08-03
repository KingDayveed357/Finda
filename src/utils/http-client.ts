// utils/http-client.ts
/**
 * HTTP Client
 * Centralized HTTP client using Axios with authentication, CSRF protection,
 * error handling, automatic retries, and request/response interceptors.
 */

import axios, { 
 type AxiosInstance, 
 type AxiosRequestConfig, 
 type AxiosResponse, 
 type AxiosError,
 type InternalAxiosRequestConfig 
} from 'axios';

// Extend AxiosRequestConfig to allow custom __isRetry property
declare module 'axios' {
  export interface AxiosRequestConfig {
    __isRetry?: boolean;
  }
}
import axiosRetry from 'axios-retry';
import { API_CONFIG } from '../config/api';
import { tokenManager, 
  // AUTH_EVENTS
 } from './token-manager';
import { csrfManager } from './csrf-manager';
import type { ApiError } from '../types/api';

/**
 * Determines if an authentication token should be cleared based on error response
 * @param status - HTTP status code
 * @param responseData - Response data from the error
 * @param requestUrl - The URL that was requested
 * @returns True if token should be cleared
 */
function shouldClearToken(status: number, responseData?: any, requestUrl?: string): boolean {
  // Always clear token for 401 (Unauthorized) - but be more careful about CSRF-related 401s
  if (status === 401) {
    const errorMessage = responseData?.detail?.toLowerCase() || '';
    
    // Don't clear token if it's clearly a CSRF-related error
    const csrfRelatedErrors = [
      'csrf',
      'csrf token',
      'csrf verification failed',
      'forbidden (csrf cookie not set)',
    ];
    
    const isCSRFError = csrfRelatedErrors.some(keyword => 
      errorMessage.includes(keyword)
    );
    
    // Also check if the error message suggests missing credentials vs invalid credentials
    const authRelatedErrors = [
      'authentication credentials were not provided',
      'invalid credentials',
      'token not provided',
      'authentication failed'
    ];
    
    const isAuthError = authRelatedErrors.some(keyword => 
      errorMessage.includes(keyword)
    );
    
    console.log('401 Error analysis:', {
      url: requestUrl,
      errorMessage,
      isCSRFError,
      isAuthError,
      willClearToken: !isCSRFError || isAuthError
    });
    
    // Clear token if it's clearly an auth error, but not if it's just a CSRF issue
    return !isCSRFError || isAuthError;
  }
  
  // For 403 (Forbidden), be more selective - this often means lack of permissions, not invalid token
  if (status === 403) {
    const errorMessage = responseData?.detail?.toLowerCase() || '';
    
    // Only clear token if the error explicitly indicates token issues
    const tokenRelatedErrors = [
      'token',
      'expired',
      'invalid credentials',
      'authentication failed',
      'invalid token',
      'token expired',
      'authentication required'
    ];
    
    const isTokenError = tokenRelatedErrors.some(keyword => 
      errorMessage.includes(keyword)
    );
    
    console.log('403 Error analysis:', {
      url: requestUrl,
      errorMessage,
      isTokenError,
      willClearToken: isTokenError
    });
    
    return isTokenError;
  }
  
  return false;
}

/**
 * Creates and configures the main Axios instance with retries
 * @returns Configured Axios instance
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
    withCredentials: true, // Important for CSRF cookies
  });

  // Configure automatic retries with exponential backoff
  axiosRetry(instance, {
    retries: API_CONFIG.RETRY.ATTEMPTS,
    retryDelay: (retryCount) => {
      const delay = Math.min(
        API_CONFIG.RETRY.DELAY * Math.pow(API_CONFIG.RETRY.DELAY_MULTIPLIER, retryCount - 1),
        API_CONFIG.RETRY.MAX_DELAY
      );
      console.log(`Retry attempt ${retryCount}, waiting ${delay}ms`);
      return delay;
    },
    retryCondition: (error: AxiosError) => {
      // Retry on network errors or specific HTTP status codes
      return (
        axiosRetry.isNetworkError(error) ||
        axiosRetry.isIdempotentRequestError(error) ||
        API_CONFIG.RETRY_STATUS_CODES.includes(error.response?.status as (408 | 429 | 500 | 502 | 503 | 504))
      );
    },
    onRetry: (retryCount, error) => {
      console.warn(`Request retry ${retryCount}/${API_CONFIG.RETRY.ATTEMPTS} for ${error.config?.url}`);
    },
  });

  return instance;
}

/**
 * Main HTTP client class with authentication and error handling
 * Provides a clean interface for making HTTP requests with automatic
 * token management, CSRF protection, and comprehensive error handling.
 */
export class HttpClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Sets up request and response interceptors for authentication and error handling
   */
  private setupInterceptors(): void {
    // Request interceptor - Add authentication token and CSRF token to requests
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        const token = tokenManager.getValidToken();
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (this.isStateChangingRequest(config.method)) {
          try {
            const csrfToken = await csrfManager.getCSRFToken();
            if (csrfToken) {
              config.headers['X-CSRFToken'] = csrfToken;
              console.log('CSRF token added to request');
            } else {
              console.warn('No CSRF token available - proceeding without it');
            }
          } catch (error) {
            console.warn('Failed to get CSRF token for request:', error);
            // Continue with request - let the server handle the CSRF error
          }
        }

        // Log request details in development
        console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
        if (token) {
          console.log('Request includes authentication token');
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle authentication errors and token management
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Request to ${response.config.url} completed successfully`);
        return response;
      },
      (error: AxiosError<ApiError>) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Determines if a request method requires CSRF protection
   * @param method - HTTP method
   * @returns True if CSRF token is required
   */
  private isStateChangingRequest(method?: string): boolean {
    if (!method) return false;
    const stateChangingMethods = ['post', 'put', 'patch', 'delete'];
    return stateChangingMethods.includes(method.toLowerCase());
  }

  /**
   * Handles response errors with proper authentication and error management
   * @param error - Axios error object
   * @returns Rejected promise with processed error
   */
  private async handleResponseError(error: AxiosError<ApiError>): Promise<unknown> {
    const { response } = error;
    
    if (response) {
      console.warn(`Request failed with status ${response.status}:`, response.data);

      // Handle CSRF token errors specifically
      if (response.status === 403) {
        const errorMessage = response.data?.detail?.toLowerCase() || '';
        const isCSRFError = errorMessage.includes('csrf') || 
                           errorMessage.includes('forbidden');
        
        if (isCSRFError) {
          console.warn('CSRF error detected, clearing CSRF token and retrying...');
          csrfManager.clearCSRFToken();
          
          // Retry the request once with a fresh CSRF token
          if (!error.config?.__isRetry) {
            try {
              const newCSRFToken = await csrfManager.getCSRFToken();
              const retryConfig = {
                ...error.config,
                headers: {
                  ...error.config?.headers,
                  'X-CSRFToken': newCSRFToken,
                },
                __isRetry: true,
              };
              
              console.log('Retrying request with fresh CSRF token');
              const retryResponse = await this.client.request(retryConfig);
              return retryResponse.data; // Return successful retry result
            } catch (retryError) {
              console.error('Retry with fresh CSRF token failed:', retryError);
              // Continue with original error handling
            }
          }
        }
      }

      // Handle authentication errors - be more careful about clearing tokens
      if (response.status === 401 || response.status === 403) {
        const shouldClear = shouldClearToken(response.status, response.data, error.config?.url);
        
        if (shouldClear) {
          console.warn('Token appears invalid, clearing token');
          tokenManager.clearToken(`${response.status} - ${response.data?.detail || 'Authentication failed'}`);
        } else {
          console.warn(`${response.status} received but keeping token (likely CSRF or permissions issue)`);
        }
      }

      // Transform error for consistent error handling
      const errorMessage = response.data?.detail || 
                          `Request failed with status ${response.status}`;
      
      if (response.status === 401) {
        const shouldClear = shouldClearToken(response.status, response.data, error.config?.url);
        if (shouldClear) {
          error.message = 'Your session has expired. Please log in again.';
        } else {
          error.message = `Authentication required: ${errorMessage}`;
        }
      } else if (response.status === 403) {
        if (shouldClearToken(response.status, response.data, error.config?.url)) {
          error.message = 'Your session has expired. Please log in again.';
        } else {
          error.message = `Access denied: ${errorMessage}`;
        }
      } else {
        error.message = errorMessage;
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }

    console.error('HTTP Client Error:', error.message);
    return Promise.reject(error);
  }

  /**
   * Makes a GET request
   * @param url - Request URL
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Makes a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Makes a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Makes a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Makes a DELETE request
   * @param url - Request URL
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Gets the underlying Axios instance for advanced usage
   * @returns The configured Axios instance
   */
  getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Initialize CSRF token (call this before making requests)
   */
  async initializeCSRF(): Promise<void> {
    await csrfManager.initialize();
  }

  /**
   * Adds a request interceptor
   * @param onFulfilled - Success handler
   * @param onRejected - Error handler
   * @returns Interceptor ID for removal
   */
  addRequestInterceptor(
    onFulfilled?: (value: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    return this.client.interceptors.request.use(onFulfilled, onRejected);
  }

  /**
   * Adds a response interceptor
   * @param onFulfilled - Success handler
   * @param onRejected - Error handler
   * @returns Interceptor ID for removal
   */
  addResponseInterceptor(
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
  ): number {
    return this.client.interceptors.response.use(onFulfilled, onRejected);
  }

  /**
   * Removes a request interceptor
   * @param interceptorId - ID returned from addRequestInterceptor
   */
  removeRequestInterceptor(interceptorId: number): void {
    this.client.interceptors.request.eject(interceptorId);
  }

  /**
   * Removes a response interceptor
   * @param interceptorId - ID returned from addResponseInterceptor
   */
  removeResponseInterceptor(interceptorId: number): void {
    this.client.interceptors.response.eject(interceptorId);
  }
}

// Export singleton instance
export const httpClient = new HttpClient();