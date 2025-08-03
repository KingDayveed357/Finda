// services/index.ts
/**
 * Services Index
 * Central export point for all API services, HTTP client, and utilities
 * Now includes product, service, and listing services
 */

// Export primary services
export { authService } from './authService';
export { chatbotService } from './chatbotService';

// Export new listing services
export { productService } from './productService';
export { serviceService } from './servicesService';
export { listingService } from './listingService';

// Export types
export type { Product, ProductFilters, ProductRating } from './productService';
export type { Service, ServiceFilters, ServiceRating } from './servicesService';
export type { UnifiedListing, ListingFilters } from './listingService';

// Export HTTP client and related utilities
export { httpClient } from '../utils/http-client';
export { tokenManager, AUTH_EVENTS } from '../utils/token-manager';

// Export API configuration
export { API_CONFIG } from '../config/api';

// Export utility functions
export * from '../utils/auth';

// Export utility functions for client status
export {
  isHttpClientReady,
  getClientInfo
} from '../utils/axios-client';

/**
 * Service collection for easier access
 * Usage: import { services } from '@/services';
 * Then: services.auth.login(credentials) or services.listings.getAllListings()
 */
import { authService } from './authService';
import { chatbotService } from './chatbotService';
import { productService } from './productService';
import { serviceService } from './servicesService';
import { listingService } from './listingService';
import { isHttpClientReady, getClientInfo } from '../utils/axios-client';

export const services = {
  auth: authService,
  chatbot: chatbotService,
  products: productService,
  services: serviceService,
  listings: listingService,
} as const;

/**
 * Initialize services
 * This function should be called at app startup to perform any necessary
 * initialization tasks for the services.
 */
// export const initializeServices = async (): Promise<void> => {
//   try {
//     console.log('Initializing API services...');
    
//     // Check if HTTP client is ready
//     if (!isHttpClientReady()) {
//       throw new Error('HTTP client is not properly initialized');
//     }
    
//     // Verify authentication token if it exists
//     if (authService.isAuthenticated()) {
//       console.log('Existing authentication token found, verifying...');
//       try {
//         const isValid = await authService.verifyToken();
        
//         if (!isValid) {
//           console.warn('Authentication token verification failed, clearing token');
//           authService.logout();
//         } else {
//           console.log('Authentication token verified successfully');
//         }
//       } catch (error) {
//         console.warn('Token verification failed:', error);
//         authService.logout();
//       }
//     }
    
//     // Initialize chatbot service if needed
//     try {
//       console.log('Chatbot service ready');
//     } catch (error) {
//       console.warn('Chatbot service initialization warning:', error);
//     }
    
//     // Test listing services
//     try {
//       console.log('Testing listing services...');
//       // You might want to perform a simple test call here
//       console.log('Listing services ready');
//     } catch (error) {
//       console.warn('Listing services initialization warning:', error);
//     }
    
//     console.log('API services initialized successfully');
//     console.log('Client info:', getClientInfo());
//   } catch (error) {
//     console.error('Failed to initialize API services:', error);
//     throw error;
//   }
// };

/**
 * Health check for core services
 */
export const performHealthCheck = async (): Promise<{
  httpClient: boolean;
  auth: boolean;
  chatbot: boolean;
  listings: boolean;
  overall: boolean;
}> => {
  const results = {
    httpClient: false,
    auth: false,
    chatbot: false,
    listings: false,
    overall: false,
  };

  try {
    // Test HTTP client
    results.httpClient = isHttpClientReady();
    
    // Test auth service
    // try {
    //   if (authService.isAuthenticated()) {
    //     await authService.verifyToken();
    //     results.auth = true;
    //   } else {
    //     results.auth = true;
    //   }
    // } catch (error) {
    //   console.warn('Auth service health check failed:', error);
    //   results.auth = false;
    // }
    
    // Test chatbot service
    try {
      const isChatbotAvailable = typeof chatbotService !== 'undefined' && chatbotService !== null;
      results.chatbot = isChatbotAvailable;
    } catch (error) {
      console.warn('Chatbot service health check failed:', error);
      results.chatbot = false;
    }
    
    // Test listing services
    try {
      const isListingAvailable = typeof listingService !== 'undefined' && listingService !== null;
      results.listings = isListingAvailable;
      
      if (isListingAvailable) {
        // Optional: perform a lightweight test call
        // await listingService.getAvailableCategories();
      }
    } catch (error) {
      console.warn('Listing service health check failed:', error);
      results.listings = false;
    }
    
    // Overall health is good if critical services are working
    results.overall = results.httpClient && results.auth && results.listings;
    
  } catch (error) {
    console.error('Health check failed:', error);
  }

  return results;
};

/**
 * Service cleanup function
 */
export const cleanupServices = (): void => {
  try {
    console.log('Cleaning up services...');
    
    // Clear authentication
    if (authService.isAuthenticated()) {
      authService.logout();
    }
    
    console.log('Services cleanup completed');
  } catch (error) {
    console.error('Error during services cleanup:', error);
  }
};

/**
 * Service status information
 */
export const getServiceStatus = () => {
  try {
    const clientInfo = getClientInfo();
    
    return {
      httpClient: {
        ready: clientInfo.isReady,
        authenticated: clientInfo.isAuthenticated,
        hasValidToken: clientInfo.hasValidToken,
      },
      auth: {
        isAuthenticated: authService.isAuthenticated(),
      },
      chatbot: {
        available: typeof chatbotService !== 'undefined' && chatbotService !== null,
      },
      listings: {
        available: typeof listingService !== 'undefined' && listingService !== null,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting service status:', error);
    return {
      httpClient: {
        ready: false,
        authenticated: false,
        hasValidToken: false,
      },
      auth: {
        isAuthenticated: false,
      },
      chatbot: {
        available: false,
      },
      listings: {
        available: false,
      },
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Type definitions for service exports
 */
export type ServiceStatus = ReturnType<typeof getServiceStatus>;
export type HealthCheckResult = Awaited<ReturnType<typeof performHealthCheck>>;

// Default export for convenience
export default services;