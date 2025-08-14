// services/searchService.ts
/**
 * Search Service
 * Comprehensive search functionality with caching, suggestions, and analytics
 */

import { httpClient } from '../utils/http-client';
import { API_CONFIG } from '../config/api';

// Types for search functionality
export interface SearchResult {
  results: {
    products: Product[];
    services: Service[];
  };
  query: string;
  filters_applied: SearchFilters;
}

export interface Product {
  id: number;
  slug: string;
  product_name: string;
  product_description: string;
  featured_image_url: string;
  gallery_images: string[];
  product_price: number;
  original_price: number;
  currency: string;
  currency_symbol: string;
  is_negotiable: boolean;
  product_brand: string;
  product_model: string;
  product_condition: 'new' | 'used' | 'refurbished';
  product_status: string;
  tags: string;
  address_details: string;
  provider_phone: string;
  provider_email: string;
  provider_whatsapp: string;
  is_paid: boolean;
  is_promoted: boolean;
  is_featured: boolean;
  views_count: number;
  favorites_count: number;
  average_rating: number;
  rating_count: number;
  formatted_price: string;
  discount_percentage: number;
  full_location: string;
  tags_list: string[];
  user_details: UserDetails;
  category_details: CategoryDetails;
  recent_ratings: Rating[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  slug: string;
  service_name: string;
  service_description: string;
  featured_image_url: string;
  gallery_images: string[];
  serves_remote: boolean;
  service_radius: number;
  tags: string;
  provider_name: string;
  provider_title: string;
  provider_bio: string;
  provider_expertise: string;
  provider_experience: string;
  provider_certifications: string;
  provider_languages: string;
  provider_email: string;
  provider_phone: string;
  provider_whatsapp: string;
  provider_website: string;
  provider_linkedin: string;
  starting_price: number;
  max_price: number;
  currency: string;
  price_type: 'hourly' | 'project' | 'monthly';
  service_status: string;
  response_time: string;
  availability: string;
  is_paid: boolean;
  is_promoted: boolean;
  is_featured: boolean;
  is_verified: boolean;
  views_count: number;
  contacts_count: number;
  average_rating: number;
  rating_count: number;
  formatted_price_range: string;
  user_details: UserDetails;
  category_details: CategoryDetails;
  created_at: string;
  updated_at: string;
}

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface CategoryDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_type: 'product' | 'service' | 'both';
  parent: number | null;
  parent_name: string | null;
  icon: string;
  image: string;
  is_featured: boolean;
  subcategories: string[];
  full_path: string;
  products_count: number;
  services_count: number;
}

export interface Rating {
  id: number;
  user: number;
  user_details: UserDetails;
  user_name: string;
  rating: number;
  review_title: string;
  review: string;
  pros: string;
  cons: string;
  would_recommend: boolean;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  category?: string;
  location?: string;
  price_range?: [number, number];
  min_rating?: number;
  item_type?: 'all' | 'products' | 'services';
}

export interface SearchParams {
  q: string;
  category?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  item_type?: 'all' | 'products' | 'services';
  page?: number;
  page_size?: number;
}

export interface TrendingSearch {
  search_term: string;
  search_count: number;
  avg_results: number;
}

export interface TrendingSearchesResponse {
  trending_searches: TrendingSearch[];
  period: string;
}

export interface SearchSuggestion {
  query: string;
  type: 'product' | 'service' | 'category' | 'brand' | 'location';
  count?: number;
  category?: string;
  image?: string;
}

export interface QuickSearchResult {
  products: Product[];
  services: Service[];
  suggestions: SearchSuggestion[];
  total_count: number;
}

// Cache management
class SearchCache {
  private cache = new Map<string, { data: any; timestamp: number; duration: number }>();

  set(key: string, data: any, duration: number = API_CONFIG.CACHE_DURATIONS.SEARCH_RESULTS): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.duration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.duration) {
        this.cache.delete(key);
      }
    }
  }
}

// Recent searches management
class RecentSearches {
  private readonly MAX_RECENT = 10;
  private readonly STORAGE_KEY = 'recent_searches';

  add(query: string): void {
    if (!query.trim()) return;

    const recent = this.get();
    const filtered = recent.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    const updated = [query, ...filtered].slice(0, this.MAX_RECENT);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  }

  get(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
      return [];
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear recent searches:', error);
    }
  }

  remove(query: string): void {
    const recent = this.get();
    const filtered = recent.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Failed to remove recent search:', error);
    }
  }
}

/**
 * Main Search Service Class
 */
