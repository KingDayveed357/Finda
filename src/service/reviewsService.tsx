// services/reviewsService.ts - Enhanced with slug-based endpoints and better error handling
import { httpClient } from '../utils/http-client';

// Base interfaces for common rating properties
export interface BaseUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface BaseRating {
  id: number;
  user: number;
  user_details: BaseUser;
  user_name: string;
  rating: number; // Supports decimals (e.g., 4.5)
  review_title?: string;
  review: string;
  would_recommend: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// Product-specific rating interface
export interface ProductRating extends BaseRating {
  pros?: string;
  cons?: string;
  is_verified_purchase: boolean;
}

// Service-specific rating interface
export interface ServiceRating extends BaseRating {
  communication_rating: number; // Supports decimals
  quality_rating: number; // Supports decimals
  timeliness_rating: number; // Supports decimals
  would_hire_again: boolean;
  is_verified_customer: boolean;
}

// Request DTOs for creating/updating ratings
export interface CreateProductRatingRequest {
  rating: number; // Decimal value (e.g., 4.5)
  review_title?: string;
  review: string;
  pros?: string;
  cons?: string;
  would_recommend: boolean;
}

export interface CreateServiceRatingRequest {
  rating: number; // Decimal value (e.g., 4.5)
  review_title?: string;
  review: string;
  communication_rating: number; // Decimal value (e.g., 3.5)
  quality_rating: number; // Decimal value (e.g., 4.5)
  timeliness_rating: number; // Decimal value (e.g., 5.0)
  would_recommend: boolean;
  would_hire_again: boolean;
}

export interface UpdateProductRatingRequest extends CreateProductRatingRequest {}
export interface UpdateServiceRatingRequest extends CreateServiceRatingRequest {}

// Enhanced error handling types
export interface ReviewError {
  message: string;
  field?: string;
  code?: string;
  details?: any;
}

export class ReviewsService {
  private readonly productsBaseUrl = '/api/main/products';
  private readonly servicesBaseUrl = '/api/main/services';

  // ==================== ENHANCED ERROR HANDLING ====================

  private handleApiError(error: any, context: string): never {
    console.error(`=== API ERROR in ${context} ===`);
    console.error('Full error object:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      if (error.response.status === 404) {
        const message = error.response.data?.detail || 'Resource not found';
        throw new Error(`${context}: ${message}`);
      } else if (error.response.status === 400) {
        const message = error.response.data?.detail || 'Bad request';
        throw new Error(`${context}: ${message}`);
      } else if (error.response.status === 403) {
        throw new Error(`${context}: Access denied. Please check your permissions.`);
      } else if (error.response.status === 500) {
        throw new Error(`${context}: Server error. Please try again later.`);
      } else {
        const message = error.response.data?.detail || error.message || 'Unknown error';
        throw new Error(`${context}: ${message}`);
      }
    } else if (error.request) {
      console.error('Request error:', error.request);
      throw new Error(`${context}: Network error. Please check your connection.`);
    } else {
      console.error('Error message:', error.message);
      throw new Error(`${context}: ${error.message}`);
    }
  }

  // ==================== SLUG-BASED ENDPOINTS ====================

