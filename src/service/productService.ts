// services/productService.ts
import { httpClient } from '../utils/http-client';

export interface ProductUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ProductRating {
  id: number;
  user: number;
  user_details: ProductUser;
  user_name: string;
  rating: number;
  review: string;
  created_at: string;
}

export interface Product {
  id: number;
  slug: string;
  user: number;
  gallery_images: string[];
  tags: string;
  user_details: ProductUser;
  product_name: string;
  product_image: string;
  product_description: string;
  product_price: number;
  product_category: string;
  product_country: string;
  product_state: string;
  product_city: string;
  product_brand: string;
  product_provider_phone: string;
  product_status: string;
  is_paid: boolean;
  is_promoted: boolean;
  promotion_fee: number;
  average_rating: number;
  rating_count: number;
  views_count?: number;
  favorites_count?: number;
  created_at?: string;
  product_ratings: ProductRating[];
  category_choices: string[];
  country_choices: string[];
  state_choices: string[];
  city_choices: string[];
  status_choices: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface CreateProductData {
  product_name: string;
  product_description: string;
  featured_image?: File;
  gallery_images?: File[];
  product_price: number;
  original_price?: number;
  is_negotiable?: boolean;
  country: number;
  state: number;
  city: number;
  address_details?: string;
  category: number;
  tags?: string;
  product_brand?: string;
  product_model?: string;
  product_condition?: string;
  provider_phone?: string;
  provider_email?: string;
  provider_whatsapp?: string;
  is_promoted?: boolean;
  meta_title?: string;
  meta_description?: string;
}

export interface ProductFilters {
  product_category?: string;
  product_country?: string;
  product_state?: string;
  product_city?: string;
  product_status?: string;
  is_promoted?: boolean;
  user?: number;
  search?: string;
  ordering?: string;
  my_products?: boolean;
  page?: number;
  page_size?: number;
}

class ProductService {
  private readonly baseUrl = '/api/main/products';

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('product_name', productData.product_name);
      formData.append('product_description', productData.product_description);
      formData.append('product_price', productData.product_price.toString());
      formData.append('country', productData.country.toString());
      formData.append('state', productData.state.toString());
      formData.append('city', productData.city.toString());
      formData.append('category', productData.category.toString());
      
      // Add optional fields
      if (productData.featured_image) {
        formData.append('featured_image', productData.featured_image);
      }
      
      // Handle gallery images as separate form fields, not JSON
      if (productData.gallery_images && productData.gallery_images.length > 0) {
        productData.gallery_images.forEach((image) => {
          formData.append('gallery_images', image);
        });
      }
      
      if (productData.original_price !== undefined) {
        formData.append('original_price', productData.original_price.toString());
      }
      
      if (productData.is_negotiable !== undefined) {
        formData.append('is_negotiable', productData.is_negotiable.toString());
      }
      
      if (productData.address_details) {
        formData.append('address_details', productData.address_details);
      }
      
      if (productData.tags) {
        formData.append('tags', productData.tags);
      }
      
      if (productData.product_brand) {
        formData.append('product_brand', productData.product_brand);
      }
      
      if (productData.product_model) {
        formData.append('product_model', productData.product_model);
      }
      
      if (productData.product_condition) {
        formData.append('product_condition', productData.product_condition);
      }
      
      if (productData.provider_phone) {
        formData.append('provider_phone', productData.provider_phone);
      }
      
      if (productData.provider_email) {
        formData.append('provider_email', productData.provider_email);
      }
      
      if (productData.provider_whatsapp) {
        formData.append('provider_whatsapp', productData.provider_whatsapp);
      }
      
      if (productData.is_promoted !== undefined) {
        formData.append('is_promoted', productData.is_promoted.toString());
      }
      
      if (productData.meta_title) {
        formData.append('meta_title', productData.meta_title);
      }
      
      if (productData.meta_description) {
        formData.append('meta_description', productData.meta_description);
      }

      const response = await httpClient.post<Product>(`${this.baseUrl}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Get all products with optional filters (returns paginated response)
   */
  async getProducts(filters?: ProductFilters, retries: number = 2): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/?${params.toString()}` : `${this.baseUrl}/`;
      const response = await httpClient.get<PaginatedResponse<Product>>(url, {
        timeout: 15000, // 15 second timeout
      });
      
      return response;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      
      // Retry logic for timeout errors
      if (retries > 0 && (error.code === 'ECONNABORTED' || error.message?.includes('timeout'))) {
        console.log(`Retrying request... ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.getProducts(filters, retries - 1);
      }
      
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get all products as array (convenience method)
   */
  async getProductsArray(filters?: ProductFilters): Promise<Product[]> {
    const response = await this.getProducts(filters);
    return response.results;
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    try {
      const response = await httpClient.get<Product>(`${this.baseUrl}/${id}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await httpClient.get<Product>(`${this.baseUrl}/${slug}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${slug}:`, error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, filters?: Omit<ProductFilters, 'search'>): Promise<Product[]> {
    const searchFilters: ProductFilters = {
      ...filters,
      search: query
    };
    
    return this.getProductsArray(searchFilters);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, filters?: Omit<ProductFilters, 'product_category'>): Promise<Product[]> {
    const categoryFilters: ProductFilters = {
      ...filters,
      product_category: category
    };
    
    return this.getProductsArray(categoryFilters);
  }

  /**
   * Get promoted products
   */
  async getPromotedProducts(filters?: Omit<ProductFilters, 'is_promoted'>): Promise<Product[]> {
    const promotedFilters: ProductFilters = {
      ...filters,
      is_promoted: true
    };
    
    return this.getProductsArray(promotedFilters);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(filters?: ProductFilters, retries: number = 2): Promise<Product[]> {
    try {
      const response = await this.getProducts(filters, retries);
      return response.results;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Return empty array instead of throwing to prevent component crashes
      return [];
    }
  }

  /**
   * Get products by location
   */
  async getProductsByLocation(
    country?: string,
    state?: string,
    city?: string,
    filters?: Omit<ProductFilters, 'product_country' | 'product_state' | 'product_city'>
  ): Promise<Product[]> {
    const locationFilters: ProductFilters = {
      ...filters,
      ...(country && { product_country: country }),
      ...(state && { product_state: state }),
      ...(city && { product_city: city })
    };
    
    return this.getProductsArray(locationFilters);
  }

  /**
   * Get user's products
   */
  async getUserProducts(userId: number): Promise<Product[]> {
    const userFilters: ProductFilters = {
      user: userId
    };
    
    return this.getProductsArray(userFilters);
  }

  /**
   * Get my products (requires authentication)
   */
  async getMyProducts(): Promise<Product[]> {
    const myProductsFilters: ProductFilters = {
      my_products: true
    };
    
    return this.getProductsArray(myProductsFilters);
  }
}

export const productService = new ProductService();