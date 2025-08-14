// components/ListingDetail/ListingHeader.tsx
import React from 'react';
import { Star, MapPin, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UnifiedListing } from '@/types/listing';

interface ListingHeaderProps {
  listing: UnifiedListing;
  formatPrice: (price: number | { min: number; max: number } | undefined) => string;
  onShare: () => void;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({
  listing,
  formatPrice,
  onShare
}) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{(listing.vendor?.rating || 0).toFixed(1)}</span>
              <span className="text-gray-500 ml-1">
                ({(listing as any).rating_count || 0} reviews)
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-2xl font-bold text-blue-600 mb-4">
        {formatPrice(listing.price ?? 0)}
      </div>

      <div className="flex flex-wrap gap-2">
        {listing.tags?.map((tag, index) => (
          <Badge key={index} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
