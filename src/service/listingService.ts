// services/listingService.ts
import { httpClient } from '@/utils/http-client';
import { API_CONFIG } from '@/config/api';
import { type Category } from './categoryService';
import {  type Country, type State, type City } from '@/service/LocationService';

// Unified listing interface for UI consumption
export interface UnifiedListing {
  id: string;
  title: string;
  description: string;
  price: number | { min: number; max: number } | null;
  rating: number;
  ratingCount: number;
  category: string;
  location: string;
  image: string;
  tags: string[];
  isService: boolean;
  isPromoted: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  providerName: string;
  providerPhone: string;
  viewsCount: number;
  createdAt: string;
  originalData: any;
}

export interface ListingFilters {
  search?: string;
  category?: number;
  location?: string;
  country?: number;
  state?: number;
  city?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  item_type?: 'all' | 'products' | 'services';
  product_condition?: 'new' | 'used' | 'refurbished';
  is_promoted?: boolean;
  is_featured?: boolean;
  serves_remote?: boolean;
  is_verified?: boolean;
  ordering?: string;
}

export interface SearchResponse {
  results: {
    products: ProductResponse[];
    services: ServiceResponse[];
  };
  query: string;
  filters_applied: any;
}

export interface ProductResponse {
  id: number;
  slug: string;
  product_name: string;
  product_description: string;
  featured_image: string;
  gallery_images: string[];
  product_price: number;
  original_price: number;
  currency: string;
  is_negotiable: boolean;
  product_brand: string;
  product_model: string;
  product_condition: string;
  product_status: string;
  tags: string;
  address_details: string;
  provider_phone: string;
  provider_email: string;
  provider_whatsapp: string;
  is_paid: boolean;
  is_promoted: boolean;
  is_featured: boolean;
  promotion_fee: number;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  expires_at: string;
  user: number;
  country: number;
  state: number;
  city: number;
  category: number;
  average_rating: number;
  rating_count: number;
  formatted_price: string;
  discount_percentage: number;
  currency_symbol: string;
  full_location: string;
  tags_list: string[];
  user_details: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  country_details: any;
  state_details: any;
  city_details: any;
  category_details: any;
  recent_ratings: any[];
}

export interface ServiceResponse {
  id: number;
  slug: string;
  service_name: string;
  service_description: string;
  featured_image: string;
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
  price_type: string;
  service_status: string;
  response_time: string;
  availability: string;
  is_paid: boolean;
  is_promoted: boolean;
  is_featured: boolean;
  is_verified: boolean;
  promotion_fee: number;
  views_count: number;
  contacts_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  average_rating: number;
  rating_count: number;
  formatted_price_range: string;
  user_details: any;
  country_details: any;
  state_details: any;
  city_details: any;
  category_details: any;
}

export interface ProductsApiResponse {
  count: number;
  results: ProductResponse[];
}

export interface ServicesApiResponse {
  count: number;
  results: ServiceResponse[];
}

export interface AvailableFilters {
  categories: Category[];
  countries: Country[];
  states: State[];
  cities: City[];
}

export interface AIRecommendationParams {
  searchHistory?: string[];
  currentCategory?: string;
  userPreferences?: {
    priceRange: [number, number];
    locations: string[];
    ratings: number;
  };
}

