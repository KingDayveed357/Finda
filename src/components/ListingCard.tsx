import React, { memo, useState, useCallback, useMemo } from 'react';
import { Star, MapPin, Wifi, Shield, Award, Tag, Clock, Zap, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Enhanced UnifiedListing interface to match the search service
interface UnifiedListing {
  id: string;
  title: string;
  description: string;
  price: number | { min: number; max: number } | null;
  currency: string;
  currencySymbol: string;
  image: string;
  images: string[];
  rating: number;
  ratingCount: number;
  location: string;
  tags: string[];
  isService: boolean;
  isPromoted: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  providerName: string;
  providerImage?: string;
  slug: string;
  createdAt: string;
  originalData: any;
}

interface ListingCardProps {
  listing: UnifiedListing;
  loading?: boolean;
  className?: string;
  viewMode?: 'grid' | 'list';
  showProviderInfo?: boolean;
  onFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
}

// Optimized image component with better error handling and lazy loading
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className,
  onError,
  onLoad 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  onError: () => void;
  onLoad?: () => void;
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      onLoad={onLoad}
      loading="lazy"
      decoding="async"
      style={{ 
        contentVisibility: 'auto',
        containIntrinsicSize: '1px 192px' // Reserve space to prevent layout shift
      }}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Memoized provider avatar component
const ProviderAvatar = memo(({ 
  src, 
  alt, 
  size = 'sm',
  onError 
}: { 
  src: string; 
  alt: string; 
  size?: 'sm' | 'md';
  onError: () => void;
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10'
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 flex-shrink-0 object-cover`}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  );
});

ProviderAvatar.displayName = 'ProviderAvatar';

// Rating component with stars
const RatingDisplay = memo(({ rating, count }: { rating: number; count: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;
      
      return (
        <Star
          key={i}
          className={`h-4 w-4 ${
            filled 
              ? 'fill-yellow-400 text-yellow-400' 
              : halfFilled 
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
          }`}
        />
      );
    });
  }, [rating]);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">{stars}</div>
      <span className="text-sm font-medium text-gray-700">
        {Math.max(0, Math.min(5, rating)).toFixed(1)}
      </span>
      <span className="text-xs text-gray-500">
        ({Math.max(0, count).toLocaleString()} review{count !== 1 ? 's' : ''})
      </span>
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

const ListingCard: React.FC<ListingCardProps> = memo(({ 
  listing, 
  loading = false, 
  className = "",
  viewMode = 'grid',
  showProviderInfo = true,
  onFavorite,
  isFavorited = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Memoized price formatting with enhanced logic
  const formattedPrice = useMemo(() => {
    const price = listing.price;
    if (!price && price !== 0) return 'Contact for price';
    
    const currencySymbol = listing.currencySymbol || '₦';
    
    if (typeof price === 'number') {
      if (price === 0) return 'Free';
      if (price < 0) return 'Contact for price';
      return `${currencySymbol}${price.toLocaleString()}`;
    }
    
    if (typeof price === 'object' && price !== null && 'min' in price) {
      const min = Math.max(0, price.min || 0);
      const max = Math.max(min, price.max || price.min || 0);
      
      if (min === max) {
        return min > 0 ? `${currencySymbol}${min.toLocaleString()}` : 'Free';
      }
      
      // Add pricing type for services
      if (listing.isService && listing.originalData?.price_type) {
        return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}/${listing.originalData.price_type}`;
      }
      
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    }
    
    return 'Contact for price';
  }, [listing.price, listing.currencySymbol, listing.isService, listing.originalData]);

  // Enhanced image source selection with multiple fallbacks
  const mainImageSrc = useMemo(() => {
    if (imageError) return '/placeholder.svg';
    
    const imageSources = [
      listing.image,
      ...(listing.images || []),
      listing.originalData?.featured_image_url,
      listing.originalData?.featured_image,
      ...(listing.originalData?.gallery_images || [])
    ].filter(Boolean);

    return imageSources[0] || '/placeholder.svg';
  }, [listing, imageError]);

  // Enhanced provider image handling
  const providerImageSrc = useMemo(() => {
    if (avatarError) return '/avatar.jpeg';
    
    return listing.providerImage || 
           listing.originalData?.user_details?.profile_image ||
           '/avatar.jpeg';
  }, [listing, avatarError]);

  // Enhanced URL generation with better slug handling
  const listingUrl = useMemo(() => {
    const slug = listing.originalData?.slug || listing.slug;
    const id = listing.id;
    
    if (slug && typeof slug === 'string') {
      return listing.isService ? `/service/${slug}` : `/product/${slug}`;
    } else if (id) {
      return `/listing/${id}`;
    } else {
      console.warn('Listing has no slug or ID', listing);
      return '#';
    }
  }, [listing]);

  // Enhanced location processing with fallbacks
  const displayLocation = useMemo(() => {
    if (listing.location && 
        listing.location !== 'Unknown' && 
        listing.location !== 'Location not specified' &&
        listing.location.trim() !== '') {
      return listing.location.length > 30 
        ? `${listing.location.substring(0, 30)}...` 
        : listing.location;
    }
    
    // Try to construct location from original data
    const originalData = listing.originalData;
    const locationParts = [
      originalData?.city_details?.name,
      originalData?.state_details?.name,
      originalData?.country_details?.name
    ].filter(Boolean);
    
    if (locationParts.length > 0) {
      const location = locationParts.slice(0, 2).join(', ');
      return location.length > 30 ? `${location.substring(0, 30)}...` : location;
    }
    
    if (listing.isService && originalData?.serves_remote) {
      return 'Remote Available';
    }
    
    return 'Location not specified';
  }, [listing]);

  // Memoized status badges
  const statusBadges = useMemo(() => {
    return [
      {
        show: listing.isService,
        content: 'Service',
        className: 'bg-blue-600 text-white text-xs',
        icon: null
      },
      {
        show: !listing.isService,
        content: 'Product',
        className: 'bg-green-600 text-white text-xs',
        icon: null
      },
      {
        show: listing.isVerified,
        content: 'Verified',
        className: 'bg-emerald-600 text-white text-xs',
        icon: <Shield className="h-3 w-3 mr-1" />
      }
    ].filter(badge => badge.show);
  }, [listing.isService, listing.isVerified]);

  // Memoized feature badges
  const featureBadges = useMemo(() => {
    const badges = [];
    
    if (listing.isService && listing.originalData?.serves_remote) {
      badges.push({
        content: 'Remote',
        className: 'bg-indigo-600 text-white text-xs',
        icon: <Wifi className="h-3 w-3 mr-1" />
      });
    }
    
    if (!listing.isService && listing.originalData?.product_condition) {
      badges.push({
        content: listing.originalData.product_condition,
        className: 'bg-gray-600 text-white text-xs capitalize',
        icon: null
      });
    }
    
    if (listing.isPromoted) {
      badges.push({
        content: 'Promoted',
        className: 'bg-yellow-500 text-white text-xs',
        icon: <Award className="h-3 w-3 mr-1" />
      });
    }
    
    if (listing.isFeatured) {
      badges.push({
        content: 'Featured',
        className: 'bg-purple-600 text-white text-xs',
        icon: <Zap className="h-3 w-3 mr-1" />
      });
    }
    
    return badges.slice(0, 2); // Limit to 2 badges to prevent crowding
  }, [listing]);

  // Additional info for services
  const serviceInfo = useMemo(() => {
    if (!listing.isService) return null;
    
    const info = [];
    const originalData = listing.originalData;
    
    if (originalData?.response_time) {
      info.push({
        label: 'Response',
        value: originalData.response_time,
        icon: <Clock className="h-3 w-3" />
      });
    }
    
    if (originalData?.price_type) {
      info.push({
        label: 'Pricing',
        value: `Per ${originalData.price_type}`,
        icon: <Tag className="h-3 w-3" />
      });
    }
    
    return info.slice(0, 2);
  }, [listing]);

  // Product specific info
  const productInfo = useMemo(() => {
    if (listing.isService) return null;
    
    const info = [];
    const originalData = listing.originalData;
    
    if (originalData?.product_brand) {
      info.push({
        type: 'brand',
        value: originalData.product_brand
      });
    }
    
    if (originalData?.is_negotiable) {
      info.push({
        type: 'negotiable',
        value: 'Negotiable'
      });
    }
    
    if (originalData?.discount_percentage && originalData.discount_percentage > 0) {
      info.push({
        type: 'discount',
        value: `${originalData.discount_percentage}% Off`
      });
    }
    
    return info;
  }, [listing]);

  // Event handlers
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(listing.id);
  }, [onFavorite, listing.id]);

  // Loading skeleton
  if (loading) {
    return (
      <Card className="animate-pulse overflow-hidden">
        <div className="bg-gray-200 h-48 rounded-t-lg"></div>
        <CardContent className="p-4">
          <div className="bg-gray-200 h-4 rounded mb-2"></div>
          <div className="bg-gray-200 h-3 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  // List view rendering
  if (viewMode === 'list') {
    return (
      <Link to={listingUrl} className={`block ${className}`}>
        <Card className="group hover:shadow-lg transition-all duration-200 hover:border-blue-300 bg-white border-gray-200 overflow-hidden">
          <div className="flex">
            {/* Image Section */}
            <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden">
              <OptimizedImage
                src={mainImageSrc}
                alt={listing.title || 'Listing image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              )}
              
              {/* Status badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {statusBadges.slice(0, 2).map((badge, index) => (
                  <Badge key={`status-${index}`} className={badge.className}>
                    {badge.icon}
                    {badge.content}
                  </Badge>
                ))}
              </div>
              
              {/* Price overlay */}
              <div className="absolute bottom-2 left-2">
                <div className="bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
                  {formattedPrice}
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors flex-1">
                  {listing.title || 'Untitled Listing'}
                </h3>
                
                {onFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteClick}
                    className={`ml-2 p-1 h-8 w-8 ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {listing.description || 'No description available.'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-2">
                  {/* Rating */}
                  <RatingDisplay rating={listing.rating || 0} count={listing.ratingCount || 0} />
                  
                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{displayLocation}</span>
                  </div>
                </div>
                
                {/* Feature badges */}
                <div className="flex flex-col gap-1 items-end">
                  {featureBadges.map((badge, index) => (
                    <Badge key={`feature-${index}`} className={badge.className}>
                      {badge.icon}
                      {badge.content}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Provider info */}
              {showProviderInfo && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <ProviderAvatar
                      src={providerImageSrc}
                      alt={listing.providerName || 'Provider'}
                      size="sm"
                      onError={handleAvatarError}
                    />
                    <div className="text-sm text-gray-500 truncate">
                      by {listing.providerName || 'Unknown Provider'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view rendering (default)
  return (
    <Link to={listingUrl} className={`block ${className}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200 overflow-hidden">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={mainImageSrc}
            alt={listing.title || 'Listing image'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          {/* Status badges - Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {statusBadges.map((badge, index) => (
              <Badge key={`status-${index}`} className={badge.className}>
                {badge.icon}
                {badge.content}
              </Badge>
            ))}
          </div>
          
          {/* Feature badges - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {featureBadges.map((badge, index) => (
              <Badge key={`feature-${index}`} className={badge.className}>
                {badge.icon}
                {badge.content}
              </Badge>
            ))}
          </div>

          {/* Favorite button */}
          {onFavorite && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={`p-1 h-8 w-8 bg-white/80 hover:bg-white ${
                  isFavorited ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-2 left-2">
            <div className="bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-sm">
              {formattedPrice}
            </div>
          </div>

          {/* Views count */}
          <div className="absolute bottom-2 right-2">
            <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
              {listing.viewsCount || 0} views
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title || 'Untitled Listing'}
          </h3>
          
          {/* Rating */}
          <div className="mb-3">
            <RatingDisplay rating={listing.rating || 0} count={listing.ratingCount || 0} />
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>

          {/* Provider info */}
          {showProviderInfo && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <ProviderAvatar
                  src={providerImageSrc}
                  alt={listing.providerName || 'Provider'}
                  onError={handleAvatarError}
                />
                <div className="text-sm text-gray-500 truncate">
                  by {listing.providerName || 'Unknown Provider'}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(listing.tags) && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.tags.slice(0, 2).map((tag, index) => (
                <Badge key={`tag-${tag}-${index}`} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {listing.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Service-specific info */}
          {serviceInfo && serviceInfo.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {serviceInfo.map((info, index) => (
                <div key={`service-info-${index}`} className="flex items-center bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {info.icon}
                  <span className="ml-1">{info.label}: {info.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Product-specific info */}
          {productInfo && productInfo.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {productInfo.map((info, index) => {
                const badgeProps = {
                  brand: { variant: 'outline' as const, className: 'text-xs' },
                  negotiable: { variant: 'secondary' as const, className: 'text-xs text-green-700 bg-green-100' },
                  discount: { variant: 'secondary' as const, className: 'text-xs text-red-700 bg-red-100' }
                }[info.type] || { variant: 'outline' as const, className: 'text-xs' };

                return (
                  <Badge key={`product-info-${index}`} {...badgeProps}>
                    {info.value}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Creation date */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>
                Listed {new Date(listing.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>View Details</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;