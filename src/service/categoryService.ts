// services/categoryService.ts
import { httpClient } from '@/utils/http-client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_type: 'both' | 'product' | 'service';
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

export interface CategoryFilters {
  search?: string;
  category_type?: 'both' | 'product' | 'service';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CategoryService {
  private readonly baseUrl = '/api/main/categories';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
  private cache = new Map<string, CacheEntry<Category[]>>();

  /**
   * Generate cache key based on filters
   */
  private getCacheKey(filters?: CategoryFilters): string {
    if (!filters) return 'all_categories';
    
    const sortedFilters = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return sortedFilters || 'all_categories';
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(entry: CacheEntry<Category[]>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache(key: string): Category[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (this.isCacheValid(entry)) {
      console.log(`Cache hit for key: ${key}`);
      return entry.data;
    }
    
    // Remove expired entry
    this.cache.delete(key);
    console.log(`Cache expired for key: ${key}`);
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: Category[]): void {
    const now = Date.now();
    const entry: CacheEntry<Category[]> = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    
    this.cache.set(key, entry);
    console.log(`Data cached for key: ${key}, expires at: ${new Date(entry.expiresAt).toISOString()}`);
  }

  /**
   * Clear all cache entries
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('All cache entries cleared');
  }

  /**
   * Clear specific cache entry
   */
  public clearCacheEntry(filters?: CategoryFilters): void {
    const key = this.getCacheKey(filters);
    this.cache.delete(key);
    console.log(`Cache entry cleared for key: ${key}`);
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { totalEntries: number; validEntries: number; expiredEntries: number } {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((entry) => {
      if (now < entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries
    };
  }

  /**
   * Clean up expired cache entries
   */
  public cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Get all categories with optional filters (with caching)
   */
  async getCategories(filters?: CategoryFilters): Promise<Category[]> {
    try {
      // Generate cache key
      const cacheKey = this.getCacheKey(filters);
      
      // Try to get from cache first
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from API
      console.log(`Cache miss for key: ${cacheKey}, fetching from API`);
      
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value);
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/?${params.toString()}` : `${this.baseUrl}/`;
      const response = await httpClient.get<{ count: number; results: Category[] }>(url);
      
      // Cache the result
      this.setCache(cacheKey, response.results);
      
      return response.results;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get categories by type (with caching)
   */
  async getCategoriesByType(type: 'both' | 'product' | 'service'): Promise<Category[]> {
    return this.getCategories({ category_type: type });
  }

  /**
   * Search categories (with caching)
   */
  async searchCategories(query: string): Promise<Category[]> {
    return this.getCategories({ search: query });
  }

  /**
   * Get featured categories (with caching)
   */
  async getFeaturedCategories(): Promise<Category[]> {
    const categories = await this.getCategories();
    return categories.filter(category => category.is_featured);
  }

  /**
   * Force refresh categories (bypasses cache)
   */
  async refreshCategories(filters?: CategoryFilters): Promise<Category[]> {
    // Clear the specific cache entry
    this.clearCacheEntry(filters);
    
    // Fetch fresh data
    return this.getCategories(filters);
  }
}

export const categoryService = new CategoryService();

// Optional: Set up periodic cache cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    categoryService.cleanupExpiredCache();
  }, 5 * 60 * 1000); // 5 minutes
}