class ListingService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private activeRequests = new Map<string, Promise<any>>();

  private getCacheKey(url: string, params: any): string {
    return `${url}?${new URLSearchParams(params).toString()}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Enhanced image URL processing
   */
  private processImageUrl(imageUrl: string | null | undefined, baseUrl?: string): string {
    if (!imageUrl) return '/placeholder-image.jpg';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it starts with /, it's a relative path from root
    if (imageUrl.startsWith('/')) {
      return baseUrl ? `${baseUrl}${imageUrl}` : imageUrl;
    }
    
    // Handle media URLs that might need base URL
    if (baseUrl && !imageUrl.startsWith(baseUrl)) {
      return `${baseUrl}/${imageUrl}`;
    }
    
    return imageUrl || '/placeholder-image.jpg';
  }

  /**
   * Enhanced price processing with null safety
   */
  private processPrice(price: any): number | { min: number; max: number } | null {
    if (price === null || price === undefined) return null;
    
    // Handle numeric prices
    if (typeof price === 'number') {
      return price >= 0 ? price : null;
    }
    
    // Handle string prices
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return !isNaN(numPrice) && numPrice >= 0 ? numPrice : null;
    }
    
    // Handle price objects
    if (typeof price === 'object') {
      const min = typeof price.min === 'number' ? price.min : 
                  typeof price.min === 'string' ? parseFloat(price.min) : 0;
      const max = typeof price.max === 'number' ? price.max : 
                  typeof price.max === 'string' ? parseFloat(price.max) : min;
      
      return { min: Math.max(0, min), max: Math.max(min, max) };
    }
    
    return null;
  }

  /**
   * Enhanced tags processing
   */
  private processTags(tags: any): string[] {
    if (Array.isArray(tags)) {
      return tags.filter(tag => tag && typeof tag === 'string').map(tag => tag.trim());
    }
    
    if (typeof tags === 'string' && tags.trim()) {
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    
    return [];
  }

  /**
   * Transform API product to UnifiedListing with enhanced null safety
   */
  private transformProduct(product: ProductResponse): UnifiedListing {
    return {
      id: `product-${product.id}`,
      title: product.product_name || 'Untitled Product',
      description: product.product_description || '',
      price: this.processPrice(product.product_price),
      rating: Math.max(0, Math.min(5, product.average_rating || 0)),
      ratingCount: Math.max(0, product.rating_count || 0),
      category: product.category_details?.name || 'Uncategorized',
      location: product.full_location || product.address_details || 'Location not specified',
      image: this.processImageUrl(product.featured_image),
      tags: this.processTags(product.tags_list || product.tags),
      isService: false,
      isPromoted: Boolean(product.is_promoted),
      isFeatured: Boolean(product.is_featured),
      isVerified: false, // Products don't have verification in this API
      providerName: product.user_details?.full_name || 
                   product.user_details?.username || 
                   'Unknown Provider',
      providerPhone: product.provider_phone || '',
      viewsCount: Math.max(0, product.views_count || 0),
      createdAt: product.created_at || new Date().toISOString(),
      originalData: product
    };
  }

  /**
   * Transform API service to UnifiedListing with enhanced null safety
   */
  private transformService(service: ServiceResponse): UnifiedListing {
    // Process service price range
    let price: number | { min: number; max: number } | null = null;
    
    if (service.starting_price !== null && service.starting_price !== undefined) {
      const startingPrice = Math.max(0, service.starting_price || 0);
      const maxPrice = service.max_price && service.max_price > startingPrice ? 
                      service.max_price : startingPrice * 2;
      
      price = startingPrice === maxPrice ? startingPrice : { min: startingPrice, max: maxPrice };
    }

    // Build location string
    let location = 'Location not specified';
    if (service.serves_remote) {
      location = 'Remote Available';
    } else if (service.city_details?.name) {
      const locationParts = [
        service.city_details.name,
        service.state_details?.name,
        service.country_details?.name
      ].filter(Boolean);
      location = locationParts.join(', ');
    }

    return {
      id: `service-${service.id}`,
      title: service.service_name || 'Untitled Service',
      description: service.service_description || '',
      price: price,
      rating: Math.max(0, Math.min(5, service.average_rating || 0)),
      ratingCount: Math.max(0, service.rating_count || 0),
      category: service.category_details?.name || 'Uncategorized',
      location: location,
      image: this.processImageUrl(service.featured_image),
      tags: this.processTags(service.tags),
      isService: true,
      isPromoted: Boolean(service.is_promoted),
      isFeatured: Boolean(service.is_featured),
      isVerified: Boolean(service.is_verified),
      providerName: service.provider_name || 
                   service.user_details?.full_name || 
                   'Unknown Provider',
      providerPhone: service.provider_phone || '',
      viewsCount: Math.max(0, service.views_count || 0),
      createdAt: service.created_at || new Date().toISOString(),
      originalData: service
    };
  }

  /**
   * Deduplicate requests to prevent multiple identical calls
   */
  private async makeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in progress
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key);
    }

    // Check cache first
    const cached = this.getFromCache<T>(key);
    if (cached) {
      return cached;
    }

    // Make request and cache it
    const requestPromise = requestFn()
      .then(result => {
        this.setCache(key, result);
        this.activeRequests.delete(key);
        return result;
      })
      .catch(error => {
        this.activeRequests.delete(key);
        throw error;
      });

    this.activeRequests.set(key, requestPromise);
    return requestPromise;
  }

  /**
   * Advanced search using the /api/main/search/ endpoint
   */
  async searchListings(filters: ListingFilters = {}): Promise<UnifiedListing[]> {
    const cacheKey = this.getCacheKey('/api/main/search/', filters);
    
    return this.makeRequest(cacheKey, async () => {
      const searchParams: Record<string, any> = {};

      if (filters.search) searchParams.q = filters.search;
      if (filters.category) searchParams.category = filters.category;
      if (filters.location) searchParams.location = filters.location;
      if (filters.min_price !== undefined) searchParams.min_price = filters.min_price;
      if (filters.max_price !== undefined) searchParams.max_price = filters.max_price;
      if (filters.min_rating !== undefined) searchParams.min_rating = filters.min_rating;
      if (filters.item_type && filters.item_type !== 'all') searchParams.item_type = filters.item_type;

      const queryString = Object.entries(searchParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const url = queryString ? `/api/main/search/?${queryString}` : '/api/main/search/';
      
      const response = await httpClient.get<SearchResponse>(url);

      const products = (response.results?.products || []).map(p => this.transformProduct(p));
      const services = (response.results?.services || []).map(s => this.transformService(s));

      return [...products, ...services];
    });
  }

  /**
   * Get products using the products endpoint
   */
  async getProducts(filters: ListingFilters = {}): Promise<UnifiedListing[]> {
    const cacheKey = this.getCacheKey(API_CONFIG.ENDPOINTS.PRODUCTS, filters);
    
    return this.makeRequest(cacheKey, async () => {
      const params: Record<string, any> = {};

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;
      if (filters.min_price !== undefined) params.min_price = filters.min_price;
      if (filters.max_price !== undefined) params.max_price = filters.max_price;
      if (filters.product_condition) params.product_condition = filters.product_condition;
      if (filters.is_promoted !== undefined) params.is_promoted = filters.is_promoted;
      if (filters.ordering) params.ordering = filters.ordering;

      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const url = queryString ? `${API_CONFIG.ENDPOINTS.PRODUCTS}?${queryString}` : API_CONFIG.ENDPOINTS.PRODUCTS;
      
      const response = await httpClient.get<ProductsApiResponse>(url);
      return response.results.map(product => this.transformProduct(product));
    });
  }

  /**
   * Get services using the services endpoint
   */
  async getServices(filters: ListingFilters = {}): Promise<UnifiedListing[]> {
    const cacheKey = this.getCacheKey(API_CONFIG.ENDPOINTS.SERVICES, filters);
    
    return this.makeRequest(cacheKey, async () => {
      const params: Record<string, any> = {};

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;
      if (filters.min_price !== undefined) params.min_price = filters.min_price;
      if (filters.max_price !== undefined) params.max_price = filters.max_price;
      if (filters.serves_remote !== undefined) params.serves_remote = filters.serves_remote;
      if (filters.is_verified !== undefined) params.is_verified = filters.is_verified;
      if (filters.ordering) params.ordering = filters.ordering;

      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const url = queryString ? `${API_CONFIG.ENDPOINTS.SERVICES}?${queryString}` : API_CONFIG.ENDPOINTS.SERVICES;
      
      const response = await httpClient.get<ServicesApiResponse>(url);
      return response.results.map(service => this.transformService(service));
    });
  }

  /**
   * Get all listings - smart endpoint selection with enhanced error handling
   */
  async getAllListings(filters: ListingFilters = {}): Promise<UnifiedListing[]> {
    try {
      // Strategy 1: Use comprehensive search for complex queries
      if (filters.search || (filters.category && (filters.country || filters.state || filters.city)) || filters.min_rating) {
        return await this.searchListings(filters);
      }

      // Strategy 2: Use individual endpoints for simple queries
      const requests: Promise<UnifiedListing[]>[] = [];

      if (filters.item_type === 'products') {
        requests.push(this.getProducts(filters));
      } else if (filters.item_type === 'services') {
        requests.push(this.getServices(filters));
      } else {
        // Fetch both types
        requests.push(this.getProducts(filters));
        requests.push(this.getServices(filters));
      }

      const results = await Promise.allSettled(requests);
      
      // Combine successful results
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<UnifiedListing[]> => result.status === 'fulfilled')
        .map(result => result.value)
        .flat();

      // If we got some results, return them even if some requests failed
      if (successfulResults.length > 0) {
        return successfulResults;
      }

      // If all individual requests failed, try fallback search
      console.warn('Individual requests failed, trying fallback search');
      return await this.searchListings(filters);
      
    } catch (error) {
      console.error('Error in getAllListings:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get trending listings (most viewed)
   */
  async getTrendingListings(): Promise<UnifiedListing[]> {
    return this.getAllListings({
      ordering: '-views_count'
    });
  }

  /**
   * Get top rated listings
   */
  async getTopRatedListings(): Promise<UnifiedListing[]> {
    return this.getAllListings({
      min_rating: 3,
      ordering: '-average_rating'
    });
  }

  /**
   * Get promoted/featured listings
   */
  async getPromotedListings(): Promise<UnifiedListing[]> {
    return this.getAllListings({
      is_promoted: true,
      ordering: '-created_at'
    });
  }

  /**
   * Get AI-powered recommendations with better error handling
   */
  async getAIRecommendations(params: AIRecommendationParams): Promise<UnifiedListing[]> {
    try {
      const recommendationFilters: ListingFilters[] = [];

      // 1. Based on search history
      if (params.searchHistory && params.searchHistory.length > 0) {
        recommendationFilters.push({
          search: params.searchHistory[0],
          is_promoted: true,
          ordering: '-views_count'
        });
      }

      // 2. Based on current category
      if (params.currentCategory) {
        const categoryId = parseInt(params.currentCategory);
        if (!isNaN(categoryId)) {
          recommendationFilters.push({
            category: categoryId,
            min_rating: 3,
            ordering: '-average_rating'
          });
        }
      }

      // 3. Featured items
      recommendationFilters.push({
        is_featured: true,
        ordering: '-views_count'
      });

      // Execute recommendation strategies with error handling
      const promises = recommendationFilters.map(filter => 
        this.getAllListings(filter).catch(error => {
          console.warn('Recommendation request failed:', error);
          return [];
        })
      );
      
      const results = await Promise.all(promises);
      
      // Combine and deduplicate results
      const combined = results.flat();
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      // Sort by relevance
      return unique.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.rating || 0) - (a.rating || 0);
      }).slice(0, 20);
      
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  }

  /**
   * Clear cache and active requests
   */
  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      cacheKeys: Array.from(this.cache.keys()),
      activeRequestKeys: Array.from(this.activeRequests.keys())
    };
  }
}

export const listingService = new ListingService();