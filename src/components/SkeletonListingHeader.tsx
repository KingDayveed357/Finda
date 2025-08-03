import React from 'react';

const HeaderSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        {/* Title skeleton */}
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        {/* Results count skeleton */}
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mt-4 sm:mt-0">
        {/* Sort dropdown skeleton */}
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        
        {/* Mobile filters button skeleton */}
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse md:hidden" />
        
        {/* View toggle skeleton */}
        <div className="hidden md:flex h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

export default HeaderSkeleton;