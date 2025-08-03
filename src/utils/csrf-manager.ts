// utils/csrf-manager.ts
/**
 * CSRF Token Manager
 * Handles Django CSRF token retrieval and management
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api';

export class CSRFManager {
  private csrfToken: string | null = null;
  private isTokenFetching = false;
  private tokenPromise: Promise<string> | null = null;

  /**
   * Get CSRF token from cookie
   */
  private getCSRFTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Fetch CSRF token from the API
   */
private async fetchCSRFToken(): Promise<string> {
  try {
    console.log('Fetching CSRF token from API...');
    
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/auth/api/csrf/`, {
      withCredentials: true,
    });

    console.log('CSRF token API response:', response.data);

    // Use token from response if available
    if (response.data?.csrfToken) {
      this.csrfToken = response.data.csrfToken;
      return this.csrfToken ?? '';
    }

    // Retry reading cookie up to 10 times (1s total)
    for (let attempt = 0; attempt < 10; attempt++) {
      const tokenFromCookie = this.getCSRFTokenFromCookie();
      if (tokenFromCookie) {
        this.csrfToken = tokenFromCookie;
        console.log('CSRF token retrieved from cookie (retry):', tokenFromCookie);
        return tokenFromCookie;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.warn('CSRF token not found in cookie after retries');
    return '';
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return '';
  }
}


  /**
   * Get CSRF token, fetching if necessary
   */
  async getCSRFToken(): Promise<string> {
    // Return cached token if available
    if (this.csrfToken) {
      return this.csrfToken;
    }

    // Return existing promise if token is being fetched
    if (this.isTokenFetching && this.tokenPromise) {
      return this.tokenPromise;
    }

    // Check if token is already in cookie
    const tokenFromCookie = this.getCSRFTokenFromCookie();
    if (tokenFromCookie) {
      this.csrfToken = tokenFromCookie;
      return tokenFromCookie;
    }

    // Fetch token from API
    this.isTokenFetching = true;
    this.tokenPromise = this.fetchCSRFToken();

    try {
      const token = await this.tokenPromise;
      this.isTokenFetching = false;
      this.tokenPromise = null;
      return token;
    } catch (error) {
      this.isTokenFetching = false;
      this.tokenPromise = null;
      // Return empty string instead of throwing
      return '';
    }
  }

  /**
   * Clear cached CSRF token
   */
  clearCSRFToken(): void {
    this.csrfToken = null;
    console.log('CSRF token cleared');
  }

  /**
   * Initialize CSRF token (call this on app startup)
   */
  async initialize(): Promise<void> {
    try {
      await this.getCSRFToken();
      console.log('CSRF Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CSRF Manager:', error);
      // Don't throw here - let the app continue and handle CSRF on demand
    }
  }

  /**
   * Check if CSRF token is available
   */
  hasCSRFToken(): boolean {
    return !!this.csrfToken || !!this.getCSRFTokenFromCookie();
  }
}

// Export singleton instance
export const csrfManager = new CSRFManager();