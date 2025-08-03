// utils/apiStrategy.ts
// import { httpClient } from '@/utils/http-client';
import type { ListingFilters } from '../service/listingService';

/**
 * API Strategy Helper
 * Handles intelligent endpoint selection and fallback strategies
 * for different types of listing requests
 */

export interface ApiStrategyConfig {
  preferredEndpoint: 'search' | 'individual' | 'auto';
  fallbackEnabled: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

export class ApiEndpointStrategy {
  private static instance: ApiEndpointStrategy;
  private config: ApiStrategyConfig;
  private performanceMetrics = new Map<string, { 
    avgResponseTime: number; 
    successRate: number; 
    lastUsed: number;
  }>();

  private constructor() {
    this.config = {
      preferredEndpoint: 'auto',
      fallbackEnabled: true,
      cacheStrategy: 'moderate'
    };
  }

  static getInstance(): ApiEndpointStrategy {
    if (!ApiEndpointStrategy.instance) {
      ApiEndpointStrategy.instance = new ApiEndpointStrategy();
    }
    return ApiEndpointStrategy.instance;
  }

  /**
   * Determines the best endpoint strategy based on filters and historical performance
   */
  determineEndpointStrategy(filters: ListingFilters): {
    strategy: 'search' | 'individual' | 'hybrid';
    reason: string;
    endpoints: string[];
  } {
    // Strategy 1: Use search endpoint for complex queries
    if (this.shouldUseSearchEndpoint(filters)) {
      return {
        strategy: 'search',
        reason: 'Complex filters require comprehensive search',
        endpoints: ['/api/main/search/']
      };
    }

    // Strategy 2: Use individual endpoints for simple queries
    if (this.shouldUseIndividualEndpoints(filters)) {
      const endpoints = this.getIndividualEndpoints(filters);
      return {
        strategy: 'individual',
        reason: 'Simple filters can use optimized individual endpoints',
        endpoints
      };
    }

    // Strategy 3: Hybrid approach
    return {
      strategy: 'hybrid',
      reason: 'Mixed complexity requires hybrid approach',
      endpoints: ['/api/main/search/', '/api/main/products/', '/api/main/services/']
    };
  }

  /**
   * Checks if search endpoint should be used
   */
  private shouldUseSearchEndpoint(filters: ListingFilters): boolean {
    // Use search endpoint for:
    // 1. Text search queries
    // 2. Cross-cutting filters (rating, price with location)
    // 3. Complex combinations
    
    const complexFilters = [
      filters.search,
      filters.min_rating,
      (filters.category && (filters.country || filters.state || filters.city)),
      (filters.min_price && filters.max_price && (filters.category || filters.location))
    ].filter(Boolean).length;

    return complexFilters >= 2;
  }

  /**
   * Checks if individual endpoints should be used
   */
  private shouldUseIndividualEndpoints(filters: ListingFilters): boolean {
    // Use individual endpoints for:
    // 1. Simple category or location filters
    // 2. Type-specific requests
    // 3. Simple sorting/ordering
    
    const simpleFilters = [
      filters.category && !filters.search,
      filters.item_type && filters.item_type !== 'all',
      filters.is_promoted && !filters.search,
      !filters.search && !filters.min_rating && Object.keys(filters).length <= 3
    ].some(Boolean);

    return simpleFilters;
  }

  /**
   * Gets the appropriate individual endpoints based on filters
   */
  private getIndividualEndpoints(filters: ListingFilters): string[] {
    const endpoints: string[] = [];

    if (filters.item_type === 'products') {
      endpoints.push('/api/main/products/');
    } else if (filters.item_type === 'services') {
      endpoints.push('/api/main/services/');
    } else {
      endpoints.push('/api/main/products/', '/api/main/services/');
    }

    return endpoints;
  }

  /**
   * Records performance metrics for endpoint optimization
   */
  recordPerformance(endpoint: string, responseTime: number, success: boolean): void {
    const current = this.performanceMetrics.get(endpoint) || {
      avgResponseTime: responseTime,
      successRate: success ? 1 : 0,
      lastUsed: Date.now()
    };

    // Update running averages
    const alpha = 0.3; // Smoothing factor
    current.avgResponseTime = alpha * responseTime + (1 - alpha) * current.avgResponseTime;
    current.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * current.successRate;
    current.lastUsed = Date.now();

    this.performanceMetrics.set(endpoint, current);
  }

  /**
   * Gets performance metrics for debugging
   */
  getPerformanceMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.performanceMetrics.forEach((value, key) => {
      metrics[key] = {
        avgResponseTime: Math.round(value.avgResponseTime),
        successRate: Math.round(value.successRate * 100),
        lastUsed: new Date(value.lastUsed).toISOString()
      };
    });

    return metrics;
  }

  /**
   * Intelligent request execution with fallback
   */
  async executeWithFallback<T>(
    primaryRequest: () => Promise<T>,
    fallbackRequest?: () => Promise<T>,
    endpoint?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await primaryRequest();
      
      if (endpoint) {
        this.recordPerformance(endpoint, Date.now() - startTime, true);
      }
      
      return result;
    } catch (error) {
      console.warn('Primary request failed:', error);
      
      if (endpoint) {
        this.recordPerformance(endpoint, Date.now() - startTime, false);
      }

      // Try fallback if available and enabled
      if (this.config.fallbackEnabled && fallbackRequest) {
        console.log('Attempting fallback request...');
        
        try {
          const fallbackResult = await fallbackRequest();
          console.log('Fallback request succeeded');
          return fallbackResult;
        } catch (fallbackError) {
          console.error('Fallback request also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<ApiStrategyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   */
  getConfig(): ApiStrategyConfig {
    return { ...this.config };
  }
}

/**
 * Error categorization helper
 */
export class ApiErrorHandler {
  static categorizeError(error: any): {
    category: 'network' | 'server' | 'client' | 'parsing' | 'unknown';
    isRetryable: boolean;
    shouldFallback: boolean;
    userMessage: string;
  } {
    // Network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        category: 'network',
        isRetryable: true,
        shouldFallback: true,
        userMessage: 'Connection timeout. Please try again.'
      };
    }

    // Server errors (5xx)
    if (error.response?.status >= 500) {
      return {
        category: 'server',
        isRetryable: true,
        shouldFallback: true,
        userMessage: 'Server error. Please try again in a moment.'
      };
    }

    // Client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return {
        category: 'client',
        isRetryable: false,
        shouldFallback: error.response?.status !== 404, // Don't fallback for 404s
        userMessage: error.response?.data?.detail || 'Request failed. Please check your input.'
      };
    }

    // JSON parsing errors (likely HTML error pages)
    if (error.message?.includes('Unexpected token') && error.message?.includes('<!doctype')) {
      return {
        category: 'parsing',
        isRetryable: true,
        shouldFallback: true,
        userMessage: 'Server returned an unexpected response. Please try again.'
      };
    }

    // Unknown errors
    return {
      category: 'unknown',
      isRetryable: true,
      shouldFallback: true,
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }

  static shouldRetry(error: any, attemptCount: number, maxAttempts: number = 3): boolean {
    if (attemptCount >= maxAttempts) return false;
    
    const { isRetryable } = this.categorizeError(error);
    return isRetryable;
  }
}

// Export singleton instance
export const apiStrategy = ApiEndpointStrategy.getInstance();