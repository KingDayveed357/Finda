// services/auth.service.ts
/**
 * Authentication Service
 * Handles all authentication-related API calls including login, registration,
 * user management, password operations, and profile management.
 */

import { httpClient } from '../utils/http-client';
import { tokenManager } from '../utils/token-manager';
import { API_CONFIG } from '../config/api';
import type {
  LoginData,
  CustomerRegistrationData,
  VendorRegistrationData,
  AuthResponse,
  LoginResponse,
  ApiErrorResponse,
  PasswordResetData,
  ChangePasswordData,
  RegistrationResponse,
  UserProfileUpdate
} from '../types/auth';

/**
 * Authentication service class
 */
class AuthService {
  async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      console.log('[Auth Service] Attempting login for:', credentials.username);
      
      const response = await httpClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.token) {
        console.log('[Auth Service] Login successful, storing token');
        tokenManager.setToken(response.token);
        // Store user data in localStorage for quick access
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('[Auth Service] User data stored');
        }
      }

      return response;
    } catch (error) {
      console.error('[Auth Service] Login error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  async registerCustomer(userData: CustomerRegistrationData): Promise<RegistrationResponse> {
    try {
      console.log('[Auth Service] Attempting customer registration');
      
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('first_name', userData.first_name);
      formData.append('last_name', userData.last_name);
      formData.append('phone', userData.phone);
      formData.append('password', userData.password);
      formData.append('password2', userData.password2);
      formData.append('user_type', 'customer');

      // Add profile image if provided
      if (userData.profile) {
        formData.append('profile', userData.profile);
      }

      const response = await httpClient.post<RegistrationResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.token) {
        console.log('[Auth Service] Customer registration successful, storing token');
        tokenManager.setToken(response.token);
        // Store user data in localStorage for quick access
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error('[Auth Service] Customer registration error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  async registerVendor(userData: VendorRegistrationData): Promise<RegistrationResponse> {
    try {
      console.log('[Auth Service] Attempting vendor registration');
      
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('first_name', userData.first_name);
      formData.append('last_name', userData.last_name);
      formData.append('phone', userData.phone);
      formData.append('password', userData.password);
      formData.append('password2', userData.password2);
      formData.append('user_type', 'vendor');
      formData.append('business_name', userData.business_name);
      
      if (userData.business_description) {
        formData.append('business_description', userData.business_description);
      }

      // Add profile image if provided
      if (userData.profile) {
        formData.append('profile', userData.profile);
      }

      // Add business image if provided
      if (userData.business_image) {
        formData.append('business_image', userData.business_image);
      }

      const response = await httpClient.post<RegistrationResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.token) {
        console.log('[Auth Service] Vendor registration successful, storing token');
        tokenManager.setToken(response.token);
        // Store user data in localStorage for quick access
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error('[Auth Service] Vendor registration error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Fetching current user data');
      
      // Debug: Check token before making request
      const token = tokenManager.getToken();
      console.log('[Auth Service] Token exists before getCurrentUser:', !!token);
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const user = await httpClient.get<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.USER
      );
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      console.log('[Auth Service] Current user data fetched and stored');
      
      return user;
    } catch (error) {
      console.error('[Auth Service] Get current user error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Update user profile (full update with PUT)
   * @param profileData - Complete profile data
   */
  async updateProfile(profileData: UserProfileUpdate): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Updating profile (full update) with data:', profileData);
      
      // Debug: Check token before making request
      const token = tokenManager.getToken();
      console.log('[Auth Service] Token exists before updateProfile:', !!token);
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const formData = new FormData();
      
      // Add text fields
      if (profileData.first_name) formData.append('first_name', profileData.first_name);
      if (profileData.last_name) formData.append('last_name', profileData.last_name);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.email) formData.append('email', profileData.email);
      
      // Vendor-specific fields
      if (profileData.business_name) formData.append('business_name', profileData.business_name);
      if (profileData.business_description) formData.append('business_description', profileData.business_description);
      
      // Handle file uploads
      if (profileData.profile instanceof File) {
        formData.append('profile', profileData.profile);
      }
      
      if (profileData.business_image_url instanceof File) {
        formData.append('business_image', profileData.business_image_url);
      }

      const response = await httpClient.put<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.USER,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response));
      console.log('[Auth Service] Profile updated (full update) successfully');
      
      return response;
    } catch (error) {
      console.error('[Auth Service] Profile update (full) error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Partially update user profile (PATCH - only changed fields)
   * @param profileData - Partial profile data
   */
  async updateProfilePartial(profileData: Partial<UserProfileUpdate>): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Updating profile (partial update) with data:', profileData);
      
      // Debug: Check token before making request
      const token = tokenManager.getToken();
      console.log('[Auth Service] Token exists before updateProfilePartial:', !!token);
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const formData = new FormData();
      
      // Add only the fields that are provided (partial update)
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
            console.log(`[Auth Service] Added file field: ${key}`);
          } else if (typeof value === 'string' && value.trim() !== '') {
            formData.append(key, value);
            console.log(`[Auth Service] Added text field: ${key}`);
          }
        }
      });

      // Log what we're sending
      console.log('[Auth Service] FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? '[File]' : value}`);
      }

      const response = await httpClient.patch<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.USER,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response));
      console.log('[Auth Service] Profile updated (partial update) successfully');
      
      return response;
    } catch (error) {
      console.error('[Auth Service] Profile update (partial) error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      console.log('[Auth Service] Deleting user account');
      
      await httpClient.delete(API_CONFIG.ENDPOINTS.AUTH.USER);
      
      // Clear all stored data
      tokenManager.clearToken('Account deleted');
      localStorage.removeItem('user');
      
      console.log('[Auth Service] Account deleted successfully');
    } catch (error) {
      console.error('[Auth Service] Account deletion error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Request password reset via email
   * @param email - User's email address
   */
  async resetPassword(email: string): Promise<void> {
    try {
      console.log('[Auth Service] Requesting password reset for:', email);
      
      const resetData: PasswordResetData = { email: email.trim().toLowerCase() };
      
      await httpClient.post(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, 
        resetData
      );
      
      console.log('[Auth Service] Password reset request sent');
    } catch (error) {
      console.error('[Auth Service] Password reset error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Change current user's password
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      console.log('[Auth Service] Attempting password change');
      
      const changePasswordData: ChangePasswordData = {
        old_password: oldPassword,
        new_password: newPassword
      };

      await httpClient.post(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        changePasswordData
      );
      
      console.log('[Auth Service] Password changed successfully');
    } catch (error) {
      console.error('[Auth Service] Password change error:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      console.log('[Auth Service] Refreshing token');
      
      const response = await httpClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH
      );

      if (response.token) {
        tokenManager.setToken(response.token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        console.log('[Auth Service] Token refreshed successfully');
      }

      return response;
    } catch (error) {
      console.error('[Auth Service] Token refresh error:', error);
      tokenManager.clearToken('Refresh failed');
      localStorage.removeItem('user');
      throw new Error(this.handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('[Auth Service] Logging out user');
      await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('[Auth Service] Backend logout failed:', error);
    } finally {
      tokenManager.clearToken('User logged out');
      localStorage.removeItem('user');
      console.log('[Auth Service] User logged out and data cleared');
    }
  }

  isAuthenticated(): boolean {
    const isAuth = tokenManager.isAuthenticated();
    console.log('[Auth Service] Is authenticated:', isAuth);
    return isAuth;
  }

  getToken(): string | null {
    const token = tokenManager.getToken();
    console.log('[Auth Service] Get token called, token exists:', !!token);
    return token;
  }

  setToken(token: string): void {
    console.log('[Auth Service] Setting token');
    tokenManager.setToken(token);
  }

  clearToken(): void {
    console.log('[Auth Service] Clearing token');
    tokenManager.clearToken('Manual clear');
    localStorage.removeItem('user');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): AuthResponse | null {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      console.log('[Auth Service] Get stored user called, user exists:', !!user);
      return user;
    } catch (error) {
      console.error('[Auth Service] Error parsing stored user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Check if current user is a vendor
   */
  isVendor(): boolean {
    const user = this.getStoredUser();
    const isVendor = user?.user_type === 'vendor';
    console.log('[Auth Service] Is vendor:', isVendor);
    return isVendor;
  }

  /**
   * Check if current user is a customer
   */
  isCustomer(): boolean {
    const user = this.getStoredUser();
    const isCustomer = user?.user_type === 'customer';
    console.log('[Auth Service] Is customer:', isCustomer);
    return isCustomer;
  }

  private handleApiError(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;

      const fieldErrors = Object.keys(errorData)
        .filter(key => key !== 'detail' && key !== 'error' && Array.isArray(errorData[key]))
        .map(key => `${key}: ${errorData[key].join(', ')}`)
        .join('; ');

      if (fieldErrors) return fieldErrors;

      return errorData.detail || 'An error occurred';
    }

    return error.message || 'Unexpected error';
  }
}

// Export a singleton instance of the AuthService
export const authService = new AuthService();