  /**
   * NEW: Get ratings by listing slug
   */
  async getListingRatingsBySlug(listingSlug: string, isService: boolean): Promise<(ProductRating | ServiceRating)[]> {
    try {
      const baseUrl = isService ? this.servicesBaseUrl : this.productsBaseUrl;
      const listingType = isService ? 'service' : 'product';
      
      console.log(`=== FETCHING ${listingType.toUpperCase()} RATINGS BY SLUG ===`);
      console.log(`Listing slug: ${listingSlug}`);
      console.log(`URL: ${baseUrl}/slug/${listingSlug}/ratings/`);
      
      const response = await httpClient.get<(ProductRating | ServiceRating)[]>(
        `${baseUrl}/slug/${listingSlug}/ratings/`
      );
      
      // FIXED: Ensure response is always an array
      const ratings = Array.isArray(response) ? response : [];
      console.log(`✓ Successfully fetched ${ratings.length} ${listingType} ratings`);
      return ratings;
    } catch (error) {
      console.error(`Error fetching ${isService ? 'service' : 'product'} ratings by slug:`, error);
      // FIXED: Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * NEW: Create rating by listing slug
   */
  async createListingRatingBySlug(
    listingSlug: string,
    isService: boolean,
    ratingData: CreateProductRatingRequest | CreateServiceRatingRequest
  ): Promise<ProductRating | ServiceRating> {
    try {
      const baseUrl = isService ? this.servicesBaseUrl : this.productsBaseUrl;
      const listingType = isService ? 'service' : 'product';
      
      console.log(`=== CREATING ${listingType.toUpperCase()} RATING BY SLUG ===`);
      console.log(`Listing slug: ${listingSlug}`);
      console.log('Rating data:', ratingData);
      
      // Sanitize the data
      const sanitizedData = isService 
        ? this.sanitizeServiceRating(ratingData as CreateServiceRatingRequest)
        : this.sanitizeProductRating(ratingData as CreateProductRatingRequest);
      
      // Validate rating data
      if (isService) {
        this.validateServiceRating(sanitizedData as CreateServiceRatingRequest);
      } else {
        this.validateProductRating(sanitizedData as CreateProductRatingRequest);
      }

      console.log('Sanitized data to send:', sanitizedData);
      console.log('Request URL:', `${baseUrl}/slug/${listingSlug}/ratings/`);

      const response = await httpClient.post<ProductRating | ServiceRating>(
        `${baseUrl}/slug/${listingSlug}/ratings/`,
        sanitizedData
      );
      
      console.log(`✓ Successfully created ${listingType} rating:`, response);
      return response;
    } catch (error) {
      this.handleApiError(error, `Creating rating for ${isService ? 'service' : 'product'} ${listingSlug}`);
    }
  }

  /**
   * NEW: Update rating by listing slug
   */
  async updateListingRatingBySlug(
    listingSlug: string,
    ratingId: number,
    isService: boolean,
    ratingData: UpdateProductRatingRequest | UpdateServiceRatingRequest
  ): Promise<ProductRating | ServiceRating> {
    try {
      const baseUrl = isService ? this.servicesBaseUrl : this.productsBaseUrl;
      const listingType = isService ? 'service' : 'product';
      
      console.log(`=== UPDATING ${listingType.toUpperCase()} RATING BY SLUG ===`);
      console.log(`Listing slug: ${listingSlug}`);
      console.log(`Rating ID: ${ratingId}`);
      
      // Sanitize the data
      const sanitizedData = isService 
        ? this.sanitizeServiceRating(ratingData as UpdateServiceRatingRequest)
        : this.sanitizeProductRating(ratingData as UpdateProductRatingRequest);
      
      // Validate rating data
      if (isService) {
        this.validateServiceRating(sanitizedData as UpdateServiceRatingRequest);
      } else {
        this.validateProductRating(sanitizedData as UpdateProductRatingRequest);
      }

      const response = await httpClient.put<ProductRating | ServiceRating>(
        `${baseUrl}/slug/${listingSlug}/ratings/${ratingId}/`,
        sanitizedData
      );
      
      console.log(`✓ Successfully updated ${listingType} rating`);
      return response;
    } catch (error) {
      this.handleApiError(error, `Updating rating ${ratingId} for ${isService ? 'service' : 'product'} ${listingSlug}`);
    }
  }

  /**
   * NEW: Delete rating by listing slug
   */
  async deleteListingRatingBySlug(
    listingSlug: string,
    ratingId: number,
    isService: boolean
  ): Promise<void> {
    try {
      const baseUrl = isService ? this.servicesBaseUrl : this.productsBaseUrl;
      const listingType = isService ? 'service' : 'product';
      
      console.log(`=== DELETING ${listingType.toUpperCase()} RATING BY SLUG ===`);
      console.log(`Listing slug: ${listingSlug}`);
      console.log(`Rating ID: ${ratingId}`);
      
      await httpClient.delete(`${baseUrl}/slug/${listingSlug}/ratings/${ratingId}/`);
      
      console.log(`✓ Successfully deleted ${listingType} rating`);
    } catch (error) {
      this.handleApiError(error, `Deleting rating ${ratingId} for ${isService ? 'service' : 'product'} ${listingSlug}`);
    }
  }

  // ==================== LEGACY ID-BASED ENDPOINTS (for backward compatibility) ====================

  private async verifyListingExists(listingId: number, isService: boolean): Promise<void> {
    try {
      const baseUrl = isService ? this.servicesBaseUrl : this.productsBaseUrl;
      const listingType = isService ? 'service' : 'product';
      
      console.log(`=== VERIFYING ${listingType.toUpperCase()} EXISTS ===`);
      console.log(`Checking ${listingType} with ID: ${listingId}`);
      console.log(`URL: ${baseUrl}/${listingId}/`);
      
      await httpClient.get(`${baseUrl}/${listingId}/`);
      console.log(`✓ ${listingType} ${listingId} exists`);
    } catch (error: any) {
      console.error(`✗ ${isService ? 'Service' : 'Product'} ${listingId} verification failed:`, error);
      if (error.response?.status === 404) {
        throw new Error(`${isService ? 'Service' : 'Product'} with ID ${listingId} does not exist`);
      }
      
      this.handleApiError(error, `Verifying ${isService ? 'service' : 'product'} existence`);
    }
  }

  async getProductRatings(productId: number): Promise<ProductRating[]> {
    try {
      console.log(`=== FETCHING PRODUCT RATINGS ===`);
      console.log(`Product ID: ${productId}`);
      
      await this.verifyListingExists(productId, false);
      
      const response = await httpClient.get<ProductRating[]>(
        `${this.productsBaseUrl}/${productId}/ratings/`
      );
      
      const ratings = Array.isArray(response) ? response : [];
      console.log(`✓ Successfully fetched ${ratings.length} product ratings`);
      return ratings;
    } catch (error) {
      console.error('Error fetching product ratings:', error);
      return [];
    }
  }

  async createProductRating(
    productId: number, 
    ratingData: CreateProductRatingRequest
  ): Promise<ProductRating> {
    try {
      console.log('=== CREATING PRODUCT RATING ===');
      console.log('Product ID:', productId);
      console.log('Original rating data:', ratingData);
      
      await this.verifyListingExists(productId, false);
      
      const sanitizedData = this.sanitizeProductRating(ratingData);
      this.validateProductRating(sanitizedData);

      console.log('About to send HTTP request with:', sanitizedData);

      const response = await httpClient.post<ProductRating>(
        `${this.productsBaseUrl}/${productId}/ratings/`,
        sanitizedData
      );
      
      console.log('✓ Successfully created product rating:', response);
      return response;
    } catch (error) {
      this.handleApiError(error, `Creating rating for product ${productId}`);
    }
  }

  async getProductRating(productId: number, ratingId: number): Promise<ProductRating> {
    try {
      const response = await httpClient.get<ProductRating>(
        `${this.productsBaseUrl}/${productId}/ratings/${ratingId}/`
      );
      return response;
    } catch (error) {
      this.handleApiError(error, `Fetching product rating ${ratingId}`);
    }
  }

  async updateProductRating(
    productId: number, 
    ratingId: number, 
    ratingData: UpdateProductRatingRequest
  ): Promise<ProductRating> {
    try {
      const sanitizedData = this.sanitizeProductRating(ratingData);
      this.validateProductRating(sanitizedData);

      const response = await httpClient.put<ProductRating>(
        `${this.productsBaseUrl}/${productId}/ratings/${ratingId}/`,
        sanitizedData
      );
      return response;
    } catch (error) {
      this.handleApiError(error, `Updating product rating ${ratingId}`);
    }
  }

  async deleteProductRating(productId: number, ratingId: number): Promise<void> {
    try {
      await httpClient.delete(`${this.productsBaseUrl}/${productId}/ratings/${ratingId}/`);
    } catch (error) {
      this.handleApiError(error, `Deleting product rating ${ratingId}`);
    }
  }

  async getServiceRatings(serviceId: number): Promise<ServiceRating[]> {
    try {
      console.log(`=== FETCHING SERVICE RATINGS ===`);
      console.log(`Service ID: ${serviceId}`);
      
      await this.verifyListingExists(serviceId, true);
      
      const response = await httpClient.get<ServiceRating[]>(
        `${this.servicesBaseUrl}/${serviceId}/ratings/`
      );
      
      const ratings = Array.isArray(response) ? response : [];
      console.log(`✓ Successfully fetched ${ratings.length} service ratings`);
      return ratings;
    } catch (error) {
      console.error('Error fetching service ratings:', error);
      return [];
    }
  }

  async createServiceRating(
    serviceId: number, 
    ratingData: CreateServiceRatingRequest
  ): Promise<ServiceRating> {
    try {
      console.log('=== CREATING SERVICE RATING ===');
      console.log('Service ID:', serviceId);
      console.log('Original rating data:', ratingData);
      
      await this.verifyListingExists(serviceId, true);
      
      const sanitizedData = this.sanitizeServiceRating(ratingData);
      this.validateServiceRating(sanitizedData);

      console.log('About to send HTTP request with:', sanitizedData);

      const response = await httpClient.post<ServiceRating>(
        `${this.servicesBaseUrl}/${serviceId}/ratings/`,
        sanitizedData
      );
      
      console.log('✓ Successfully created service rating:', response);
      return response;
    } catch (error) {
      this.handleApiError(error, `Creating rating for service ${serviceId}`);
    }
  }

  async getServiceRating(serviceId: number, ratingId: number): Promise<ServiceRating> {
    try {
      const response = await httpClient.get<ServiceRating>(
        `${this.servicesBaseUrl}/${serviceId}/ratings/${ratingId}/`
      );
      return response;
    } catch (error) {
      this.handleApiError(error, `Fetching service rating ${ratingId}`);
    }
  }

  async updateServiceRating(
    serviceId: number, 
    ratingId: number, 
    ratingData: UpdateServiceRatingRequest
  ): Promise<ServiceRating> {
    try {
      const sanitizedData = this.sanitizeServiceRating(ratingData);
      this.validateServiceRating(sanitizedData);

      const response = await httpClient.put<ServiceRating>(
        `${this.servicesBaseUrl}/${serviceId}/ratings/${ratingId}/`,
        sanitizedData
      );
      return response;
    } catch (error) {
      this.handleApiError(error, `Updating service rating ${ratingId}`);
    }
  }

  async deleteServiceRating(serviceId: number, ratingId: number): Promise<void> {
    try {
      await httpClient.delete(`${this.servicesBaseUrl}/${serviceId}/ratings/${ratingId}/`);
    } catch (error) {
      this.handleApiError(error, `Deleting service rating ${ratingId}`);
    }
  }

  // ==================== UNIFIED UTILITY METHODS ====================

  async getListingRatings(listingId: number, isService: boolean): Promise<(ProductRating | ServiceRating)[]> {
    console.log(`=== GET LISTING RATINGS (ID-based) ===`);
    console.log(`Listing ID: ${listingId}`);
    console.log(`Is Service: ${isService}`);
    
    if (isService) {
      return this.getServiceRatings(listingId);
    } else {
      return this.getProductRatings(listingId);
    }
  }

  async createListingRating(
    listingId: number, 
    isService: boolean, 
    ratingData: CreateProductRatingRequest | CreateServiceRatingRequest
  ): Promise<ProductRating | ServiceRating> {
    console.log(`=== CREATE LISTING RATING (ID-based) ===`);
    console.log(`Listing ID: ${listingId}`);
    console.log(`Is Service: ${isService}`);
    console.log('Rating Data:', ratingData);
    
    if (isService) {
      return this.createServiceRating(listingId, ratingData as CreateServiceRatingRequest);
    } else {
      return this.createProductRating(listingId, ratingData as CreateProductRatingRequest);
    }
  }

  async updateListingRating(
    listingId: number, 
    ratingId: number, 
    isService: boolean, 
    ratingData: UpdateProductRatingRequest | UpdateServiceRatingRequest
  ): Promise<ProductRating | ServiceRating> {
    if (isService) {
      return this.updateServiceRating(listingId, ratingId, ratingData as UpdateServiceRatingRequest);
    } else {
      return this.updateProductRating(listingId, ratingId, ratingData as UpdateProductRatingRequest);
    }
  }

  async deleteListingRating(listingId: number, ratingId: number, isService: boolean): Promise<void> {
    if (isService) {
      return this.deleteServiceRating(listingId, ratingId);
    } else {
      return this.deleteProductRating(listingId, ratingId);
    }
  }

  // ==================== DATA SANITIZATION HELPERS ====================

  private sanitizeProductRating(ratingData: CreateProductRatingRequest | UpdateProductRatingRequest): CreateProductRatingRequest | UpdateProductRatingRequest {
    const sanitized = { ...ratingData };
    
    // Convert rating to decimal (allows .5 increments)
    sanitized.rating = Number(Number(ratingData.rating).toFixed(1));
    
    // Ensure boolean fields are actually booleans
    sanitized.would_recommend = Boolean(ratingData.would_recommend);
    
    console.log('Sanitized product rating:', sanitized);
    console.log('Sanitized rating type:', typeof sanitized.rating);
    console.log('Sanitized rating value:', sanitized.rating);
    
    return sanitized;
  }

  private sanitizeServiceRating(ratingData: CreateServiceRatingRequest | UpdateServiceRatingRequest): CreateServiceRatingRequest | UpdateServiceRatingRequest {
    const sanitized = { ...ratingData };
    
    // Convert all rating fields to decimals (allows .5 increments)
    sanitized.rating = Number(Number(ratingData.rating).toFixed(1));
    sanitized.communication_rating = Number(Number(ratingData.communication_rating).toFixed(1));
    sanitized.quality_rating = Number(Number(ratingData.quality_rating).toFixed(1));
    sanitized.timeliness_rating = Number(Number(ratingData.timeliness_rating).toFixed(1));
    
    // Ensure boolean fields are actually booleans
    sanitized.would_recommend = Boolean(ratingData.would_recommend);
    sanitized.would_hire_again = Boolean(ratingData.would_hire_again);
    
    console.log('Sanitized service rating:', sanitized);
    console.log('Sanitized rating types:', {
      rating: typeof sanitized.rating,
      communication_rating: typeof sanitized.communication_rating,
      quality_rating: typeof sanitized.quality_rating,
      timeliness_rating: typeof sanitized.timeliness_rating
    });
    console.log('Sanitized rating values:', {
      rating: sanitized.rating,
      communication_rating: sanitized.communication_rating,
      quality_rating: sanitized.quality_rating,
      timeliness_rating: sanitized.timeliness_rating
    });
    
    return sanitized;
  }

  // ==================== CALCULATION METHODS ====================

  calculateAverageRating(ratings: (ProductRating | ServiceRating)[]): number {
    // FIXED: Handle non-array input safely
    const safeRatings = Array.isArray(ratings) ? ratings : [];
    if (safeRatings.length === 0) return 0;
    
    const total = safeRatings.reduce((sum, rating) => sum + rating.rating, 0);
    return Math.round((total / safeRatings.length) * 10) / 10;
  }

  getRatingDistribution(ratings: (ProductRating | ServiceRating)[]): Record<number, number> {
    // FIXED: Handle non-array input safely
    const safeRatings = Array.isArray(ratings) ? ratings : [];
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    safeRatings.forEach(rating => {
      // Round to nearest integer for distribution grouping
      const starRating = Math.round(rating.rating);
      if (starRating >= 1 && starRating <= 5) {
        distribution[starRating]++;
      }
    });
    
    return distribution;
  }

  filterRatingsByMinimum(
    ratings: (ProductRating | ServiceRating)[], 
    minRating: number
  ): (ProductRating | ServiceRating)[] {
    // FIXED: Handle non-array input safely
    const safeRatings = Array.isArray(ratings) ? ratings : [];
    return safeRatings.filter(rating => rating.rating >= minRating);
  }

  sortRatings(
    ratings: (ProductRating | ServiceRating)[],
    sortBy: 'rating' | 'date' | 'helpful',
    order: 'asc' | 'desc' = 'desc'
  ): (ProductRating | ServiceRating)[] {
    // FIXED: Handle non-array input safely
    const safeRatings = Array.isArray(ratings) ? ratings : [];
    const sorted = [...safeRatings].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'helpful':
          comparison = a.helpful_count - b.helpful_count;
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }

  // ==================== VALIDATION METHODS ====================

  private validateProductRating(ratingData: CreateProductRatingRequest | UpdateProductRatingRequest): void {
    const errors: ReviewError[] = [];

    // Validate rating (supports decimals like 4.5)
    if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5 || 
        typeof ratingData.rating !== 'number' || isNaN(ratingData.rating)) {
      errors.push({
        field: 'rating',
        message: 'Rating must be a number between 1 and 5 (e.g., 4.5)',
        code: 'INVALID_RATING'
      });
    }

    // Check if rating is in valid increments (0.5 steps)
    if (ratingData.rating && (ratingData.rating * 2) % 1 !== 0) {
      errors.push({
        field: 'rating',
        message: 'Rating must be in 0.5 increments (e.g., 3.5, 4.0, 4.5)',
        code: 'INVALID_RATING_INCREMENT'
      });
    }

    // Validate review content
    if (!ratingData.review || ratingData.review.trim().length === 0) {
      errors.push({
        field: 'review',
        message: 'Review content is required',
        code: 'MISSING_REVIEW'
      });
    } else if (ratingData.review.trim().length < 10) {
      errors.push({
        field: 'review',
        message: 'Review must be at least 10 characters long',
        code: 'REVIEW_TOO_SHORT'
      });
    } else if (ratingData.review.trim().length > 1000) {
      errors.push({
        field: 'review',
        message: 'Review cannot exceed 1000 characters',
        code: 'REVIEW_TOO_LONG'
      });
    }

    // Validate would_recommend
    if (typeof ratingData.would_recommend !== 'boolean') {
      errors.push({
        field: 'would_recommend',
        message: 'Would recommend field is required',
        code: 'MISSING_RECOMMENDATION'
      });
    }

    // Validate optional fields
    if (ratingData.review_title && ratingData.review_title.trim().length > 100) {
      errors.push({
        field: 'review_title',
        message: 'Review title cannot exceed 100 characters',
        code: 'TITLE_TOO_LONG'
      });
    }

    if (ratingData.pros && ratingData.pros.trim().length > 500) {
      errors.push({
        field: 'pros',
        message: 'Pros section cannot exceed 500 characters',
        code: 'PROS_TOO_LONG'
      });
    }

    if (ratingData.cons && ratingData.cons.trim().length > 500) {
      errors.push({
        field: 'cons',
        message: 'Cons section cannot exceed 500 characters',
        code: 'CONS_TOO_LONG'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  private validateServiceRating(ratingData: CreateServiceRatingRequest | UpdateServiceRatingRequest): void {
    const errors: ReviewError[] = [];

    // Helper function to validate individual rating fields
    const validateRatingField = (value: number, fieldName: string) => {
      if (!value || value < 1 || value > 5 || typeof value !== 'number' || isNaN(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName.replace('_', ' ')} must be a number between 1 and 5`,
          code: 'INVALID_RATING'
        });
      } else if ((value * 2) % 1 !== 0) {
        errors.push({
          field: fieldName,
          message: `${fieldName.replace('_', ' ')} must be in 0.5 increments (e.g., 3.5, 4.0, 4.5)`,
          code: 'INVALID_RATING_INCREMENT'
        });
      }
    };

    // Validate main rating
    validateRatingField(ratingData.rating, 'rating');

    // Validate sub-ratings
    validateRatingField(ratingData.communication_rating, 'communication_rating');
    validateRatingField(ratingData.quality_rating, 'quality_rating');
    validateRatingField(ratingData.timeliness_rating, 'timeliness_rating');

    // Validate review content
    if (!ratingData.review || ratingData.review.trim().length === 0) {
      errors.push({
        field: 'review',
        message: 'Review content is required',
        code: 'MISSING_REVIEW'
      });
    } else if (ratingData.review.trim().length < 10) {
      errors.push({
        field: 'review',
        message: 'Review must be at least 10 characters long',
        code: 'REVIEW_TOO_SHORT'
      });
    } else if (ratingData.review.trim().length > 1000) {
      errors.push({
        field: 'review',
        message: 'Review cannot exceed 1000 characters',
        code: 'REVIEW_TOO_LONG'
      });
    }

    // Validate boolean fields
    if (typeof ratingData.would_recommend !== 'boolean') {
      errors.push({
        field: 'would_recommend',
        message: 'Would recommend field is required',
        code: 'MISSING_RECOMMENDATION'
      });
    }

    if (typeof ratingData.would_hire_again !== 'boolean') {
      errors.push({
        field: 'would_hire_again',
        message: 'Would hire again field is required',
        code: 'MISSING_HIRE_AGAIN'
      });
    }

    // Validate optional fields
    if (ratingData.review_title && ratingData.review_title.trim().length > 100) {
      errors.push({
        field: 'review_title',
        message: 'Review title cannot exceed 100 characters',
        code: 'TITLE_TOO_LONG'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }
}

// Export singleton instance
export const reviewsService = new ReviewsService();