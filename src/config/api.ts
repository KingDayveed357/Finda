// config/api.ts
/**
 * API Configuration
 * Central configuration for all API-related settings including endpoints,
 * timeouts, retry policies, and environment-specific settings.
 */

export const API_CONFIG = {
  // Base URL from environment variables with fallback
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://finda-backend.onrender.com',
  
  // API Endpoints organized by feature
  ENDPOINTS: {
    
    PRODUCTS: '/api/main/products/',
    SERVICES: '/api/main/services/',
    CATEGORIES: '/api/main/categories/',
    SEARCH: '/api/main/search/',
    
    // Analytics endpoints
    ANALYTICS: {
      TRENDING_SEARCHES: '/api/main/analytics/trending-searches/',
    },
    
    AUTH: {
      REGISTER: '/api/auth/register/',
      LOGIN: '/api/auth/login/',
      REFRESH: '/api/auth/refresh/',
      USER: '/api/auth/me/',
      RESET_PASSWORD: '/api/auth/reset-password/',
      CHANGE_PASSWORD: '/api/auth/change-password/',
      LOGOUT: '/api/auth/logout/',
    },
    CHATBOT: {
      MAIN: '/chatbot/api/chat/',
      SEARCH: '/chatbot/api/search/',
      SUGGESTIONS: '/chatbot/api/suggestions/',
      FILE_UPLOADS: '/chatbot/api/upload/image/',
      VOICE_NOTE: '/chatbot/api/upload/voice/',
      CONVERSATIONS: '/chatbot/api/conversation/{session_id}/',
      FEEDBACK: '/chatbot/api/feedback/',
      STATUS: '/chatbot/api/status/',
      HEALTH: '/chatbot/api/health/'
    }
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
  
  // Cache durations for different types of data
  CACHE_DURATIONS: {
    SEARCH_RESULTS: 3 * 60 * 1000,    // 3 minutes
    LISTINGS: 5 * 60 * 1000,          // 5 minutes
    AI_RECOMMENDATIONS: 10 * 60 * 1000, // 10 minutes
    TRENDING: 15 * 60 * 1000,         // 15 minutes
    FILTERS: 30 * 60 * 1000,          // 30 minutes
    CATEGORIES: 60 * 60 * 1000,       // 1 hour
  },
  
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  // Search configuration
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300, // milliseconds
    QUICK_SEARCH_LIMIT: 6,
    SUGGESTIONS_LIMIT: 4,
    RECENT_SEARCHES_LIMIT: 10,
  },
  
  // Image settings
  IMAGES: {
    PLACEHOLDER_PRODUCT: '/placeholder-product.jpg',
    PLACEHOLDER_SERVICE: '/placeholder-service.jpg',
    PLACEHOLDER_AVATAR: '/placeholder-avatar.jpg',
    PLACEHOLDER_GENERAL: '/placeholder-image.jpg',
  },
} as const;

// Type definitions for better type safety
export type ApiEndpoints = typeof API_CONFIG.ENDPOINTS;
export type AuthEndpoints = typeof API_CONFIG.ENDPOINTS.AUTH;
export type AnalyticsEndpoints = typeof API_CONFIG.ENDPOINTS.ANALYTICS;