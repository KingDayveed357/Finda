// utils/token-manager.ts
/**
 * Token Manager
 * Handles authentication token storage, retrieval, and management
 * with localStorage integration and event dispatching.
 */

import { API_CONFIG } from '../config/api';

/**
 * Custom events for authentication state management
 */
export const AUTH_EVENTS = {
  TOKEN_CLEARED: 'auth-token-cleared',
  STATE_CHANGED: 'auth-state-changed',
} as const;

/**
 * Authentication token management utilities
 * Provides a clean interface for token operations with error handling
 */
export class TokenManager {
  private readonly tokenKey = API_CONFIG.AUTH_TOKEN_KEY;
  private cachedAuthState: boolean | null = null;
  private lastCheckTime = 0;
  private readonly cacheTimeout = 1000; // Cache for 1 second

  /**
   * Retrieves the stored authentication token
   * @returns The stored token or null if not found/accessible
   */
  getToken(): string | null {
    try {
      const token = localStorage.getItem(this.tokenKey);
      return token;
    } catch (error) {
      console.warn('Failed to access localStorage for token retrieval:', error);
      return null;
    }
  }

  /**
   * Stores the authentication token
   * @param token - The authentication token to store
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      console.log('Authentication token stored successfully');
      
      // Update cached state
      this.cachedAuthState = true;
      this.lastCheckTime = Date.now();
      
      // Notify components of authentication state change
      this.dispatchAuthStateChange(true);
    } catch (error) {
      console.warn('Failed to store token in localStorage:', error);
      throw new Error('Unable to store authentication token');
    }
  }

  /**
   * Removes the authentication token
   * @param reason - Optional reason for token clearing
   */
  clearToken(reason = 'Token manually cleared'): void {
    try {
      localStorage.removeItem(this.tokenKey);
      console.log('Authentication token cleared:', reason);
      
      // Update cached state
      this.cachedAuthState = false;
      this.lastCheckTime = Date.now();
      
      // Notify components of token clearing
      this.dispatchTokenCleared(reason);
      
      // Notify components of authentication state change
      this.dispatchAuthStateChange(false);
    } catch (error) {
      console.warn('Failed to clear token from localStorage:', error);
    }
  }

  /**
   * Checks if user is currently authenticated with caching to reduce frequent checks
   * @returns True if a token exists
   */
  isAuthenticated(): boolean {
    const now = Date.now();
    
    // Use cached result if it's recent (within cache timeout)
    if (this.cachedAuthState !== null && (now - this.lastCheckTime) < this.cacheTimeout) {
      return this.cachedAuthState;
    }

    const token = this.getToken();
    const isAuth = !!token && token.trim().length > 0;
    
    // Only log if the state has changed or it's been a while since last log
    if (this.cachedAuthState !== isAuth || (now - this.lastCheckTime) > 10000) {
      console.log('Checking authentication status, token exists:', isAuth);
    }
    
    // Update cache
    this.cachedAuthState = isAuth;
    this.lastCheckTime = now;
    
    return isAuth;
  }

  /**
   * Gets token (simplified version without validation)
   * @returns Token or null
   */
  getValidToken(): string | null {
    const token = this.getToken();
    
    if (!token || token.trim().length === 0) {
      return null;
    }

    return token;
  }

  /**
   * Invalidate cache - useful when you want to force a fresh check
   */
  invalidateCache(): void {
    this.cachedAuthState = null;
    this.lastCheckTime = 0;
  }

  /**
   * Dispatches token cleared event
   * @param reason - Reason for token clearing
   */
  private dispatchTokenCleared(reason: string): void {
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_CLEARED, {
      detail: { reason }
    }));
  }

  /**
   * Dispatches authentication state change event
   * @param authenticated - Current authentication state
   */
  private dispatchAuthStateChange(authenticated: boolean): void {
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.STATE_CHANGED, {
      detail: { authenticated }
    }));
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();