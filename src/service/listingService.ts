// services/listingService.ts - FIXED VERSION
import { httpClient } from '@/utils/http-client';
// import { API_CONFIG } from '@/config/api';
import { productService, type Product, type ProductFilters } from './productService';
import { serviceService as servicesService, type Service, type ServiceFilters } from './servicesService';
import { categoryService, type Category } from './categoryService';
import { locationService, type Country, type State, type City } from './locationService';

// Enhanced unified listing interface
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
  images: string[];
  tags: string[];
  isService: boolean;
  isPromoted: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  providerName: string;
  providerPhone: string;
  viewsCount: number;
  createdAt: string;
  originalData: Product | Service;
  slug?: string;
  vendor: {
    name: string;
    image: string;
  };
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
  my_listings?: boolean;
  limit?: number;
  offset?: number;
}

export interface VendorStats {
  totalListings: number;
  productsCount: number;
  servicesCount: number;
  featuredCount: number;
  promotedCount: number;
  activeCount: number;
  pausedCount: number;
  draftCount: number;
  totalViews: number;
  totalSales: number;
  averageRating: number;
}

export interface SearchResponse {
  results: {
    products: Product[];
    services: Service[];
  };
  query: string;
  filters_applied: Record<string, any>;
  total_count: number;
  page: number;
  per_page: number;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Advanced caching system
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 200;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private priorityKeys = new Set(['trending', 'promoted', 'categories', 'countries']);

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.priorityKeys.has(key) && Date.now() < entry.expiresAt) {
        continue;
      }
      
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

class ListingService {
  private cache = new AdvancedCache();
  private activeRequests = new Map<string, Promise<any>>();
  private retryDelays = [1000, 2000, 4000];