class SearchService {
  private readonly cache = new SearchCache();
  private readonly recentSearches = new RecentSearches();
  private abortController: AbortController | null = null;

  /**
   * Perform a comprehensive search across products and services
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const cacheKey = `search_${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = this.cache.get<SearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Add to recent searches if it's a user query
      if (params.q && params.q.length > 2) {
        this.recentSearches.add(params.q);
      }

      const searchParams = new URLSearchParams();
      
      // Add all search parameters
      if (params.q) searchParams.append('q', params.q);
      if (params.category) searchParams.append('category', params.category);
      if (params.location) searchParams.append('location', params.location);
      if (params.min_price !== undefined) searchParams.append('min_price', params.min_price.toString());
      if (params.max_price !== undefined) searchParams.append('max_price', params.max_price.toString());
      if (params.min_rating !== undefined) searchParams.append('min_rating', params.min_rating.toString());
      if (params.item_type) searchParams.append('item_type', params.item_type);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.page_size) searchParams.append('page_size', params.page_size.toString());

      const result = await httpClient.get<SearchResult>(
        `${API_CONFIG.ENDPOINTS.SEARCH}?${searchParams.toString()}`
      );

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error('Failed to perform search. Please try again.');
    }
  }

  /**
   * Quick search for autocomplete/suggestions (limited results)
   */
  async quickSearch(query: string): Promise<QuickSearchResult> {
    if (!query || query.length < 2) {
      return {
        products: [],
        services: [],
        suggestions: [],
        total_count: 0
      };
    }

    const cacheKey = `quick_search_${query.toLowerCase()}`;
    
    // Check cache first
    const cached = this.cache.get<QuickSearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cancel previous request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      const searchParams = new URLSearchParams({
        q: query,
        page_size: '6' // Limit results for quick search
      });

      const result = await httpClient.get<SearchResult>(
        `${API_CONFIG.ENDPOINTS.SEARCH}?${searchParams.toString()}`,
        { signal: this.abortController.signal }
      );

      const quickResult: QuickSearchResult = {
        products: result.results.products.slice(0, 3),
        services: result.results.services.slice(0, 3),
        suggestions: this.generateSearchSuggestions(query, result),
        total_count: result.results.products.length + result.results.services.length
      };

      // Cache with shorter duration for quick searches
      this.cache.set(cacheKey, quickResult, 2 * 60 * 1000); // 2 minutes

      return quickResult;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, return empty result
        return {
          products: [],
          services: [],
          suggestions: [],
          total_count: 0
        };
      }
      
