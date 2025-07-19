export interface PriceRange {
  min?: number;
  max?: number;
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  error?: string;
  suggestions?: string[];
  recommendations?: string[];
  externalProducts?: ExternalProduct[];
  followUpQuestions?: string[];
  actionButtons?: ActionButton[]; // Added missing property
}

export interface ActionButton {
  text: string;
  action: string;
  url?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | PriceRange;
  rating: number;
  category: string;
  images: string[];
  tags: string[];
  link?: string;
}

export interface ExternalProduct {
  id: string;
  title: string;
  price: number | PriceRange;
  rating: number;
  platform: keyof typeof externalPlatforms;
  image: string;
  estimatedDelivery?: string;
}

export interface ExternalPlatform {
  name: string;
  logo: string;
}

export interface ProductComparison {
  localAdvantages: string[];
  externalAdvantages: string[];
}




export const externalPlatforms: Record<string, ExternalPlatform> = {
  jumia: { name: 'Jumia', logo: '🛒' },
  amazon: { name: 'Amazon', logo: '📦' },
  aliexpress: { name: 'AliExpress', logo: '🏪' }
};