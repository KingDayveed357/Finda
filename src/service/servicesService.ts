// services/serviceService.ts
import { httpClient } from '../utils/http-client';

export interface ServiceUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface ServiceRating {
  id: number;
  user: number;
  user_details: ServiceUser;
  user_name: string;
  rating: number;
  review: string;
  created_at: string;
}

export interface CountryDetails {
  id: number;
  name: string;
  code: string;
  phone_code: string;
  currency_code: string;
  currency_symbol: string;
  flag_emoji: string;
  continent: string;
  display_name: string;
}

export interface StateDetails {
  id: number;
  name: string;
  code: string;
  type: string;
  country: number;
  country_name: string;
  display_name: string;
}

export interface CityDetails {
  id: number;
  name: string;
  state: number;
  country: number;
  state_name: string;
  country_name: string;
  latitude: number;
  longitude: number;
  population: number;
  is_capital: boolean;
  is_major_city: boolean;
  full_address: string;
}

export interface CategoryDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_type: string;
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
  user_details: ServiceUser;
  country_details: CountryDetails;
  state_details: StateDetails;
  city_details: CityDetails;
  category_details: CategoryDetails;
  service_ratings?: ServiceRating[];
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface CreateServiceData {
  service_name: string;
  service_description: string;
  featured_image_url?: File;
  gallery_images?: File[];
  country: number;
  state: number;
  city: number;
  serves_remote?: boolean;
  service_radius?: number;
  category: number;
  tags?: string;
  provider_name: string;
  provider_title?: string;
  provider_bio?: string;
  provider_expertise?: string;
  provider_experience?: string;
  provider_certifications?: string;
  provider_languages?: string;
  provider_email: string;
  provider_phone?: string;
  provider_whatsapp?: string;
  provider_website?: string;
  provider_linkedin?: string;
  starting_price?: number;
  max_price?: number;
  price_type?: string;
  response_time?: string;
  availability?: string;
  is_promoted?: boolean;
  meta_title?: string;
  meta_description?: string;
  service_status?:string
}

export interface ServiceFilters {
  service_category?: string;
  service_country?: string;
  service_state?: string;
  service_city?: string;
  service_status?: string;
  is_promoted?: boolean;
  is_featured?: boolean;
  user?: number;
  search?: string;
  ordering?: string;
  my_services?: boolean;
  page?: number;
  page_size?: number;
  serves_remote?:boolean;
  is_verified?:boolean
  min_price?:number
  max_price?:number
}

class ServiceService {
  private readonly baseUrl = '/api/main/services';

