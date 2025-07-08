// Mock AI service for generating descriptions and recommendations
// This can be easily replaced with actual OpenAI integration later

export interface AIResponse {
  description: string;
  recommendations: string[];
  tags: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | { min: number; max: number };
  category: string;
  location: string;
  vendor: {
    id: string;
    name: string;
    rating: number;
    image: string;
  };
  images: string[];
  rating: number;
  isService: boolean;
  tags: string[];
}

const mockDescriptions = [
  "Experience premium quality with this expertly crafted solution designed to meet your specific needs. Our professional approach ensures exceptional results every time.",
  "Innovative technology meets practical application in this cutting-edge offering. Trusted by thousands of satisfied customers worldwide.",
  "Transform your experience with this industry-leading product/service. Backed by years of expertise and commitment to excellence.",
  "Discover the perfect blend of quality, reliability, and value. Our team of experts is dedicated to delivering outstanding results.",
  "Unlock new possibilities with this comprehensive solution. Designed with precision and attention to detail for optimal performance."
];

const mockTags = [
  ["premium", "quality", "reliable"],
  ["innovative", "technology", "modern"],
  ["professional", "expert", "trusted"],
  ["efficient", "fast", "convenient"],
  ["customizable", "flexible", "adaptable"]
];

export const mockAI = {
  generateDescription: async (title: string, category: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const categoryDescriptions: Record<string, string[]> = {
      services: [
        `Professional ${title.toLowerCase()} service with AI-powered optimization and personalized approach.`,
        `Expert ${title.toLowerCase()} solutions using cutting-edge technology and proven methodologies.`,
        `Transform your business with our AI-enhanced ${title.toLowerCase()} services and dedicated support.`
      ],
      electronics: [
        `State-of-the-art ${title.toLowerCase()} featuring smart technology and premium build quality.`,
        `Experience next-generation ${title.toLowerCase()} with AI integration and seamless connectivity.`,
        `Revolutionary ${title.toLowerCase()} designed for modern lifestyles with intelligent features.`
      ],
      fashion: [
        `Stylish ${title.toLowerCase()} crafted with sustainable materials and contemporary design.`,
        `Premium ${title.toLowerCase()} combining comfort, durability, and fashion-forward aesthetics.`,
        `Discover timeless ${title.toLowerCase()} with modern touches and exceptional quality.`
      ]
    };

    const descriptions = categoryDescriptions[category] || mockDescriptions;
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  },

  generateRecommendations: async (userHistory: string[], category?: string): Promise<Listing[]> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    let recommendations = [...mockListings];
    
    // AI-powered filtering based on user history and preferences
    if (userHistory.length > 0) {
      const recentSearch = userHistory[0]?.toLowerCase();
      recommendations = recommendations.filter(listing => 
        listing.title.toLowerCase().includes(recentSearch) ||
        listing.description.toLowerCase().includes(recentSearch) ||
        listing.tags.some(tag => tag.toLowerCase().includes(recentSearch)) ||
        listing.category === category
      );
    }
    
    // If category is specified, prioritize listings from that category
    if (category) {
      recommendations = recommendations.filter(listing => 
        listing.category === category || 
        listing.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
      );
    }
    
    // AI scoring based on multiple factors
    recommendations = recommendations.map(listing => ({
      ...listing,
      aiScore: Math.random() * listing.rating + (listing.category === category ? 2 : 0)
    })).sort((a: any, b: any) => b.aiScore - a.aiScore);
    
    return recommendations.slice(0, 8);
  },

  generateTags: async (title: string, description: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const titleWords = title.toLowerCase().split(' ');
    const descWords = description.toLowerCase().split(' ');
    
    const intelligentTags = [];
    
    // AI-generated contextual tags
    if (titleWords.some(word => ['digital', 'online', 'web', 'app'].includes(word))) {
      intelligentTags.push('digital', 'technology', 'online');
    }
    if (titleWords.some(word => ['professional', 'expert', 'premium'].includes(word))) {
      intelligentTags.push('professional', 'expert', 'premium');
    }
    if (descWords.some(word => ['ai', 'artificial', 'smart', 'intelligent'].includes(word))) {
      intelligentTags.push('ai-powered', 'smart', 'innovative');
    }
    if (descWords.some(word => ['custom', 'personalized', 'tailored'].includes(word))) {
      intelligentTags.push('custom', 'personalized', 'bespoke');
    }
    
    // Fallback to random tags if no intelligent matches
    if (intelligentTags.length === 0) {
      return mockTags[Math.floor(Math.random() * mockTags.length)];
    }
    
    return [...new Set(intelligentTags)].slice(0, 5);
  },

  generateSearchSuggestions: async (query: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const baseSuggestions = [
      `${query} services`,
      `best ${query} providers`,
      `${query} near me`,
      `professional ${query}`,
      `${query} with AI`,
      `affordable ${query}`,
      `custom ${query} solutions`
    ];
    
    return baseSuggestions.slice(0, 5);
  },

  analyzeTrends: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      'AI-powered services',
      'Smart home automation',
      'Digital transformation',
      'Sustainable solutions',
      'Remote work tools',
      'Personalized experiences',
      'Data analytics',
      'Cloud migration'
    ];
  }
};

