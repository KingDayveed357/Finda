import React, { memo, useState, useCallback } from 'react';
import { Star, MapPin, Wifi, Shield, Award, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UnifiedListing } from '../service/listingService';

interface ListingCardProps {
  listing: UnifiedListing;
  loading?: boolean;
  className?: string;
}

// FIXED: Better type safety for originalData
interface OriginalData {
  currency_symbol?: string;
  featured_image?: string;
  featured_image_url?: string;
  gallery_images?: string[];
  slug?: string;
  city_details?: { name: string };
  state_details?: { name: string };
  country_details?: { name: string };
  serves_remote?: boolean;
  response_time?: string;
  price_type?: string;
  product_brand?: string;
  is_negotiable?: boolean;
  discount_percentage?: number;
  product_condition?: string;
  user_details?: {
    profile_image?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    full_name?: string;
  };
}

// Memoized image component with better error handling
const ListingImage = memo(({ src, alt, onError }: { 
  src: string; 
  alt: string; 
  onError: () => void;
}) => (
  <img
    src={src}
    alt={alt}
    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
    onError={onError}
    loading="lazy"
    decoding="async"
    onLoad={() => {
      // Optional: Track successful image loads
    }}
  />
));

ListingImage.displayName = 'ListingImage';

// Memoized vendor avatar component
const VendorAvatar = memo(({ src, alt, onError }: { 
  src: string; 
  alt: string; 
  onError: () => void;
}) => (
  <img
    src={src}
    alt={alt}
    className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
    onError={onError}
    loading="lazy"
    decoding="async"
  />
));

VendorAvatar.displayName = 'VendorAvatar';