  /**
   * Create a new service
   */
  async createService(serviceData: CreateServiceData): Promise<Service> {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('service_name', serviceData.service_name);
      formData.append('service_description', serviceData.service_description);
      formData.append('country', serviceData.country.toString());
      formData.append('state', serviceData.state.toString());
      formData.append('city', serviceData.city.toString());
      formData.append('category', serviceData.category.toString());
      formData.append('provider_name', serviceData.provider_name);
      formData.append('provider_email', serviceData.provider_email);
      
      // Add optional fields
      if (serviceData.featured_image_url) {
        formData.append('featured_image', serviceData.featured_image_url);
      }
      
      // Handle gallery images as separate form fields, not JSON
      if (serviceData.gallery_images && serviceData.gallery_images.length > 0) {
        serviceData.gallery_images.forEach((image) => {
          formData.append('gallery_images', image);
        });
      }
      
      if (serviceData.serves_remote !== undefined) {
        formData.append('serves_remote', serviceData.serves_remote.toString());
      }
      
      if (serviceData.service_radius !== undefined) {
        formData.append('service_radius', serviceData.service_radius.toString());
      }
      
      if (serviceData.tags) {
        formData.append('tags', serviceData.tags);
      }
      
      if (serviceData.provider_title) {
        formData.append('provider_title', serviceData.provider_title);
      }
      
      if (serviceData.provider_bio) {
        formData.append('provider_bio', serviceData.provider_bio);
      }
      
      if (serviceData.provider_expertise) {
        formData.append('provider_expertise', serviceData.provider_expertise);
      }
      
      if (serviceData.provider_experience) {
        formData.append('provider_experience', serviceData.provider_experience);
      }
      
      if (serviceData.provider_certifications) {
        formData.append('provider_certifications', serviceData.provider_certifications);
      }
      
      if (serviceData.provider_languages) {
        formData.append('provider_languages', serviceData.provider_languages);
      }
      
      if (serviceData.provider_phone) {
        formData.append('provider_phone', serviceData.provider_phone);
      }
      
      if (serviceData.provider_whatsapp) {
        formData.append('provider_whatsapp', serviceData.provider_whatsapp);
      }
      
      if (serviceData.provider_website) {
        formData.append('provider_website', serviceData.provider_website);
      }
      
      if (serviceData.provider_linkedin) {
        formData.append('provider_linkedin', serviceData.provider_linkedin);
      }
      
      if (serviceData.starting_price !== undefined) {
        formData.append('starting_price', serviceData.starting_price.toString());
      }
      
      if (serviceData.max_price !== undefined) {
        formData.append('max_price', serviceData.max_price.toString());
      }
      
      if (serviceData.price_type) {
        formData.append('price_type', serviceData.price_type);
      }
      
      if (serviceData.response_time) {
        formData.append('response_time', serviceData.response_time);
      }
      
      if (serviceData.availability) {
        formData.append('availability', serviceData.availability);
      }
      
      if (serviceData.is_promoted !== undefined) {
        formData.append('is_promoted', serviceData.is_promoted.toString());
      }
      
      if (serviceData.meta_title) {
        formData.append('meta_title', serviceData.meta_title);
      }
      
      if (serviceData.meta_description) {
        formData.append('meta_description', serviceData.meta_description);
      }

      const response = await httpClient.post<Service>(`${this.baseUrl}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  /**
   * Get all services with optional filters (returns paginated response)
   */
  async getServices(filters?: ServiceFilters, retries: number = 2): Promise<PaginatedResponse<Service>> {
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
      const response = await httpClient.get<PaginatedResponse<Service>>(url, {
        timeout: 15000, // 15 second timeout
      });
      
      return response;
    } catch (error: any) {
      console.error('Error fetching services:', error);
      
      // Retry logic for timeout errors
      if (retries > 0 && (error.code === 'ECONNABORTED' || error.message?.includes('timeout'))) {
        console.log(`Retrying request... ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.getServices(filters, retries - 1);
      }
      
      throw new Error('Failed to fetch services');
    }
  }

  /**
   * Get all services as array (convenience method)
   */
  async getServicesArray(filters?: ServiceFilters): Promise<Service[]> {
    const response = await this.getServices(filters);
    return response.results;
  }

  /**
   * Get a single service by ID
   */
  async getService(id: number): Promise<Service> {
    try {
      const response = await httpClient.get<Service>(`${this.baseUrl}/${id}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw new Error('Failed to fetch service');
    }
  }

   /**
   * Get a single service by 
   * 
   * 
   */
  async getServiceBySlug(slug: string): Promise<Service> {
    try {
      const response = await httpClient.get<Service>(`${this.baseUrl}/${slug}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching service ${slug}:`, error);
      throw new Error('Failed to fetch service');
    }
  }

  /**
   * Search services by query
   */
  async searchServices(query: string, filters?: Omit<ServiceFilters, 'search'>): Promise<Service[]> {
    const searchFilters: ServiceFilters = {
      ...filters,
      search: query
    };
    
    return this.getServicesArray(searchFilters);
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string, filters?: Omit<ServiceFilters, 'service_category'>): Promise<Service[]> {
    const categoryFilters: ServiceFilters = {
      ...filters,
      service_category: category
    };
    
    return this.getServicesArray(categoryFilters);
  }

  /**
   * Get promoted services
   */
  async getPromotedServices(filters?: Omit<ServiceFilters, 'is_promoted'>): Promise<Service[]> {
    const promotedFilters: ServiceFilters = {
      ...filters,
      is_promoted: true
    };
    
    return this.getServicesArray(promotedFilters);
  }

  /**
   * Get featured services
   */
  async getFeaturedServices(filters?: Omit<ServiceFilters, 'is_featured'>, retries: number = 2): Promise<Service[]> {
    try {
      const featuredFilters: ServiceFilters = {
        ...filters,
        is_featured: true
      };
      
      const response = await this.getServices(featuredFilters, retries);
      return response.results;
    } catch (error) {
      console.error('Error fetching featured services:', error);
      // Return empty array instead of throwing to prevent component crashes
      return [];
    }
  }

  /**
   * Get services by location
   */
  async getServicesByLocation(
    country?: string,
    state?: string,
    city?: string,
    filters?: Omit<ServiceFilters, 'service_country' | 'service_state' | 'service_city'>
  ): Promise<Service[]> {
    const locationFilters: ServiceFilters = {
      ...filters,
      ...(country && { service_country: country }),
      ...(state && { service_state: state }),
      ...(city && { service_city: city })
    };
    
    return this.getServicesArray(locationFilters);
  }

  /**
   * Get user's services
   */
  async getUserServices(userId: number): Promise<Service[]> {
    const userFilters: ServiceFilters = {
      user: userId
    };
    
    return this.getServicesArray(userFilters);
  }

  /**
   * Get my services (requires authentication)
   */
  async getMyServices(): Promise<Service[]> {
    const myServicesFilters: ServiceFilters = {
      my_services: true
    };
    
    return this.getServicesArray(myServicesFilters);
  }

  /**
 * Update a service
 */
async updateService(id: number, serviceData: Partial<CreateServiceData>): Promise<Service> {
  try {
    const formData = new FormData();
    
    // Add fields that are being updated
    Object.entries(serviceData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'gallery_images' && Array.isArray(value)) {
          value.forEach((image: File) => {
            formData.append('gallery_images', image);
          });
        } else if (key === 'featured_image_url' && value instanceof File) {
          formData.append('featured_image', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await httpClient.put<Service>(`${this.baseUrl}/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw new Error('Failed to update service');
  }
}

/**
 * Delete a service
 */
async deleteService(id: number): Promise<void> {
  try {
    await httpClient.delete(`${this.baseUrl}/${id}/`);
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw new Error('Failed to delete service');
  }
}
}

export const serviceService = new ServiceService();