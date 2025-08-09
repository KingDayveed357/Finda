// components/ListingDetail/RelatedItems.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listingService } from '@/service/listingService';
import type { UnifiedListing } from '@/types/listing';

interface RelatedItemsProps {
  currentListing: UnifiedListing;
}

export const RelatedItems: React.FC<RelatedItemsProps> = ({ currentListing }) => {
  const [relatedItems, setRelatedItems] = useState<UnifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setLoading(true);
        
        // Get related items using ListingService with smart filtering
        const allListings = await listingService.getAllListings({
          item_type: currentListing.isService ? 'services' : 'products',
          category: (currentListing.originalData as any).category_details?.id || 
                   (currentListing.originalData as any).product_category ||
                   (currentListing.originalData as any).category,
          limit: 15, // Get more items to filter out current one
          ordering: '-average_rating'
        });

        // Filter out current listing and limit to 10 items
        const filtered = allListings
          .filter(item => item.id !== `${currentListing.isService ? 'service' : 'product'}-${currentListing.id}`)
          .slice(0, 10);

        // If we don't have enough category-based items, get some general trending items
        if (filtered.length < 6) {
          const trendingItems = await listingService.getTrendingListings();
          const additionalItems = trendingItems
            .filter(item => 
              item.id !== `${currentListing.isService ? 'service' : 'product'}-${currentListing.id}` &&
              !filtered.some(existing => existing.id === item.id)
            )
            .slice(0, 6 - filtered.length);
          
          filtered.push(...additionalItems);
        }

        setRelatedItems(filtered);
      } catch (error) {
        console.error('Error fetching related items:', error);
        // Fallback to trending items on error
        try {
          const trendingItems = await listingService.getTrendingListings();
          const filtered = trendingItems
            .filter(item => item.id !== `${currentListing.isService ? 'service' : 'product'}-${currentListing.id}`)
            .slice(0, 8);
          setRelatedItems(filtered);
        } catch (fallbackError) {
          console.error('Error fetching trending items as fallback:', fallbackError);
          setRelatedItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [currentListing]);

  const formatPrice = (price: number | { min: number; max: number } | null | undefined, currencySymbol = '₦') => {
    if (!price && price !== 0) return 'Price not available';
    
    if (typeof price === 'number') {
      return `${currencySymbol}${price.toLocaleString()}`;
    }
    
    if (typeof price === 'object' && price !== null) {
      if (price.min === price.max) {
        return `${currencySymbol}${price.min.toLocaleString()}`;
      }
      return `${currencySymbol}${price.min.toLocaleString()} - ${currencySymbol}${price.max.toLocaleString()}`;
    }
    
    return 'Price not available';
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, relatedItems.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, relatedItems.length - 2)) % Math.max(1, relatedItems.length - 2));
  };

  const getImageWithFallback = (src: string | undefined): string => {
    return src || '/placeholder.svg';
  };

  const getListingUrl = (item: UnifiedListing) => {
    if (item.slug) {
      return `/${item.isService ? 'service' : 'product'}/${item.slug}`;
    }
    // Fallback to ID-based URL
    return `/listing/${item.id}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related {currentListing.isService ? 'Services' : 'Products'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 space-y-3">
                <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related {currentListing.isService ? 'Services' : 'Products'}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={relatedItems.length <= 3}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={relatedItems.length <= 3}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 288}px)` }}
          >
            {relatedItems.map((item) => (
              <Link
                key={item.id}
                to={getListingUrl(item)}
                className="flex-shrink-0 w-72 mr-4 group block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-10 overflow-hidden rounded-t-lg">
                  <img
                    src={getImageWithFallback(item.image)}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                      }
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                    {item.title}
                  </h3>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-blue-600 text-sm">
                      {formatPrice(item.price, (item.originalData as any)?.currency_symbol)}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {(item.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {/* Show tags if available */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};