const ListingCard: React.FC<ListingCardProps> = memo(({ listing, loading = false, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // FIXED: Better price formatting with proper type handling
  const formatPrice = useCallback((price: number | { min: number; max: number } | null | undefined) => {
    if (!price && price !== 0) return 'Contact for price';
    
    const originalData = listing.originalData as OriginalData;
    const currencySymbol = originalData?.currency_symbol || '₦';
    
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
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    }
    
    return 'Contact for price';
  }, [listing.originalData]);

  // FIXED: Better image source selection with fallbacks
  const getMainImage = useCallback(() => {
    if (imageError) return '/placeholder.svg';
    
    const originalData = listing.originalData as OriginalData;
    const imageSources = [
      listing.image,
      ...(listing.images || []),
      originalData?.featured_image_url,
      originalData?.featured_image,
      ...(originalData?.gallery_images || [])
    ].filter(Boolean);

    return imageSources[0] || '/placeholder.svg';
  }, [listing, imageError]);

  // FIXED: Better vendor image handling
  const getVendorImage = useCallback(() => {
    if (avatarError) return '/avatar.jpeg';
    
    const originalData = listing.originalData as OriginalData;
    return listing.vendor?.image || 
           originalData?.user_details?.profile_image ||
           '/avatar.jpeg';
  }, [listing, avatarError]);

  // FIXED: Better URL generation with proper slug handling
  const getListingUrl = useCallback(() => {
    const originalData = listing.originalData as OriginalData;
    const slug = originalData?.slug || listing.slug;
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

  // FIXED: Better location processing
  const getLocation = useCallback(() => {
    if (listing.location && 
        listing.location !== 'Unknown' && 
        listing.location !== 'Location not specified' &&
        listing.location.trim() !== '') {
      return listing.location;
    }
    
    const originalData = listing.originalData as OriginalData;
    const locationParts = [
      originalData?.city_details?.name,
      originalData?.state_details?.name,
      originalData?.country_details?.name
    ].filter(Boolean);
    
    if (locationParts.length > 0) {
      return locationParts.slice(0, 2).join(', ');
    }
    
    if (listing.isService && originalData?.serves_remote) {
      return 'Remote Available';
    }
    
    return 'Location not specified';
  }, [listing]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
  }, []);

  // FIXED: Better badge configuration with proper typing
  const statusBadges = [
    {
      condition: listing.isService,
      content: 'Service',
      className: 'bg-blue-600 text-white text-xs',
      icon: null
    },
    {
      condition: !listing.isService,
      content: 'Product',
      className: 'bg-green-600 text-white text-xs',
      icon: null
    },
    {
      condition: Boolean(listing.isVerified),
      content: 'Verified',
      className: 'bg-emerald-600 text-white text-xs',
      icon: <Shield className="h-3 w-3 mr-1" />
    }
  ];

  // FIXED: Better feature badges with proper type checking
  const featureBadges = [
    {
      condition: listing.isService && Boolean((listing.originalData as OriginalData)?.serves_remote),
      content: 'Remote',
      className: 'bg-indigo-600 text-white text-xs',
      icon: <Wifi className="h-3 w-3 mr-1" />
    },
    {
      condition: !listing.isService && Boolean((listing.originalData as OriginalData)?.product_condition),
      content: (listing.originalData as OriginalData)?.product_condition || '',
      className: 'bg-gray-600 text-white text-xs capitalize',
      icon: null
    },
    {
      condition: Boolean(listing.isPromoted),
      content: 'Promoted',
      className: 'bg-yellow-500 text-white text-xs',
      icon: <Award className="h-3 w-3 mr-1" />
    }
  ];

  // FIXED: Better loading state
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-t-lg"></div>
        <CardContent className="p-4">
          <div className="bg-gray-200 h-4 rounded mb-2"></div>
          <div className="bg-gray-200 h-3 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const originalData = listing.originalData as OriginalData;

  return (
    <Link to={getListingUrl()} className={`block ${className}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200 overflow-hidden">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <ListingImage
            src={getMainImage()}
            alt={listing.title || 'Listing image'}
            onError={handleImageError}
          />
          
          {/* Status badges - Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {statusBadges
              .filter(badge => badge.condition)
              .map((badge, index) => (
                <Badge key={`status-${index}`} className={badge.className}>
                  {badge.icon}
                  {badge.content}
                </Badge>
              ))
            }
          </div>
          
          {/* Feature badges - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {featureBadges
              .filter(badge => badge.condition && badge.content)
              .slice(0, 2)
              .map((badge, index) => (
                <Badge key={`feature-${index}`} className={badge.className}>
                  {badge.icon}
                  {badge.content}
                </Badge>
              ))
            }
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-2 left-2">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
              {formatPrice(listing.price)}
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title || 'Untitled Listing'}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {Math.max(0, Math.min(5, listing.rating || 0)).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({Math.max(0, listing.ratingCount || 0)} review{listing.ratingCount !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{getLocation()}</span>
          </div>

          {/* Provider and Avatar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 truncate">
                by {listing.providerName || 'Unknown Provider'}
              </div>
            </div>
            <VendorAvatar
              src={getVendorImage()}
              alt={listing.providerName || 'Provider'}
              onError={handleAvatarError}
            />
          </div>

          {/* Tags */}
          {Array.isArray(listing.tags) && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {listing.tags.slice(0, 3).map((tag, index) => (
                <Badge key={`tag-${tag}-${index}`} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {listing.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Service-specific info */}
          {listing.isService && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
              {originalData?.response_time && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  Response: {originalData.response_time}
                </span>
              )}
              {originalData?.price_type && (
                <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                  Per {originalData.price_type}
                </span>
              )}
            </div>
          )}

          {/* Product-specific info */}
          {!listing.isService && (
            <div className="mt-2 flex flex-wrap gap-2">
              {originalData?.product_brand && (
                <Badge variant="outline" className="text-xs">
                  {originalData.product_brand}
                </Badge>
              )}
              {originalData?.is_negotiable && (
                <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                  Negotiable
                </Badge>
              )}
              {originalData?.discount_percentage && originalData.discount_percentage > 0 && (
                <Badge variant="secondary" className="text-xs text-red-700 bg-red-100">
                  {originalData.discount_percentage}% Off
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;