
export interface ExternalProduct {
  id: string;
  title: string;
  price: number | { min: number; max: number };
  platform: 'jumia' | 'aliexpress' | 'amazon' | 'ebay';
  url: string;
  image: string;
  rating: number;
  reviews: number;
  shipping?: string;
  estimatedDelivery?: string;
}

export interface ExternalPlatform {
  name: string;
  baseUrl: string;
  logo: string;
  searchEndpoint: string;
}

export const externalPlatforms: Record<string, ExternalPlatform> = {
  jumia: {
    name: 'Jumia',
    baseUrl: 'https://jumia.com',
    logo: '🛒',
    searchEndpoint: '/search'
  },
  aliexpress: {
    name: 'AliExpress',
    baseUrl: 'https://aliexpress.com',
    logo: '🏪',
    searchEndpoint: '/wholesale'
  },
  amazon: {
    name: 'Amazon',
    baseUrl: 'https://amazon.com',
    logo: '📦',
    searchEndpoint: '/s'
  },
  ebay: {
    name: 'eBay',
    baseUrl: 'https://ebay.com',
    logo: '🏷️',
    searchEndpoint: '/sch'
  }
};

// Mock external product data for demonstration
export const mockExternalProducts: ExternalProduct[] = [
  {
    id: 'jumia-1',
    title: 'Wireless Bluetooth Headphones - Premium Quality',
    price: 89,
    platform: 'jumia',
    url: 'https://jumia.com/product/wireless-headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    rating: 4.3,
    reviews: 245,
    shipping: 'Free shipping',
    estimatedDelivery: '3-5 days'
  },
  {
    id: 'ali-1',
    title: 'Smart Watch with Health Monitoring',
    price: { min: 45, max: 120 },
    platform: 'aliexpress',
    url: 'https://aliexpress.com/item/smart-watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    rating: 4.1,
    reviews: 1230,
    shipping: 'Free shipping',
    estimatedDelivery: '7-15 days'
  },
  {
    id: 'amazon-1',
    title: 'Ergonomic Office Chair with Lumbar Support',
    price: 299,
    platform: 'amazon',
    url: 'https://amazon.com/ergonomic-office-chair',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    rating: 4.6,
    reviews: 890,
    shipping: 'Prime delivery',
    estimatedDelivery: '1-2 days'
  }
];

export const searchExternalProducts = async (query: string, category?: string): Promise<ExternalProduct[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const lowerQuery = query.toLowerCase();
  let results = mockExternalProducts.filter(product => 
    product.title.toLowerCase().includes(lowerQuery) ||
    (category && product.title.toLowerCase().includes(category.toLowerCase()))
  );

  // If no direct matches, return some relevant products based on common categories
  if (results.length === 0) {
    if (lowerQuery.includes('electronic') || lowerQuery.includes('tech') || lowerQuery.includes('gadget')) {
      results = mockExternalProducts.filter(p => p.platform === 'aliexpress' || p.id.includes('headphones'));
    } else if (lowerQuery.includes('furniture') || lowerQuery.includes('office') || lowerQuery.includes('chair')) {
      results = mockExternalProducts.filter(p => p.id.includes('chair'));
    } else {
      results = mockExternalProducts.slice(0, 2); // Return some random products
    }
  }

  return results;
};

export const generateProductComparison = (localProducts: any[], externalProducts: ExternalProduct[]) => {
  const comparison = {
    localAdvantages: [
      'Faster delivery from local vendors',
      'Easy returns and customer support',
      'Support local businesses',
      'No international shipping fees'
    ],
    externalAdvantages: [
      'Often lower prices',
      'Wider product selection',
      'International brands',
      'Bulk purchase options'
    ],
    recommendations: [] as string[]
  };

  if (localProducts.length > 0 && externalProducts.length > 0) {
    comparison.recommendations.push(
      'Compare prices between local and external options',
      'Consider delivery time vs cost savings',
      'Check product reviews and seller ratings'
    );
  }

  return comparison;
};
