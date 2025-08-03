// types/auth.ts

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profile?: File | null;
  // Vendor-specific fields
  businessName?: string;
  businessDescription?: string;
  businessImage?: File | null;
}

export interface CustomerRegistrationData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile?: File | null;
}

export interface VendorRegistrationData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone: string;
  business_name: string;
  business_description?: string;
  profile?: File | null;
  business_image?: File | null;
}

export interface AuthResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile?: string;
  date_joined: string;
  user_type: 'customer' | 'vendor';
  // Vendor-specific fields
  business_name?: string;
  business_description?: string;
  business_image?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthResponse;
}

export interface RegistrationResponse {
  token: string;
  user: AuthResponse;
  message: string;
}

export interface PasswordResetData {
  email: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  profile?: File | string;
  // Vendor-specific fields
  business_name?: string;
  business_description?: string;
  business_image?: File | string;
}

export interface ApiErrorResponse {
  detail?: string;
  error?: string;
  [key: string]: any;
}

export type UserType = 'customer' | 'vendor';