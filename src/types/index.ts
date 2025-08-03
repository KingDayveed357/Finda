export interface Product {
  id: string;
  title: string;
  description: string;
  price: number | { min: number; max: number };
  rating: number;
  category: string;
  images: string[];
  tags: string[];
  link?: string;
  location?: string;
  isService?: boolean;
  isPromoted?: boolean;
  providerName?: string;
  providerPhone?: string;
  ratingCount?: number;
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

// Represents an action button in a message (e.g., for UI interactions)
export interface ActionButton {
  label: string ;
  action: string;
  payload?: any;
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
export interface PriceRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  category?: string;
  priceRange?: PriceRange;
  rating?: number;
  platform?: string;
  tags?: string[];
  location?: string;
  isService?: boolean | null;
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

// User preference types
export interface UserPreferences {
  favoriteCategories?: string[];
  priceRange?: PriceRange;
  preferredPlatforms?: string[];
  deliveryPreference?: 'fast' | 'standard' | 'cheapest';
  locations?: string[];
  ratings?: number;
}

// Filter types for the UI
export interface UIFilters {
  categories: string[];
  locations: string[];
  priceRange: [number, number];
  rating: number;
  isService: boolean | null;
}

// API Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Location types
export interface LocationData {
  countries: string[];
  states: string[];
  cities: string[];
}

// Service provider information
export interface ServiceProvider {
  name: string;
  expertise: string;
  experienceYears: number;
  email: string;
  phone: string;
}

// Extended product/service rating
export interface Rating {
  id: number;
  user: number;
  userName: string;
  rating: number;
  review: string;
  createdAt: string;
}

// User information
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Unified search result type
export interface SearchResult {
  products: Product[];
  services: Product[];
  total: number;
  query: string;
  filters: SearchFilters;
}

// Sort options
export type SortOption = 
  | 'relevance' 
  | 'ai-relevance' 
  | 'price-low' 
  | 'price-high' 
  | 'rating' 
  | 'newest' 
  | 'promoted';

// View mode
export type ViewMode = 'grid' | 'list';

// Loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Search history item
export interface SearchHistoryItem {
  query: string;
  category?: string;
  timestamp: Date;
}

// AI recommendation types
export interface AIRecommendation {
  type: 'product' | 'service' | 'category' | 'search';
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

export interface AISearchSuggestion {
  query: string;
  category?: string;
  confidence: number;
  type: 'trending' | 'personalized' | 'similar';
}