// utils/api.ts
import { API_CONFIG } from '../config/api';
import type { ChatbotRequest, ChatbotResponse, ApiError } from '../types/api';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    // Initialize token from localStorage on construction
    this.authToken = this.getStoredAuthToken();
  }

  private getStoredAuthToken(): string | null {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  }

  private getAuthToken(): string | null {
    // Always check localStorage for the most current token
    this.authToken = this.getStoredAuthToken();
    return this.authToken;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private clearAuthToken(): void {
    this.authToken = null;
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to clear token from localStorage:', error);
    }
  }

  // UPDATED: More conservative token clearing logic
  private shouldClearToken(status: number, responseData?: any): boolean {
    // Only clear token for 401 (Unauthorized) - token is invalid/expired
    if (status === 401) {
      return true;
    }
    
    // For 403 (Forbidden), be more careful - this often means lack of permissions, not invalid token
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
        errorMessage,
        isTokenError,
        willClearToken: isTokenError
      });
      
      return isTokenError;
    }
    
    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if auth is required but token is missing
    if (requireAuth && !this.getAuthToken()) {
      throw new Error('Authentication required. Please log in to continue.');
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`Making ${config.method || 'GET'} request to:`, url);
      console.log('Auth headers:', this.getAuthHeaders());

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Parse error data first
        let errorData: ApiError;
        try {
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { 
            detail: `HTTP ${response.status}: ${response.statusText}` 
          };
        }

        // Handle authentication errors MORE SELECTIVELY
        if (response.status === 401 || response.status === 403) {
          console.warn(`${response.status} response received:`, errorData);
          
          // Only clear token if it's definitely a token issue
          if (this.shouldClearToken(response.status, errorData)) {
            console.warn('Token appears invalid, clearing token');
            this.clearAuthToken();
            
            // Emit a custom event to notify other components
            window.dispatchEvent(new CustomEvent('auth-token-cleared', {
              detail: { reason: `${response.status} - ${errorData.detail}` }
            }));
          } else {
            console.warn(`${response.status} received but keeping token (likely permissions issue)`);
          }
        }

        // Throw appropriate error messages
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          const errorMessage = errorData.detail || 'Access forbidden';
          if (this.shouldClearToken(response.status, errorData)) {
            throw new Error('Your session has expired. Please log in again.');
          } else {
            throw new Error(`Access denied: ${errorMessage}`);
          }
        }

        // Handle other errors
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API response success:', responseData);
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Enhanced token verification
  async verifyToken(): Promise<boolean> {
    const token = this.getAuthToken();
    if (!token) {
      console.log('No token found for verification');
      return false;
    }

    try {
      console.log('Verifying token...');
      const response = await fetch(`${this.baseURL}/api/auth/verify/`, {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const isValid = response.ok;
      console.log('Token verification result:', isValid);
      
      if (!isValid && (response.status === 401 || response.status === 403)) {
        console.log('Token verification failed, clearing token');
        this.clearAuthToken();
        window.dispatchEvent(new CustomEvent('auth-token-cleared', {
          detail: { reason: 'Token verification failed' }
        }));
      }
      
      return isValid;
    } catch (error) {
      console.warn('Token verification failed:', error);
      return false;
    }
  }

  async sendChatbotMessage(message: string): Promise<ChatbotResponse> {
    const request: ChatbotRequest = { message };
    
    console.log('Sending chatbot message:', request);
    
    return this.request<ChatbotResponse>(
      API_CONFIG.ENDPOINTS.CHATBOT,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      true // Require authentication
    );
  }

  // Get current user profile
  async getCurrentUser(): Promise<any> {
    return this.request('/api/auth/user/', {}, true);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const isAuth = !!token;
    console.log('Checking authentication, token exists:', isAuth);
    return isAuth;
  }

  // Set auth token (called after successful login)
  setAuthToken(token: string): void {
    this.authToken = token;
    try {
      localStorage.setItem('authToken', token);
      console.log('Auth token stored successfully');
      
      // Emit event to notify components of auth state change
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { authenticated: true }
      }));
    } catch (error) {
      console.warn('Failed to store token in localStorage:', error);
    }
  }

  // Logout method
  logout(): void {
    console.log('Logging out, clearing token');
    this.clearAuthToken();
    
    // Emit event to notify components of auth state change
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: { authenticated: false }
    }));
  }

  // Add other API methods as needed
  async getProducts(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${API_CONFIG.ENDPOINTS.PRODUCTS}${queryString}`);
  }

  async getServices(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${API_CONFIG.ENDPOINTS.SERVICES}${queryString}`);
  }
}

export const apiClient = new ApiClient();