  private getCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${endpoint}?${JSON.stringify(sortedParams)}`;
  }

  private async requestWithDedup<T>(
    key: string, 
    fetcher: () => Promise<T>,
    cacheTTL?: number
  ): Promise<T> {
    const cached = this.cache.get<T>(key);
    if (cached) return cached;
    
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key) as Promise<T>;
    }
    
    const promise = fetcher();
    this.activeRequests.set(key, promise);
    
    try {
      const result = await promise;
      this.cache.set(key, result, cacheTTL);
      return result;
    } finally {
      this.activeRequests.delete(key);
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 2
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelays[attempt] || 2000)
        );
      }
    }
    
    throw lastError!;
  }

  private processImageUrl(imageUrl: string | null | undefined, baseUrl?: string): string {
    if (!imageUrl) return '/placeholder.svg';
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return baseUrl ? `${baseUrl}${imageUrl}` : imageUrl;
    }
    
    if (baseUrl && !imageUrl.startsWith(baseUrl)) {
      return `${baseUrl}/${imageUrl}`;
    }
    
    return imageUrl || '/placeholder.svg';
  }

  private processPrice(price: any): number | { min: number; max: number } | null {
    if (price === null || price === undefined || price === '') return null;
    
    if (typeof price === 'number' && !isNaN(price)) {
      return price >= 0 ? price : null;
    }
    
    if (typeof price === 'string') {
      const numPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
      return !isNaN(numPrice) && numPrice >= 0 ? numPrice : null;
    }
    
    if (typeof price === 'object' && price !== null) {
      const minPrice = typeof price.min === 'number' ? price.min : 
                     typeof price.min === 'string' ? parseFloat(price.min) : 0;
      const maxPrice = typeof price.max === 'number' ? price.max : 
                     typeof price.max === 'string' ? parseFloat(price.max) : minPrice;
      
      if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice >= 0 && maxPrice >= minPrice) {
        return { min: minPrice, max: maxPrice };
      }
    }
    
    return null;
  }

  private processTags(tags: any): string[] {
    if (Array.isArray(tags)) {
      return tags
        .filter(tag => tag && typeof tag === 'string')
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 10);
    }
    
    if (typeof tags === 'string' && tags.trim()) {
      return tags
        .split(/[,;|]/)
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 10);
    }
    
    return [];
  }

  private processGalleryImages(images: any): string[] {
    if (Array.isArray(images)) {
      return images
        .filter(img => img && typeof img === 'string')
        .map(img => this.processImageUrl(img))
        .slice(0, 10);
    }
    
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return this.processGalleryImages(parsed);
      } catch {
        return [this.processImageUrl(images)];
      }
    }
    
    return [];
  }

  private transformProduct(product: Product): UnifiedListing {
    const images = this.processGalleryImages(product.gallery_images || []);
    const featuredImage = this.processImageUrl(
      product.featured_image_url || (product as any).featured_image
    );
    
    const allImages = featuredImage !== '/placeholder.svg' 
      ? [featuredImage, ...images.filter(img => img !== featuredImage)]
      : images.length > 0 
        ? images 
        : ['/placeholder.svg'];

    return {
      id: product.id.toString(),
      title: product.product_name || 'Untitled Product',
      description: product.product_description || '',
      price: this.processPrice(product.product_price),
      rating: Math.max(0, Math.min(5, product.average_rating || 0)),
      ratingCount: Math.max(0, product.rating_count || 0),
      category: product.product_category || 'Uncategorized',
      location: product.full_location || 
               product.address_details || 
               [
                 product.full_location,
                 product.address_details,
               ].filter(Boolean).join(', ') || 
               'Location not specified',
      image: featuredImage,
      images: allImages,
      tags: this.processTags(product.tags),
      isService: false,
      isPromoted: Boolean(product.is_promoted),
      isFeatured: Boolean((product as any).is_featured),
      isVerified: false,
      providerName: product.user_details?.first_name && product.user_details?.last_name
        ? `${product.user_details.first_name} ${product.user_details.last_name}`.trim()
        : product.user_details?.username || 'Unknown Provider',
      providerPhone: product.product_provider_phone || '',
      viewsCount: Math.max(0, product.views_count || 0),
      createdAt: product.created_at || new Date().toISOString(),
      originalData: product,
      slug: product.slug,
      vendor: {
        name: product.user_details?.first_name && product.user_details?.last_name
          ? `${product.user_details.first_name} ${product.user_details.last_name}`.trim()
          : product.user_details?.username || 'Unknown Provider',
        image: this.processImageUrl((product.user_details as any)?.profile_image) || '/avatar.jpeg'
      }
    };
  }

  private transformService(service: Service): UnifiedListing {
    let price: number | { min: number; max: number } | null = null;
    
    if (service.starting_price !== null && service.starting_price !== undefined) {
      const startingPrice = Math.max(0, service.starting_price || 0);
      
      if (service.max_price && service.max_price > startingPrice) {
        price = { min: startingPrice, max: service.max_price };
      } else {
        price = startingPrice;
      }
    }

    let location = 'Location not specified';
    if (service.serves_remote) {
      location = 'Remote Available';
    } else {
      const locationParts = [
        service.city_details?.name,
        service.state_details?.name,
        service.country_details?.name
      ].filter(Boolean);
      
      if (locationParts.length > 0) {
        location = locationParts.join(', ');
      }
    }

    const images = this.processGalleryImages(service.gallery_images || []);
    const featuredImage = this.processImageUrl(service.featured_image_url);
    
    const allImages = featuredImage !== '/placeholder.svg' 
      ? [featuredImage, ...images.filter(img => img !== featuredImage)]
      : images.length > 0 
        ? images 
        : ['/placeholder.svg'];

    return {
      id: service.id.toString(),
      title: service.service_name || 'Untitled Service',
      description: service.service_description || '',
      price: price,
      rating: Math.max(0, Math.min(5, service.average_rating || 0)),
      ratingCount: Math.max(0, service.rating_count || 0),
      category: service.category_details?.name || 'Uncategorized',
      location: location,
      image: featuredImage,
      images: allImages,
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
      originalData: service,
      slug: service.slug,
      vendor: {
        name: service.provider_name || 
              service.user_details?.full_name || 
              'Unknown Provider',
        image: this.processImageUrl((service.user_details as any)?.profile_image) || '/avatar.jpeg'
      }
    };
  }

  private convertToProductFilters(filters: ListingFilters): ProductFilters {
    const productFilters: ProductFilters = {};

    if (filters.search) productFilters.search = filters.search;
    if (filters.category) productFilters.product_category = filters.category.toString();
    if (filters.country) productFilters.product_country = filters.country.toString();
    if (filters.state) productFilters.product_state = filters.state.toString();
    if (filters.city) productFilters.product_city = filters.city.toString();
    if (filters.min_price !== undefined) productFilters.min_price = filters.min_price;
    if (filters.max_price !== undefined) productFilters.max_price = filters.max_price;
    if (filters.product_condition) productFilters.product_condition = filters.product_condition;
    if (filters.is_promoted !== undefined) productFilters.is_promoted = filters.is_promoted;
    if (filters.ordering) productFilters.ordering = filters.ordering;
    if (filters.my_listings) productFilters.my_products = true;
    if (filters.limit) productFilters.page_size = filters.limit;
    if (filters.offset && filters.limit) productFilters.page = Math.floor(filters.offset / filters.limit) + 1;

    return productFilters;
  }

  private convertToServiceFilters(filters: ListingFilters): ServiceFilters {
    const serviceFilters: ServiceFilters = {};

    if (filters.search) serviceFilters.search = filters.search;
    if (filters.category) serviceFilters.service_category = filters.category.toString();
    if (filters.country) serviceFilters.service_country = filters.country.toString();
    if (filters.state) serviceFilters.service_state = filters.state.toString();
    if (filters.city) serviceFilters.service_city = filters.city.toString();
    if (filters.min_price !== undefined) serviceFilters.min_price = filters.min_price;
    if (filters.max_price !== undefined) serviceFilters.max_price = filters.max_price;
    if (filters.serves_remote !== undefined) serviceFilters.serves_remote = filters.serves_remote;
    if (filters.is_verified !== undefined) serviceFilters.is_verified = filters.is_verified;
    if (filters.ordering) serviceFilters.ordering = filters.ordering;
    if (filters.my_listings) serviceFilters.my_services = true;
    if (filters.limit) serviceFilters.page_size = filters.limit;
    if (filters.offset && filters.limit) serviceFilters.page = Math.floor(filters.offset / filters.limit) + 1;

    return serviceFilters;
  }

  async getAllListings(filters: ListingFilters = {}): Promise<UnifiedListing[]> {
    const cacheKey = this.getCacheKey('all-listings', filters);
    
    return this.requestWithDedup(
      cacheKey,
      async () => {
        try {
          const requests: Promise<UnifiedListing[]>[] = [];
          const itemType = filters.item_type || 'all';

          if (itemType === 'products') {
            const productFilters = this.convertToProductFilters(filters);
            requests.push(
              this.withRetry(() => productService.getProductsArray(productFilters))
                .then(products => products.map(p => this.transformProduct(p)))
                .catch(error => {
                  console.warn('Products request failed:', error);
                  return [];
                })
            );
          } else if (itemType === 'services') {
            const serviceFilters = this.convertToServiceFilters(filters);
            requests.push(
              this.withRetry(() => servicesService.getServicesArray(serviceFilters))
                .then(services => services.map(s => this.transformService(s)))
                .catch(error => {
                  console.warn('Services request failed:', error);
                  return [];
                })
            );
          } else {
            const productFilters = this.convertToProductFilters(filters);
            const serviceFilters = this.convertToServiceFilters(filters);

            requests.push(
              this.withRetry(() => productService.getProductsArray(productFilters))
                .then(products => products.map(p => this.transformProduct(p)))
                .catch(error => {
                  console.warn('Products request failed:', error);
                  return [];
                })
            );

            requests.push(
              this.withRetry(() => servicesService.getServicesArray(serviceFilters))
                .then(services => services.map(s => this.transformService(s)))
                .catch(error => {
                  console.warn('Services request failed:', error);
                  return [];
                })
            );
          }

          const results = await Promise.all(requests);
          const combined = results.flat();
          
          return this.sortListings(combined, filters.ordering || '-created_at');
          
        } catch (error) {
          console.error('Error in getAllListings:', error);
          throw new Error('Failed to load listings. Please check your connection and try again.');
        }
      },
      3 * 60 * 1000
    );
  }

  private sortListings(listings: UnifiedListing[], ordering: string): UnifiedListing[] {
    const sorted = [...listings];

    switch (ordering) {
      case 'product_price':
      case 'starting_price':
        return sorted.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : (a.price?.min || 0);
          const priceB = typeof b.price === 'number' ? b.price : (b.price?.min || 0);
          return priceA - priceB;
        });
      
      case '-product_price':
      case '-starting_price':
        return sorted.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : (a.price?.max || a.price?.min || 0);
          const priceB = typeof b.price === 'number' ? b.price : (b.price?.max || b.price?.min || 0);
          return priceB - priceA;
        });
      
      case '-average_rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case '-views_count':
        return sorted.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      
      case '-created_at':
      default:
        return sorted.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    }
  }

  async searchListings(filters: ListingFilters = {}): Promise<UnifiedListing[]> {
    const cacheKey = this.getCacheKey('search-listings', filters);
    
    return this.requestWithDedup(
      cacheKey,
      async () => {
        try {
          const searchParams: Record<string, any> = {};

          if (filters.search) searchParams.q = filters.search;
          if (filters.category) searchParams.category = filters.category;
          if (filters.location) searchParams.location = filters.location;
          if (filters.min_price !== undefined) searchParams.min_price = filters.min_price;
          if (filters.max_price !== undefined) searchParams.max_price = filters.max_price;
          if (filters.min_rating !== undefined) searchParams.min_rating = filters.min_rating;
          if (filters.item_type && filters.item_type !== 'all') {
            searchParams.item_type = filters.item_type;
          }

          const response = await this.withRetry(() => 
            httpClient.get<SearchResponse>('/api/main/search/', { params: searchParams })
          );

          const products = (response.results?.products || []).map(p => this.transformProduct(p));
          const services = (response.results?.services || []).map(s => this.transformService(s));

          return this.sortListings([...products, ...services], filters.ordering || '-created_at');
          
        } catch (error) {
          console.warn('Unified search failed, falling back to individual endpoints:', error);
          return this.getAllListings(filters);
        }
      },
      2 * 60 * 1000
    );
  }

  async getTrendingListings(): Promise<UnifiedListing[]> {
    return this.requestWithDedup(
      'trending-listings',
      () => this.getAllListings({
        ordering: '-views_count',
        limit: 20,
        is_promoted: true
      }),
      10 * 60 * 1000
    );
  }

  async getTopRatedListings(): Promise<UnifiedListing[]> {
    return this.requestWithDedup(
      'top-rated-listings',
      () => this.getAllListings({
        min_rating: 4,
        ordering: '-average_rating',
        limit: 20
      }),
      10 * 60 * 1000
    );
  }

  async getPromotedListings(): Promise<UnifiedListing[]> {
    return this.requestWithDedup(
      'promoted-listings',
      () => this.getAllListings({
        is_promoted: true,
        ordering: '-created_at',
        limit: 20
      }),
      5 * 60 * 1000
    );
  }

  async getVendorListings(): Promise<UnifiedListing[]> {
    return this.requestWithDedup(
      'vendor-listings',
      () => this.getAllListings({
        my_listings: true,
        ordering: '-created_at'
      }),
      2 * 60 * 1000
    );
  }

  async getVendorStats(): Promise<VendorStats> {
    return this.requestWithDedup(
      'vendor-stats',
      async () => {
        try {
          const [products, services] = await Promise.all([
            this.withRetry(() => productService.getMyProducts()),
            this.withRetry(() => servicesService.getMyServices())
          ]);

          const allListings = [
            ...products.map(p => this.transformProduct(p)),
            ...services.map(s => this.transformService(s))
          ];

          const activeListings = allListings.filter(l => 
            (l.originalData as any).product_status === 'published' || 
            (l.originalData as any).service_status === 'published'
          );

          return {
            totalListings: allListings.length,
            productsCount: products.length,
            servicesCount: services.length,
            featuredCount: allListings.filter(l => l.isFeatured).length,
            promotedCount: allListings.filter(l => l.isPromoted).length,
            activeCount: activeListings.length,
            pausedCount: allListings.filter(l => 
              (l.originalData as any).product_status === 'paused' || 
              (l.originalData as any).service_status === 'paused'
            ).length,
            draftCount: allListings.filter(l => 
              (l.originalData as any).product_status === 'draft' || 
              (l.originalData as any).service_status === 'draft'
            ).length,
            totalViews: allListings.reduce((sum, l) => sum + l.viewsCount, 0),
            totalSales: 0,
            averageRating: allListings.length > 0 ? 
              allListings.reduce((sum, l) => sum + l.rating, 0) / allListings.length : 0
          };
        } catch (error) {
          console.error('Error getting vendor stats:', error);
          throw new Error('Failed to load vendor statistics');
        }
      },
      5 * 60 * 1000
    );
  }

// Fixed getListingBySlugSmart method and related improvements
// Fixed getListingBySlugSmart method and related improvements

async getListingBySlugSmart(slug: string): Promise<UnifiedListing | null> {
  const cacheKey = `listing-smart-${slug}`;
  
  return this.requestWithDedup(
    cacheKey,
    async () => {
      try {
        // Try both service and product in parallel to be more efficient
        const [serviceResult, productResult] = await Promise.allSettled([
          this.withRetry(() => servicesService.getServiceBySlug(slug)),
          this.withRetry(() => productService.getProductBySlug(slug))
        ]);

        // Check if service was successful
        if (serviceResult.status === 'fulfilled' && serviceResult.value) {
          return this.transformService(serviceResult.value);
        }

        // Check if product was successful
        if (productResult.status === 'fulfilled' && productResult.value) {
          return this.transformProduct(productResult.value);
        }

        // Both failed - log the errors for debugging
        console.log('Smart slug detection failed for:', slug, {
          serviceError: serviceResult.status === 'rejected' ? serviceResult.reason : null,
          productError: productResult.status === 'rejected' ? productResult.reason : null
        });
        
        return null;
      } catch (error) {
        console.error('Error in smart slug detection:', error);
        return null;
      }
    },
    10 * 60 * 1000
  );
}



// Also fix the getListingBySlug method to handle errors better
async getListingBySlug(slug: string, type: 'product' | 'service'): Promise<UnifiedListing | null> {
  return this.requestWithDedup(
    `listing-slug-${type}-${slug}`,
    async () => {
      try {
        if (type === 'product') {
          const product = await this.withRetry(() => productService.getProductBySlug(slug));
          return this.transformProduct(product);
        } else if (type === 'service') {
          const service = await this.withRetry(() => servicesService.getServiceBySlug(slug));
          return this.transformService(service);
        }

        throw new Error('Invalid listing type');
      } catch (error: any) {
        console.error(`Error getting ${type} by slug "${slug}":`, error);
        
        // Handle specific error cases
        if (error.response?.status === 404 || 
            error.message?.includes('not found') || 
            error.message?.includes('Not found')) {
          return null;
        }
        
        // For other errors, still return null but log them
        console.warn(`Failed to fetch ${type} with slug ${slug}:`, error.message);
        return null;
      }
    },
    15 * 60 * 1000
  );
}
  async getListing(id: string): Promise<UnifiedListing | null> {
    return this.requestWithDedup(
      `listing-${id}`,
      async () => {
        try {
          const numericId = parseInt(id);

          if (isNaN(numericId)) {
            throw new Error('Invalid listing ID format');
          }

          // Try both product and service
          try {
            const product = await this.withRetry(() => productService.getProduct(numericId));
            return this.transformProduct(product);
          } catch (productError) {
            try {
              const service = await this.withRetry(() => servicesService.getService(numericId));
              return this.transformService(service);
            } catch (serviceError) {
              console.error('Failed to fetch both product and service:', { productError, serviceError });
              return null;
            }
          }
        } catch (error: any) {
          console.error('Error getting listing:', error);
          
          if (error.response?.status === 404 || error.message?.includes('not found')) {
            return null;
          }
          
          throw error;
        }
      },
      10 * 60 * 1000
    );
  }

  async getRelatedListings(
    currentListing: UnifiedListing,
    limit: number = 10
  ): Promise<UnifiedListing[]> {
    const cacheKey = `related-${currentListing.isService ? 'service' : 'product'}-${currentListing.id}`;
    
    return this.requestWithDedup(
      cacheKey,
      async () => {
        try {
          const filters: ListingFilters = {
            item_type: currentListing.isService ? 'services' : 'products',
            ordering: '-average_rating',
            limit: limit + 5
          };

          const categoryId = (currentListing.originalData as any).category_details?.id || 
                            (currentListing.originalData as any).product_category ||
                            (currentListing.originalData as any).category;
          
          if (categoryId) {
            filters.category = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
          }

          const allListings = await this.getAllListings(filters);
          
          const currentListingId = currentListing.id;
          const filtered = allListings
            .filter(item => item.id !== currentListingId)
            .slice(0, limit);

          if (filtered.length < Math.min(6, limit)) {
            const trendingItems = await this.getTrendingListings();
            const additionalItems = trendingItems
              .filter(item => 
                item.id !== currentListingId &&
                !filtered.some(existing => existing.id === item.id)
              )
              .slice(0, Math.min(6, limit) - filtered.length);
            
            filtered.push(...additionalItems);
          }

          return filtered.slice(0, limit);
        } catch (error) {
          console.error('Error getting related listings:', error);
          
          try {
            const trendingItems = await this.getTrendingListings();
            const currentListingId = currentListing.id;
            return trendingItems
              .filter(item => item.id !== currentListingId)
              .slice(0, limit);
          } catch (fallbackError) {
            console.error('Error getting trending as fallback:', fallbackError);
            return [];
          }
        }
      },
      5 * 60 * 1000
    );
  }

  async prefetchListings(slugs: string[], types?: ('product' | 'service')[]): Promise<void> {
    try {
      const prefetchPromises = slugs.map((slug, index) => {
        const type = types?.[index] || 'product';
        return this.getListingBySlug(slug, type).catch(error => {
          console.warn(`Failed to prefetch ${type} with slug ${slug}:`, error);
          return null;
        });
      });

      await Promise.all(prefetchPromises);
      console.log(`Prefetched ${slugs.length} listings`);
    } catch (error) {
      console.warn('Batch prefetch failed:', error);
    }
  }

  getListingUrl(listing: UnifiedListing): string {
    if (listing.slug) {
      return `/${listing.isService ? 'service' : 'product'}/${listing.slug}`;
    }
    return `/listing/${listing.id}`;
  }

  async warmCacheForListing(listing: UnifiedListing): Promise<void> {
    try {
      this.getRelatedListings(listing, 10).catch(error => {
        console.warn('Failed to warm related listings cache:', error);
      });

      const categoryId = (listing.originalData as any).category_details?.id;
      if (categoryId) {
        this.getAllListings({
          category: categoryId,
          item_type: listing.isService ? 'services' : 'products',
          limit: 20
        }).catch(error => {
          console.warn('Failed to warm category listings cache:', error);
        });
      }
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  }

  getPerformanceStats() {
    return {
      cacheSize: this.cache.size(),
      activeRequests: this.activeRequests.size,
      cacheHitRate: this.calculateCacheHitRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
      cacheKeys: Array.from((this.cache as any).cache.keys()).slice(0, 20),
      activeRequestKeys: Array.from(this.activeRequests.keys())
    };
  }

  private calculateCacheHitRate(): number {
    return 0; // Placeholder
  }

  private calculateAverageResponseTime(): number {
    return 0; // Placeholder
  }

  async deleteListing(id: string): Promise<boolean> {
    try {
      const numericId = parseInt(id);

      if (isNaN(numericId)) return false;

      // Try to delete from both services (since we don't know the type from just ID)
      try {
        await this.withRetry(() => productService.deleteProduct?.(numericId));
        this.cache.clear();
        return true;
      } catch (productError) {
        try {
          await this.withRetry(() => servicesService.deleteService?.(numericId));
          this.cache.clear();
          return true;
        } catch (serviceError) {
          console.error('Failed to delete from both services:', { productError, serviceError });
          return false;
        }
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  }

  async updateListingStatus(
    id: string, 
    status: 'published' | 'paused' | 'draft'
  ): Promise<boolean> {
    try {
      const numericId = parseInt(id);

      if (isNaN(numericId)) return false;

      // Try to update in both services
      try {
        await this.withRetry(() => 
          productService.updateProduct?.(numericId, { product_status: status })
        );
        this.cache.clear();
        return true;
      } catch (productError) {
        try {
          await this.withRetry(() => 
            servicesService.updateService?.(numericId, { service_status: status })
          );
          this.cache.clear();
          return true;
        } catch (serviceError) {
          console.error('Failed to update status in both services:', { productError, serviceError });
          return false;
        }
      }
    } catch (error) {
      console.error('Error updating listing status:', error);
      return false;
    }
  }

  async getAvailableFilters(): Promise<AvailableFilters> {
    return this.requestWithDedup(
      'available-filters',
      async () => {
        try {
          const [categories, countries] = await Promise.all([
            this.withRetry(() => categoryService.getCategories()),
            this.withRetry(() => locationService.getCountries())
          ]);

          return {
            categories,
            countries,
            states: [],
            cities: []
          };
        } catch (error) {
          console.error('Error getting available filters:', error);
          return {
            categories: [],
            countries: [],
            states: [],
            cities: []
          };
        }
      },
      15 * 60 * 1000
    );
  }

  async getAIRecommendations(params: AIRecommendationParams): Promise<UnifiedListing[]> {
    const cacheKey = this.getCacheKey('ai-recommendations', params);
    
    return this.requestWithDedup(
      cacheKey,
      async () => {
        try {
          const recommendationFilters: ListingFilters[] = [];

          if (params.searchHistory && params.searchHistory.length > 0) {
            recommendationFilters.push({
              search: params.searchHistory[0],
              is_promoted: true,
              ordering: '-views_count',
              limit: 10
            });
          }

          if (params.currentCategory) {
            const categoryId = parseInt(params.currentCategory);
            if (!isNaN(categoryId)) {
              recommendationFilters.push({
                category: categoryId,
                min_rating: 3,
                ordering: '-average_rating',
                limit: 10
              });
            }
          }

          recommendationFilters.push({
            is_featured: true,
            ordering: '-views_count',
            limit: 10
          });

          const promises = recommendationFilters.map(filter => 
            this.getAllListings(filter).catch(error => {
              console.warn('Recommendation request failed:', error);
              return [];
            })
          );
          
          const results = await Promise.all(promises);
          const combined = results.flat();
          
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );

          return unique
            .sort((a, b) => {
              if (a.isPromoted && !b.isPromoted) return -1;
              if (!a.isPromoted && b.isPromoted) return 1;
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              return (b.rating || 0) - (a.rating || 0);
            })
            .slice(0, 20);
            
        } catch (error) {
          console.error('Error getting AI recommendations:', error);
          return this.getTrendingListings();
        }
      },
      5 * 60 * 1000
    );
  }

  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size(),
      activeRequests: this.activeRequests.size,
      cacheKeys: Array.from((this.cache as any).cache.keys()),
      activeRequestKeys: Array.from(this.activeRequests.keys())
    };
  }

  async preloadCriticalData(): Promise<void> {
    try {
      Promise.all([
        this.getAvailableFilters(),
        this.getTrendingListings(),
        this.getPromotedListings()
      ]).catch(error => {
        console.warn('Background preload failed:', error);
      });
    } catch (error) {
      console.warn('Critical data preload failed:', error);
    }
  }
}

export const listingService = new ListingService();