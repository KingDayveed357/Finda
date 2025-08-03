import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService, AUTH_EVENTS } from '../service';
import type { 
  AuthFormData, 
  CustomerRegistrationData, 
  VendorRegistrationData,
  LoginData,
  UserType,
  UserProfileUpdate,
  AuthResponse
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

// Listen to token manager events and propagate them
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_EVENTS?.STATE_CHANGED || 'auth-state-changed', () => {
    authEvents.emit();
  });
  
  window.addEventListener(AUTH_EVENTS?.TOKEN_CLEARED || 'auth-token-cleared', () => {
    authEvents.emit();
  });
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const loginData: LoginData = { username: email, password };
      
      console.log('Attempting login with:', { email });
      
      const response = await authService.login(loginData);
      
      console.log('Login successful, token stored');
      
      toast.success("Login successful!", {
        description: "Welcome back to Finda!",
      });

      // Redirect based on user type
      if (response.user.user_type === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/dashboard'); // or wherever customers should go
      }

      console.log('Login successful:', response);
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Logging out user');
      
      await authService.logout();
      
      toast.success("Logged out successfully", {
        description: "See you next time!",
      });

      // Redirect to login page
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still show success message as token is cleared locally even if backend fails
      toast.success("Logged out successfully", {
        description: "See you next time!",
      });
      navigate('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const registerCustomer = async (formData: AuthFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const registrationData: CustomerRegistrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password2: formData.confirmPassword,
        phone: formData.phone || '', 
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        profile: formData.profile || null,
      };

      console.log('Customer registration data being sent:', {
        ...registrationData,
        password: '[REDACTED]',
        password2: '[REDACTED]'
      });

      const response = await authService.registerCustomer(registrationData);

      toast.success("Account created successfully!", {
        description: "Welcome to Finda! You are now logged in.",
      });

      // Redirect to customer dashboard
      navigate('/dashboard');

      console.log('Customer registration successful:', response);
    } catch (error) {
      console.error('Customer registration error:', error);
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerVendor = async (formData: AuthFormData): Promise<void> => {
    setIsLoading(true);
    try {
      if (!formData.businessName) {
        throw new Error("Business name is required for vendor registration");
      }

      const registrationData: VendorRegistrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password2: formData.confirmPassword,
        phone: formData.phone || '', 
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        business_name: formData.businessName.trim(),
        business_description: formData.businessDescription || '',
        business_image: formData.businessImage || null,
        profile: formData.profile || null,
      };

      console.log('Vendor registration data being sent:', {
        ...registrationData,
        password: '[REDACTED]',
        password2: '[REDACTED]'
      });

      const response = await authService.registerVendor(registrationData);

      toast.success("Vendor account created successfully!", {
        description: "Welcome to Finda! You are now logged in as a vendor.",
      });

      // Redirect to vendor dashboard
      navigate('/vendor/dashboard');

      console.log('Vendor registration successful:', response);
    } catch (error) {
      console.error('Vendor registration error:', error);
      toast.error("Vendor registration failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: AuthFormData, userType: UserType): Promise<void> => {
    if (userType === 'customer') {
      await registerCustomer(formData);
    } else if (userType === 'vendor') {
      await registerVendor(formData);
    } else {
      toast.error("Invalid user type", {
        description: "Please select either customer or vendor.",
      });
      throw new Error("Invalid user type");
    }
  };

  const getCurrentUser = async (): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      toast.error("Failed to fetch user data", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user profile (full update)
   */
  const updateProfile = async (profileData: UserProfileUpdate): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log('Updating profile with data:', profileData);
      
      const updatedUser = await authService.updateProfile(profileData);
      
      toast.success("Profile updated successfully!", {
        description: "Your profile information has been saved.",
      });

      console.log('Profile update successful:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Profile update failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Partially update user profile
   */
  const updateProfilePartial = async (profileData: Partial<UserProfileUpdate>): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log('Partially updating profile with data:', profileData);
      
      const updatedUser = await authService.updateProfilePartial(profileData);
      
      toast.success("Profile updated successfully!", {
        description: "Your profile changes have been saved.",
      });

      console.log('Partial profile update successful:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Partial profile update error:', error);
      toast.error("Partial Profile update failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete user account
   */
  const deleteAccount = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Deleting user account');
      
      await authService.deleteAccount();
      
      toast.success("Account deleted successfully", {
        description: "Your account and all associated data have been removed.",
      });

      // Redirect to home or login page
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error("Account deletion failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh error:', error);
      // Token refresh failure usually means user needs to log in again
      throw error;
    }
  };

  /**
   * Request password reset via email
   * @param email - User's email address
   */
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Requesting password reset for:', email);
      
      await authService.resetPassword(email);
      
      toast.success("Password reset email sent!", {
        description: "Check your email for reset instructions. If you don't see it, check your spam folder.",
      });

      console.log('Password reset request successful');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Password reset failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change current user's password
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting to change password');
      
      await authService.changePassword(oldPassword, newPassword);
      
      toast.success("Password changed successfully!", {
        description: "Your password has been updated. Please use your new password for future logins.",
      });

      console.log('Password change successful');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error("Password change failed", {
        description: error instanceof Error ? error.message : "Please check your current password and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = (): boolean => {
    return authService.isAuthenticated();
  };

  const getToken = (): string | null => {
    return authService.getToken();
  };

  const getStoredUser = () => {
    return authService.getStoredUser();
  };

  const isVendor = (): boolean => {
    return authService.isVendor();
  };

  const isCustomer = (): boolean => {
    return authService.isCustomer();
  };

  return { 
    // Authentication methods
    login, 
    logout, 
    register, 
    registerCustomer,
    registerVendor,
    
    // Password management
    resetPassword,
    changePassword,
    
    // Profile management
    updateProfile,
    updateProfilePartial,
    deleteAccount,
    
    // Token management
    refreshToken,
    getToken,
    
    // User management
    getCurrentUser,
    getStoredUser,
    isVendor,
    isCustomer,
    
    // State
    isLoading, 
    isAuthenticated,
    
    // Events
    authEvents
  };
};