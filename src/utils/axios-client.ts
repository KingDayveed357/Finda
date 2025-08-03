// utils/axios-client.ts
/**
 * Axios Client Entry Point
 * Main entry point for HTTP client functionality, re-exports
 * all necessary components for backward compatibility and ease of use.
 */

// Re-export everything from the separated modules
export { HttpClient, httpClient } from './http-client';
export { TokenManager, tokenManager, AUTH_EVENTS } from './token-manager';
export { CSRFManager, csrfManager } from './csrf-manager';

// Re-export types for convenience
export type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Legacy compatibility exports
 * These maintain backward compatibility with existing code
 * that imports from axios-client.ts
 */

// Main exports that most services will use
export { httpClient as default } from './http-client';

/**
 * Utility function to check if HTTP client is properly initialized
 * Useful for debugging and health checks
 */
import { httpClient } from './http-client';
import { tokenManager } from './token-manager';
import { csrfManager } from './csrf-manager';

export const isHttpClientReady = (): boolean => {
  try {
    return !!httpClient.getInstance();
  } catch (error) {
    console.error('HTTP Client initialization check failed:', error);
    return false;
  }
};

/**
 * Utility function to get client configuration info
 * Useful for debugging and monitoring
 */
export const getClientInfo = () => {
  return {
    isReady: isHttpClientReady(),
    isAuthenticated: tokenManager.isAuthenticated(),
    hasValidToken: !!tokenManager.getValidToken(),
    hasCSRFToken: csrfManager.hasCSRFToken(),
  };
};

/**
 * Initialize the HTTP client with CSRF support
 * Call this function when your app starts
 */
export const initializeHttpClient = async (): Promise<void> => {
  try {
    console.log('Initializing HTTP client with CSRF support...');
    await httpClient.initializeCSRF();
    console.log('HTTP client initialized successfully');
  } catch (error) {
    console.warn('HTTP client initialization failed:', error);
    // Don't throw - let the app continue and handle CSRF on demand
  }
};