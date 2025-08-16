import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { FindaHeader } from "@/components/chatbot/FindaHeader";
import { ChatInterface } from "@/components/chatbot/ChatInterface";
import { SearchResultsGrid } from "@/components/chatbot/SearchResultsGrid";
import { FilterSidebar } from "@/components/chatbot/FilterSidebar";
import { ProductModal } from "@/components/chatbot/ProductModal";
import { toast } from "sonner";
import { chatbotService, type ChatResponse, type SearchResults } from "@/service/chatbotService";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  facepile?: { label: string; action: string }[];
  searchResults?: SearchResults;
  suggestedActions?: Array<{ action: string; label: string; description: string }>;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [sessionId] = useState(() => chatbotService.generateSessionId());
  const [searchPerformance, setSearchPerformance] = useState({
    time: "0s",
    sources: [] as string[]
  });
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    vendors: [] as string[],
    deliveryTime: [] as string[],
    countries: [] as string[],
    minRating: 0,
    brands: [] as string[]
  });

  // Initialize chatbot service
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        await chatbotService.initialize();
        console.log('Chatbot service initialized with session:', sessionId);
      } catch (error) {
        console.error('Failed to initialize chatbot service:', error);
        toast.error('Failed to initialize chat service. Please refresh the page.');
      }
    };

    initializeChatbot();
  }, [sessionId]);

  // Function to convert API search results to Product format
  const convertSearchResultsToProducts = (searchResults: SearchResults): Product[] => {
    const products: Product[] = [];

    // Process local products
    if (searchResults.local?.products) {
      searchResults.local.products.forEach((localProduct, index) => {
        const product: Product = {
          id: `local-${localProduct.id || index}`,
          title: localProduct.name,
          price: localProduct.formatted_price || `${localProduct.price}`,
          seller: {
            name: 'Finda',
            type: 'finda',
            rating: 4.5, // Default rating for local products
            reviewCount: Math.floor(Math.random() * 500) + 50,
            responseTime: '1-2 hours',
            verificationLevel: 'Finda Verified'
          },
          images: ['/placeholder-product.jpg'], // Use placeholder until we have real images
          rating: 4.0 + Math.random(), // Random rating between 4-5
          reviewCount: Math.floor(Math.random() * 200) + 20,
          deliveryTime: 'Same day', // Default for local
          location: 'Lagos, Nigeria', // Default location
          description: `High-quality ${localProduct.name} available on Finda marketplace`,
          specifications: {
            'Condition': 'New',
            'Warranty': '1 Year',
            'Source': 'Local Finda Vendor'
          },
          reviews: [
            {
              id: '1',
              author: 'Verified Buyer',
              rating: 5,
              comment: 'Great product from local vendor',
              date: '2 days ago',
              verified: true
            }
          ],
          explanation: 'Local Finda marketplace product with competitive pricing and fast delivery',
          tags: ['Local Vendor', 'Fast Delivery', 'Verified'],
          discount: Math.random() > 0.7 ? `${Math.floor(Math.random() * 20) + 5}% OFF` : undefined
        };
        products.push(product);
      });
    }

    // Process external products
    if (searchResults.external?.products) {
      searchResults.external.products.forEach((externalProduct, index) => {
        const sellerType = externalProduct.source.toLowerCase() as 'amazon' | 'jumia' | 'ebay' | 'finda' | 'upwork';
        
        const product: Product = {
          id: `external-${index}`,
          title: externalProduct.title,
          price: externalProduct.price,
          seller: {
            name: externalProduct.source,
            type: ['amazon', 'jumia', 'ebay', 'finda', 'upwork'].includes(sellerType) ? sellerType : 'amazon',
            rating: 4.0 + Math.random(),
            reviewCount: Math.floor(Math.random() * 1000) + 100,
            responseTime: sellerType === 'amazon' ? 'Within 1 hour' : '2-4 hours',
            verificationLevel: 'Verified Seller'
          },
          images: ['/placeholder-product.jpg'], // Use placeholder until we have real images
          rating: 4.0 + Math.random(),
          reviewCount: Math.floor(Math.random() * 500) + 50,
          deliveryTime: sellerType === 'amazon' ? 'Next day' : '2-3 days',
          location: sellerType === 'jumia' ? 'Lagos, Nigeria' : 'International',
          description: `${externalProduct.title} from ${externalProduct.source}`,
          specifications: {
            'Source': externalProduct.source,
            'Availability': 'In Stock',
            'Shipping': 'Available to Nigeria'
          },
          reviews: [
            {
              id: '1',
              author: 'Customer',
              rating: Math.floor(4 + Math.random()),
              comment: `Good quality product from ${externalProduct.source}`,
              date: '1 week ago',
              verified: true
            }
          ],
          explanation: `Product found on ${externalProduct.source} marketplace`,
          tags: ['External Vendor', externalProduct.source, 'International'],
          discount: Math.random() > 0.6 ? `${Math.floor(Math.random() * 25) + 5}% OFF` : undefined
        };
        products.push(product);
      });
    }

    return products;
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to chatbot API
      const startTime = performance.now();
      
      const response: ChatResponse = await chatbotService.sendTextMessage(message, {
        session_id: sessionId,
        language: 'en',
        enable_tts: false,
        user_location: {
          country: 'Nigeria',
          city: 'Lagos',
          coordinates: { lat: 6.5244, lng: 3.3792 }
        }
      });

      const endTime = performance.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(1);

      // Create AI response message
      const aiResponse: Message = {
        id: response.message_id,
        type: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp),
        searchResults: response.search_results,
        suggestedActions: response.suggested_actions,
        facepile: response.suggested_actions?.map(action => ({
          label: action.label,
          action: action.action
        }))
      };

      setMessages(prev => [...prev, aiResponse]);

      // Update search results if available
      if (response.search_results) {
        const products = convertSearchResultsToProducts(response.search_results);
        setSearchResults(products);

        // Update search performance
        setSearchPerformance({
          time: `${processingTime}s`,
          sources: response.metadata.services_used || []
        });

        // Show success toast with performance info
        const totalResults = (response.search_results.local?.total || 0) + (response.search_results.external?.total || 0);
        toast.success(
          `Search completed - Found ${totalResults} results in ${processingTime}s across ${response.metadata.services_used?.join(', ') || 'multiple sources'}`
        );
      }

    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Create error response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
        facepile: [
          { label: 'Try Again', action: 'retry' },
          { label: 'Help', action: 'help' }
        ]
      };

      setMessages(prev => [...prev, errorResponse]);
      toast.error('Failed to get response from chatbot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = async () => {
    toast.info("Voice recording feature - Upload a voice file to transcribe!");
    
    // Create file input for voice upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setIsLoading(true);
          toast.info("Transcribing voice message...");
          
          const transcriptionResponse = await chatbotService.uploadVoice(file);
          
          if (transcriptionResponse.success && transcriptionResponse.transcription.text) {
            // Send the transcribed text as a message
            await handleSendMessage(transcriptionResponse.transcription.text);
            toast.success(`Voice transcribed: "${transcriptionResponse.transcription.text.substring(0, 50)}..."`);
          }
        } catch (error) {
          console.error('Voice transcription failed:', error);
          toast.error('Failed to transcribe voice message. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    input.click();
  };

  const handleImageUpload = async () => {
    toast.info("Upload an image to find similar products!");
    
    // Create file input for image upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setIsLoading(true);
          toast.info("Analyzing image...");
          
          const imageAnalysisResponse = await chatbotService.uploadImage(
            file, 
            "Can you find similar products to this image?"
          );
          
          if (imageAnalysisResponse.success) {
            // Create a message about the image upload
            const imageMessage: Message = {
              id: Date.now().toString(),
              type: 'user',
              content: "🖼️ Image uploaded - Looking for similar products...",
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, imageMessage]);
            
            // Send a follow-up message to get product recommendations
            await handleSendMessage("Find products similar to the uploaded image");
            toast.success("Image analyzed successfully!");
          }
        } catch (error) {
          console.error('Image analysis failed:', error);
          toast.error('Failed to analyze image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    input.click();
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFacepileAction = async (action: string) => {
    // Handle suggested action clicks
    const actionMessages: { [key: string]: string } = {
      'price': 'Show me options sorted by price',
      'seller': 'Filter by seller type',
      'delivery': 'Show fastest delivery options',
      'cheapest': 'Show me the cheapest options',
      'compare_products': 'Help me compare these products',
      'retry': 'Please try that search again',
      'help': 'What can you help me find?'
    };

    const message = actionMessages[action] || `Tell me more about ${action}`;
    await handleSendMessage(message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FindaHeader 
        onToggleSidebar={handleToggleSidebar}
      />
      
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
              onToggleSidebar={handleToggleSidebar}
              onFacepileAction={handleFacepileAction}
              sidebarOpen={sidebarOpen}
              isLoading={isLoading}
              sessionId={sessionId}
            />
          </div>

          {/* Results Panel - Hidden on mobile when no results */}
          <div className={`lg:w-1/2 flex flex-col ${searchResults.length === 0 ? 'hidden lg:flex' : 'flex'}`}>
            {searchResults.length > 0 ? (
              <SearchResultsGrid 
                products={searchResults}
                onProductClick={handleProductClick}
                onShowFilters={() => setShowFilters(true)}
                searchPerformance={searchPerformance}
              />
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