      console.error('Quick search failed:', error);
      return {
        products: [],
        services: [],
        suggestions: [],
        total_count: 0
      };
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(): Promise<TrendingSearchesResponse> {
    const cacheKey = 'trending_searches';
    
    // Check cache first
    const cached = this.cache.get<TrendingSearchesResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await httpClient.get<TrendingSearchesResponse>(
        API_CONFIG.ENDPOINTS.ANALYTICS?.TRENDING_SEARCHES || '/api/main/analytics/trending-searches/'
      );

      // Cache with longer duration
      this.cache.set(cacheKey, result, API_CONFIG.CACHE_DURATIONS.TRENDING);

      return result;
    } catch (error) {
      console.error('Failed to get trending searches:', error);
      
      // Return fallback data
      return {
        trending_searches: [
          { search_term: 'iPhone', search_count: 45, avg_results: 12.5 },
          { search_term: 'Web Development', search_count: 38, avg_results: 8.2 },
          { search_term: 'Graphic Design', search_count: 32, avg_results: 15.7 },
          { search_term: 'Digital Marketing', search_count: 28, avg_results: 11.3 },
          { search_term: 'Photography', search_count: 25, avg_results: 9.8 }
        ],
        period: '7 days'
      };
    }
  }

  /**
   * Generate smart search suggestions based on results
   */
  private generateSearchSuggestions(query: string, results: SearchResult): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Extract unique categories from results
    const categories = new Set<string>();
    const brands = new Set<string>();
    const locations = new Set<string>();

    // Analyze products for patterns
    results.results.products.forEach(product => {
      if (product.category_details.name.toLowerCase().includes(queryLower)) {
        categories.add(product.category_details.name);
      }
      if (product.product_brand && product.product_brand.toLowerCase().includes(queryLower)) {
        brands.add(product.product_brand);
      }
      if (product.full_location) {
        const locationParts = product.full_location.split(',');
        locationParts.forEach(part => {
          const trimmed = part.trim();
          if (trimmed.toLowerCase().includes(queryLower)) {
            locations.add(trimmed);
          }
        });
      }
    });

    // Analyze services for patterns
    results.results.services.forEach(service => {
      if (service.category_details.name.toLowerCase().includes(queryLower)) {
        categories.add(service.category_details.name);
      }
      // Extract location info from services
      if (service.user_details?.full_name) {
        const locationInfo = `${service.user_details.full_name} services`;
        if (!suggestions.find(s => s.query === locationInfo)) {
          suggestions.push({
            query: locationInfo,
            type: 'service',
            count: 1
          });
        }
      }
    });

    // Add category-based suggestions
    Array.from(categories).slice(0, 2).forEach(category => {
      suggestions.push({
        query: category,
        type: 'category',
        category: category,
        count: results.results.products.filter(p => p.category_details.name === category).length +
               results.results.services.filter(s => s.category_details.name === category).length
      });
    });

    // Add brand-based suggestions
    Array.from(brands).slice(0, 2).forEach(brand => {
      suggestions.push({
        query: `${brand} products`,
        type: 'product',
        count: results.results.products.filter(p => p.product_brand === brand).length
      });
    });

    // Add location-based suggestions
    Array.from(locations).slice(0, 1).forEach(location => {
      suggestions.push({
        query: `${query} in ${location}`,
        type: 'location',
        count: results.results.products.filter(p => p.full_location.includes(location)).length +
               results.results.services.filter(s => s.user_details?.full_name?.includes(location) || false).length
      });
    });

    // Add intelligent query expansions based on context
    const contextualSuggestions = this.generateContextualSuggestions(query, results);
    suggestions.push(...contextualSuggestions);

    // Sort by relevance (count) and return top suggestions
    return suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.query.toLowerCase() === suggestion.query.toLowerCase())
      )
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 6);
  }

  /**
   * Generate contextual suggestions based on query analysis
   */
  private generateContextualSuggestions(query: string, results: SearchResult): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Technology-related suggestions
    const techKeywords = ['web', 'app', 'software', 'digital', 'tech', 'computer', 'mobile', 'website'];
    if (techKeywords.some(keyword => queryLower.includes(keyword))) {
      suggestions.push(
        { query: `${query} development`, type: 'service' },
        { query: `${query} consultant`, type: 'service' },
        { query: `${query} expert`, type: 'service' }
      );
    }

    // Design-related suggestions
    const designKeywords = ['design', 'graphic', 'logo', 'brand', 'creative', 'art'];
    if (designKeywords.some(keyword => queryLower.includes(keyword))) {
      suggestions.push(
        { query: `${query} services`, type: 'service' },
        { query: `${query} portfolio`, type: 'service' },
        { query: `custom ${query}`, type: 'service' }
      );
    }

    // Product-related suggestions
    const productKeywords = ['phone', 'laptop', 'camera', 'gadget', 'device', 'electronic'];
    if (productKeywords.some(keyword => queryLower.includes(keyword))) {
      suggestions.push(
        { query: `new ${query}`, type: 'product' },
        { query: `used ${query}`, type: 'product' },
        { query: `${query} accessories`, type: 'product' }
      );
    }

    // Service-related suggestions
    const serviceKeywords = ['repair', 'fix', 'service', 'maintenance', 'install', 'setup'];
    if (serviceKeywords.some(keyword => queryLower.includes(keyword))) {
      suggestions.push(
        { query: `${query} near me`, type: 'location' },
        { query: `professional ${query}`, type: 'service' },
        { query: `${query} specialist`, type: 'service' }
      );
    }

    // Price-based suggestions
    if (results.results.products.length > 0 || results.results.services.length > 0) {
      suggestions.push(
        { query: `cheap ${query}`, type: 'product' },
        { query: `affordable ${query}`, type: 'service' },
        { query: `best ${query}`, type: 'product' }
      );
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): string[] {
    return this.recentSearches.get();
  }

  /**
   * Add to recent searches
   */
  addToRecentSearches(query: string): void {
    this.recentSearches.add(query);
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.recentSearches.clear();
  }

  /**
   * Remove specific recent search
   */
  removeRecentSearch(query: string): void {
    this.recentSearches.remove(query);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cancel ongoing requests
   */
  cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanup(): void {
    this.cache.cleanup();
  }
}

// Export singleton instance
export const searchService = new SearchService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    searchService.cleanup();
    searchService.cancelRequests();
  });

  // Periodic cleanup
  setInterval(() => {
    searchService.cleanup();
  }, 5 * 60 * 1000); // Every 5 minutes
}