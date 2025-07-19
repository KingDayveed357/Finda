export const API_CONFIG = {
  BASE_URL: import.meta.env.API_BASE_URL || 'https://finda-backend.onrender.com',
  ENDPOINTS: {
    CHATBOT: '/chatbot/api/',
    PRODUCTS: '/api/main/products/',
    SERVICES: '/api/main/services/',
    AUTH: {
      REGISTER: '/api/auth/register/',
      LOGIN: '/api/auth/login/',
    },
  },
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
RETRY_DELAY: 1000,
};