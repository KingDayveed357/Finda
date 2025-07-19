// hooks/useAuth.ts
import { useState } from 'react';
import { toast } from 'sonner';
import { API_CONFIG } from '@/config/api';
import { apiClient } from '@/utils/api';
import type { 
  AuthFormData, 
  CustomerRegistrationData, 
  LoginData, 
  AuthResponse, 
  LoginResponse, 
  ApiErrorResponse 
} from '@/types/auth';

// Enhanced event system for auth state changes
class AuthEventEmitter {
  private listeners: Array<() => void> = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit() {
    console.log('Auth state changed, notifying listeners');
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in auth event listener:', error);
      }
    });
  }
}

export const authEvents = new AuthEventEmitter();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const makeApiRequest = async <T>(url: string, options: RequestInit): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      console.log('Making API request to:', url);
      console.log('Request options:', {
        method: options.method,
        headers: options.headers,
        body: options.body
      });

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorData: ApiErrorResponse;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || `HTTP error! status: ${response.status}` };
        }

        // Handle different error formats
        let errorMessage = errorData.detail;
        
        // Check if it's a validation error object
        if (typeof errorData === 'object' && !errorData.detail) {
          const errors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = errors || `HTTP error! status: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API request error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const loginData: LoginData = { username, password };
      
      const response = await makeApiRequest<LoginResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        {
          method: 'POST',
          body: JSON.stringify(loginData),
          headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json'
          }
        }
      );

      // Store token using the API client method
      apiClient.setAuthToken(response.token);
      
      console.log('Login successful, token stored');
      
      // Notify other components about auth state change
      authEvents.emit();
      
      toast.success("Login successful!", {
        description: "Welcome back to Finda!",
      });

      console.log('Login successful:', response);
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('Logging out user');
    
    // Clear token using the API client method
    apiClient.logout();
    
    // Notify other components about auth state change
    authEvents.emit();
    
    toast.success("Logged out successfully", {
      description: "See you next time!",
    });
  };

  const registerCustomer = async (formData: AuthFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const registrationData: CustomerRegistrationData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password2: formData.confirmPassword,
        phone: formData.phone,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
      };

      console.log('Registration data being sent:', registrationData);

      const response = await makeApiRequest<AuthResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        {
          method: 'POST',
          body: JSON.stringify(registrationData),
        }
      );

      toast.success("Account created successfully!", {
        description: "You can now sign in with your credentials.",
      });

      console.log('Registration successful:', response);
      
      // Optionally auto-login after registration
      // await login(formData.username, formData.password);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: AuthFormData, userType: string): Promise<void> => {
    if (userType === 'customer') {
      await registerCustomer(formData);
    } else {
      // Vendor registration not implemented yet
      toast.error("Vendor registration not available", {
        description: "This feature is coming soon.",
      });
    }
  };

  const isAuthenticated = (): boolean => {
    return apiClient.isAuthenticated();
  };

  return { 
    login, 
    logout, 
    register, 
    registerCustomer, 
    isLoading, 
    isAuthenticated 
  };
};