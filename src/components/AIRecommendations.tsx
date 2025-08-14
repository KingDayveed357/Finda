import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Star, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockAI, mockListings } from '@/lib/mock-ai';
import type { Listing } from "@/lib/mock-ai";
import ListingCard from './ListingCard2';

interface AIRecommendationsProps {
  searchHistory?: string[];
  currentCategory?: string;
  userPreferences?: {
    priceRange?: [number, number];
    locations?: string[];
    ratings?: number;
  };
}

// Transform function to convert Listing to UnifiedListing format
const transformListingToUnified = (listing: Listing) => {
  return {
    ...listing,
    // Add missing properties with sensible defaults
    ratingCount: Math.floor(Math.random() * 500) + 50, // Random rating count between 50-550
    image: listing.images[0] || '', // Use first image as main image
    isPromoted: Math.random() > 0.8, // 20% chance of being promoted
    isFeatured: listing.rating >= 4.7, // Featured if rating is 4.7 or higher
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: listing.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    // Map price to match expected format
    price: typeof listing.price === 'number' ? listing.price : listing.price.min,
    priceMax: typeof listing.price === 'object' ? listing.price.max : undefined,
    // Ensure vendor has required structure
    vendor: listing.vendor ? {
      ...listing.vendor,
      name: listing.vendor.name,
      image: listing.vendor.image
    } : undefined,
    // Keep original images array
    images: listing.images
  };
};

const AIRecommendations = ({ 
  searchHistory = [], 
  currentCategory, 
//   userPreferences 
}: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      // Generate AI recommendations based on search history and category
      const aiRecommendations = await mockAI.generateRecommendations(
        searchHistory, 
        currentCategory
      );
      
      // Get top-rated listings
      const topRatedListings = mockListings
        .filter(listing => listing.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
      
      // Generate trending searches based on AI analysis
      const trending = [
        'AI Photography Services',
        'Smart Home Setup',
        'Digital Marketing Strategy',
        'Custom Web Development',
        'Professional Logo Design'
      ];

      // Transform listings to match UnifiedListing format
      setRecommendations(
        aiRecommendations.slice(0, 6).map(transformListingToUnified)
      );
      setTopRated(
        topRatedListings.map(transformListingToUnified)
      );
      setTrendingSearches(trending);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [searchHistory, currentCategory]);

  return (
    <div className="space-y-8">
      {/* AI-Powered Recommendations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Recommendations for You
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {searchHistory.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Based on your search history: {searchHistory.slice(-3).join(', ')}
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Rated Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Top Rated This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topRated.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Trending AI-Powered Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <Link to={`/listings?search=${encodeURIComponent(search)}`}>
                  {search}
                </Link>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendations;