// types/index.ts
export interface PriceRange {
  min?: number;
  max?: number;
}

export interface ActionButton {
  text: string;
  action: string;
  url?: string;
}

// Main product interface (renamed from Listing for consistency)
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  images: string[];
  tags: string[];
  link?: string;
}

// Keep Listing as alias for backward compatibility
export type Listing = Product;

export interface ExternalProduct {
  id: string;
  title: string;
  price: number;
  rating: number;
  platform: keyof typeof externalPlatforms;
  image: string;
  estimatedDelivery?: string;
}

export interface ExternalPlatform {
  name: string;
  logo: string;
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  error?: string;
  suggestions?: string[];
  recommendations?: Product[];
  externalProducts?: ExternalProduct[];
  followUpQuestions?: string[];
  actionButtons?: ActionButton[];
}

export interface ProductComparison {
  localAdvantages: string[];
  externalAdvantages: string[];
}

// External platforms configuration
export const externalPlatforms: Record<string, ExternalPlatform> = {
  jumia: { name: 'Jumia', logo: '🛒' },
  amazon: { name: 'Amazon', logo: '📦' },
  aliexpress: { name: 'AliExpress', logo: '🏪' }
};

// Additional commonly used types
export interface SearchFilters {
  category?: string;
  priceRange?: PriceRange;
  rating?: number;
  platform?: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Chat-related types
export interface ChatbotResponse {
  reply: string;
  products?: Product[];
  externalProducts?: ExternalProduct[];
  suggestions?: string[];
}

// User preference types
export interface UserPreferences {
  favoriteCategories?: string[];
  priceRange?: PriceRange;
  preferredPlatforms?: string[];
  deliveryPreference?: 'fast' | 'standard' | 'cheapest';
}