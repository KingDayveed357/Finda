// config/api.ts
/**
 * API Configuration
 * Central configuration for all API-related settings including endpoints,
 * timeouts, retry policies, and environment-specific settings.
 */

export const API_CONFIG = {
  // Base URL from environment variables with fallback
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://finda-backend.onrender.com',
  
  //  MEDIA_URL: import.meta.env.REACT_APP_MEDIA_URL || `${import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/media/`,

  // API Endpoints organized by feature
  ENDPOINTS: {
    CHATBOT: '/chatbot/api/',
    PRODUCTS: '/api/main/products/',
    SERVICES: '/api/main/services/',
    CATEGORIES: '/api/main/categories/',
    SEARCH: '/api/main/search/',
    AUTH: {
      REGISTER: '/api/auth/register/',
      LOGIN: '/api/auth/login/',
      // VERIFY: '/api/auth/verify/',
      REFRESH: '/api/auth/refresh/',
      USER: '/api/auth/me/',
      RESET_PASSWORD: '/api/auth/reset-password/',
      CHANGE_PASSWORD: '/api/auth/change-password/',
      LOGOUT: '/api/auth/logout/',
    },
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // HTTP status codes that should trigger retries
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  
  // Authentication token storage key
  AUTH_TOKEN_KEY: 'authToken',
  
  // Request headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
    // Retry configuration for failed requests
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000, // Base delay in milliseconds
    DELAY_MULTIPLIER: 2, // Exponential backoff multiplier
    MAX_DELAY: 5000, // Maximum delay between retries
  },
   
    CACHE_DURATIONS: {
    SEARCH_RESULTS: 3 * 60 * 1000,    // 3 minutes
    LISTINGS: 5 * 60 * 1000,          // 5 minutes
    AI_RECOMMENDATIONS: 10 * 60 * 1000, // 10 minutes
    TRENDING: 15 * 60 * 1000,         // 15 minutes
    FILTERS: 30 * 60 * 1000,          // 30 minutes
  },
  
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  // Image settings
  IMAGES: {
    PLACEHOLDER_PRODUCT: '/placeholder-product.jpg',
    PLACEHOLDER_SERVICE: '/placeholder-service.jpg',
    PLACEHOLDER_AVATAR: '/placeholder-avatar.jpg',
    PLACEHOLDER_GENERAL: '/placeholder-image.jpg',
  },

} as const;


// Helper function to resolve image URLs
// export const resolveImageUrl = (imageUrl: string | null | undefined): string => {
//   if (!imageUrl) return API_CONFIG.IMAGES.PLACEHOLDER_GENERAL;
  
//   // If already absolute URL, return as is
//   if (imageUrl.startsWith('http')) return imageUrl;
  
//   // Handle relative URLs from Django
//   if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
//     return `${API_CONFIG.BASE_URL}${imageUrl}`;
//   }
  
//   if (imageUrl.startsWith('/')) {
//     return `${API_CONFIG.BASE_URL}${imageUrl}`;
//   }
  
//   return `${API_CONFIG.MEDIA_URL}${imageUrl}`;
// };

// Helper function to resolve avatar URLs
// export const resolveAvatarUrl = (avatarUrl: string | null | undefined): string => {
//   if (!avatarUrl) return API_CONFIG.IMAGES.PLACEHOLDER_AVATAR;
//   return resolveImageUrl(avatarUrl);
// };

// Environment check
// export const isDevelopment = process.env.NODE_ENV === 'development';
// export const isProduction = process.env.NODE_ENV === 'production';

// Type definitions for better type safety
export type ApiEndpoints = typeof API_CONFIG.ENDPOINTS;
export type AuthEndpoints = typeof API_CONFIG.ENDPOINTS.AUTH;