// Mock data for the marketplace
export const mockCategories = [
  { id: "electronics", name: "Electronics", icon: "🔌", count: 1250 },
  { id: "fashion", name: "Fashion & Apparel", icon: "👕", count: 890 },
  { id: "services", name: "Professional Services", icon: "💼", count: 650 },
  { id: "home", name: "Home & Garden", icon: "🏠", count: 720 },
  { id: "automotive", name: "Automotive", icon: "🚗", count: 480 },
  { id: "health", name: "Health & Beauty", icon: "💊", count: 320 },
  { id: "sports", name: "Sports & Recreation", icon: "⚽", count: 290 },
  { id: "education", name: "Education", icon: "📚", count: 180 }
];

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Professional Logo Design Service",
    description: "Get a custom logo designed by our expert team of graphic designers. Perfect for startups and established businesses looking to rebrand.",
    price: { min: 50, max: 500 },
    category: "services",
    location: "San Francisco, CA",
    vendor: {
      id: "v1",
      name: "Creative Studios Inc",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop"
    ],
    rating: 4.8,
    isService: true,
    tags: ["design", "branding", "logo"]
  },
  {
    id: "2",
    title: "Wireless Bluetooth Headphones",
    description: "Premium quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 199,
    category: "electronics",
    location: "New York, NY",
    vendor: {
      id: "v2",
      name: "TechGear Pro",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
    ],
    rating: 4.6,
    isService: false,
    tags: ["wireless", "bluetooth", "audio"]
  },
  {
    id: "3",
    title: "Digital Marketing Consultation",
    description: "Boost your online presence with our comprehensive digital marketing strategies. SEO, social media, and content marketing expertise.",
    price: { min: 100, max: 1000 },
    category: "services",
    location: "Los Angeles, CA",
    vendor: {
      id: "v3",
      name: "Marketing Pros",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&h=600&fit=crop"
    ],
    rating: 4.9,
    isService: true,
    tags: ["marketing", "SEO", "digital"]
  },
  {
    id: "4",
    title: "Organic Cotton T-Shirts",
    description: "Comfortable, sustainable organic cotton t-shirts available in multiple colors and sizes. Perfect for everyday wear.",
    price: 29,
    category: "fashion",
    location: "Portland, OR",
    vendor: {
      id: "v4",
      name: "Eco Fashion Co",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=600&fit=crop"
    ],
    rating: 4.5,
    isService: false,
    tags: ["organic", "cotton", "sustainable"]
  },
  {
    id: "5",
    title: "Smart Home Installation Service",
    description: "Professional smart home setup and installation. We handle everything from smart lighting to security systems.",
    price: { min: 200, max: 2000 },
    category: "services",
    location: "Austin, TX",
    vendor: {
      id: "v5",
      name: "Smart Solutions LLC",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop"
    ],
    rating: 4.7,
    isService: true,
    tags: ["smart home", "installation", "technology"]
  },
  {
    id: "6",
    title: "Ergonomic Office Chair",
    description: "Premium ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.",
    price: 350,
    category: "home",
    location: "Seattle, WA",
    vendor: {
      id: "v6",
      name: "Office Comfort Inc",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face"
    },
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=800&h=600&fit=crop"
    ],
    rating: 4.4,
    isService: false,
    tags: ["ergonomic", "office", "furniture"]
  }
];

export const locations = [
  "San Francisco, CA",
  "New York, NY", 
  "Los Angeles, CA",
  "Chicago, IL",
  "Austin, TX",
  "Seattle, WA",
  "Portland, OR",
  "Denver, CO",
  "Miami, FL",
  "Boston, MA"
];