
import { useState } from "react";
import { Filter, Grid, List, Clock, TrendingUp } from "lucide-react";
import { FindaHeader } from "@/components/chatbot/FindaHeader";
import { ChatInterface } from "@/components/chatbot/ChatInterface";
import { ProductCard } from "@/components/chatbot/ProductCard";
import { FilterSidebar } from "@/components/chatbot/FilterSidebar";
import { ProductModal } from "@/components/chatbot/ProductModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner'

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  facepile?: { label: string; action: string }[];
}

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  seller: {
    name: string;
    type: 'amazon' | 'jumia' | 'ebay' | 'finda' | 'upwork';
    rating: number;
    reviewCount: number;
    responseTime: string;
    verificationLevel: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  location: string;
  description: string;
  specifications: { [key: string]: string };
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }>;
  explanation: string;
  tags: string[];
  discount?: string;
}

const Index = () => {
//   const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    vendors: [] as string[],
    deliveryTime: [] as string[],
    countries: [] as string[],
    minRating: 0,
    brands: [] as string[]
  });

  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'iPhone 12 Pro Max 128GB Pacific Blue - Unlocked',
      price: '$349.99',
      originalPrice: '$399.99',
      seller: {
        name: 'Amazon',
        type: 'amazon',
        rating: 4.8,
        reviewCount: 2543,
        responseTime: 'Within 1 hour',
        verificationLevel: 'Verified Seller'
      },
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
      ],
      rating: 4.7,
      reviewCount: 1834,
      deliveryTime: 'Next day',
      location: 'Lagos, Nigeria',
      description: 'Fully unlocked iPhone 12 Pro Max in excellent condition. Includes original box and accessories. Battery health at 89%. No scratches or dents.',
      specifications: {
        'Screen Size': '6.7 inches',
        'Storage': '128GB',
        'Color': 'Pacific Blue',
        'Condition': 'Used - Excellent',
        'Battery Health': '89%',
        'Carrier': 'Unlocked'
      },
      reviews: [
        {
          id: '1',
          author: 'Sarah M.',
          rating: 5,
          comment: 'Perfect condition as described. Fast delivery to Lagos.',
          date: '2 days ago',
          verified: true
        },
        {
          id: '2',
          author: 'Ahmed K.',
          rating: 4,
          comment: 'Good phone, minor battery wear but works great.',
          date: '1 week ago',
          verified: true
        }
      ],
      explanation: 'This iPhone 12 Pro matches your budget and location requirements. Amazon Prime delivery available to Lagos with excellent seller ratings.',
      tags: ['Prime Eligible', 'Fast Shipping', 'Excellent Condition'],
      discount: '12% OFF'
    },
    {
      id: '2',
      title: 'iPhone 12 Pro 256GB Gold - Refurbished',
      price: '$329.00',
      seller: {
        name: 'TechHub NG',
        type: 'finda',
        rating: 4.6,
        reviewCount: 892,
        responseTime: '2-4 hours',
        verificationLevel: 'Finda Verified'
      },
      images: [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'
      ],
      rating: 4.5,
      reviewCount: 267,
      deliveryTime: '2-3 days',
      location: 'Abuja, Nigeria',
      description: 'Professionally refurbished iPhone 12 Pro with 6-month warranty. All functions tested and verified.',
      specifications: {
        'Screen Size': '6.1 inches',
        'Storage': '256GB',
        'Color': 'Gold',
        'Condition': 'Refurbished',
        'Warranty': '6 months',
        'Carrier': 'Unlocked'
      },
      reviews: [
        {
          id: '3',
          author: 'Michael O.',
          rating: 5,
          comment: 'Great local seller, phone arrived quickly.',
          date: '3 days ago',
          verified: true
        }
      ],
      explanation: 'Local Finda vendor offering competitive pricing with warranty. Supports local Nigerian business and faster local delivery.',
      tags: ['Local Seller', 'Warranty Included', 'Verified Refurbished']
    },
    {
      id: '3',
      title: 'iPhone 12 Pro 128GB Graphite - Grade A',
      price: '$345.50',
      seller: {
        name: 'Jumia',
        type: 'jumia',
        rating: 4.4,
        reviewCount: 1205,
        responseTime: 'Within 6 hours',
        verificationLevel: 'Official Store'
      },
      images: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400'
      ],
      rating: 4.3,
      reviewCount: 445,
      deliveryTime: 'Same day',
      location: 'Lagos, Nigeria',
      description: 'Grade A refurbished iPhone 12 Pro with minimal signs of use. Jumia official warranty included.',
      specifications: {
        'Screen Size': '6.1 inches',
        'Storage': '128GB',
        'Color': 'Graphite',
        'Condition': 'Grade A',
        'Warranty': '12 months',
        'Carrier': 'Unlocked'
      },
      reviews: [
        {
          id: '4',
          author: 'Fatima A.',
          rating: 4,
          comment: 'Good quality, Jumia delivery was reliable.',
          date: '5 days ago',
          verified: true
        }
      ],
      explanation: 'Jumia offers same-day delivery in Lagos with official warranty. Trusted local marketplace with buyer protection.',
      tags: ['Same Day Delivery', 'Official Warranty', 'Buyer Protection']
    }
  ];

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I found ${mockProducts.length} iPhone 12 Pro options under $350 with delivery to Lagos. Here are the best matches based on your criteria:\n\n• Amazon has an excellent condition iPhone 12 Pro Max for $349.99 with next-day delivery\n• Local Finda vendor offers a refurbished iPhone 12 Pro for $329 with warranty\n• Jumia provides same-day delivery options starting at $345.50\n\nAll options are verified sellers with good ratings. Would you like me to refine these by delivery time, condition, or specific features?`,
        timestamp: new Date(),
        facepile: [
          { label: 'Refine by Price', action: 'price' },
          { label: 'Seller Type', action: 'seller' },
          { label: 'Delivery Time', action: 'delivery' },
          { label: 'Show Cheapest', action: 'cheapest' }
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setSearchResults(mockProducts);
      setIsLoading(false);

      // Show performance indicator
       toast.success('Found results in 0.9s across Amazon, Jumia, and Finda marketplace')
    }, 2000);
  };

  const handleVoiceMessage = () => {
   toast.success("Voice recording feature coming soon!");
  };

  const handleImageUpload = () => {
    toast.success('Upload an image to find similar products!')
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FindaHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          {/* Chat Interface - Full height on mobile, half width on desktop */}
          <div className="h-full lg:w-1/2 lg:border-r flex flex-col">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onVoiceMessage={handleVoiceMessage}
              onImageUpload={handleImageUpload}
              isLoading={isLoading}
            />
          </div>

          {/* Results Panel - Hidden on mobile when no results */}
          <div className={`lg:w-1/2 flex flex-col ${searchResults.length === 0 ? 'hidden lg:flex' : 'flex'}`}>
            {searchResults.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">Search Results</h3>
                      <Badge variant="secondary">{searchResults.length} found</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={viewMode === 'grid' ? 'bg-muted' : ''}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={viewMode === 'list' ? 'bg-muted' : ''}
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(true)}
                      >
                        <Filter className="h-4 w-4 mr-1" />
                        Filters
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Search was fast (0.9s)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Best matches first</span>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2' 
                      : 'grid-cols-1'
                  }`}>
                    {searchResults.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        seller={product.seller}
                        image={product.images[0]}
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        deliveryTime={product.deliveryTime}
                        location={product.location}
                        explanation={product.explanation}
                        tags={product.tags}
                        discount={product.discount}
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  <div className="text-center mt-6">
                    <Button variant="outline">
                      View More Results →
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                    <Filter className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Find Anything</h3>
                  <p className="text-muted-foreground">
                    Search across Amazon, Jumia, eBay, Upwork, and local Finda vendors. 
                    AI-powered discovery finds exactly what you need.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Index;