import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ListingCardSkeleton: React.FC = () => {
  return (
    <Card className="bg-white border-gray-200">
      <div className="relative overflow-hidden rounded-t-lg">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-gray-200 animate-pulse" />
        
        {/* Badge skeletons */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="h-5 w-16 bg-gray-300 rounded animate-pulse" />
        </div>
        
        <div className="absolute top-2 right-2">
          <div className="h-5 w-14 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Title skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-1" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Price and provider skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1">
          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Additional info skeleton */}
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCardSkeleton;