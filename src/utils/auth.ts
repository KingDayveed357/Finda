import type { AuthFormData } from '@/types/auth';

export const createVendorRegistrationData = (formData: AuthFormData) => {
  return {
    username: formData.username.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    password2: formData.confirmPassword,
    first_name: formData.firstName.trim(),
    last_name: formData.lastName.trim(),
    fullName: formData.fullName || `${formData.firstName} ${formData.lastName}`, // Fixed property access
    business_name: formData.businessName || '', // Provide default value
    business_description: formData.businessDescription || '', // Provide default value
    phone: formData.phone || '', // Provide default value
  };
};

export const validateAuthFormData = (formData: AuthFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.email) errors.push('Email is required');
  if (!formData.password) errors.push('Password is required');
  if (!formData.confirmPassword) errors.push('Confirm password is required');
  if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
  if (!formData.username) errors.push('Username is required');
  if (!formData.firstName) errors.push('First name is required');
  if (!formData.lastName) errors.push('Last name is required');
  
  return errors;
};