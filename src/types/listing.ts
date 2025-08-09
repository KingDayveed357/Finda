// types/listing.ts
import type { Product } from '@/service/productService';
import type { Service } from '@/service/servicesService';

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
    rating?: number;
  };
}

export interface Review {
  id: number;
  rating: number;
  review: string;
  user_name?: string;
  created_at: string;
  user_details?: {
    first_name?: string;
    last_name?: string;
  };
  helpful_count?: number;
  would_recommend?: boolean;
  review_title?: string;
  // Product-specific
  pros?: string;
  cons?: string;
  is_verified_purchase?: boolean;
  // Service-specific
  communication_rating?: number;
  quality_rating?: number;
  timeliness_rating?: number;
  would_hire_again?: boolean;
  is_verified_customer?: boolean;
}

// Error handling types
export const ErrorType = {
  NETWORK: 'NETWORK',
  NOT_FOUND: 'NOT_FOUND',
  GENERIC: 'GENERIC'
} as const;

export type ErrorTypeValue = typeof ErrorType[keyof typeof ErrorType];

export interface ErrorState {
  type: ErrorTypeValue;
  message: string;
}

export type { Product, Service };