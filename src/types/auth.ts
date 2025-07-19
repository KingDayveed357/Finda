export interface CustomerRegistrationData {
  username: string;
  email: string;
  password: string;
  password2:string;
  phone:string;
  first_name: string;
  last_name: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  // Vendor-specific fields (kept for future use)
  businessName?: string;
  businessDescription?: string;
  businessImage?: File | null;
  phone?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiErrorResponse {
  detail?: string;
  [key: string]: any; // For validation errors that might have field-specific errors
}

export type UserType = 'customer' | 'vendor';