import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UnifiedListing } from '../service/listingService';

interface ListingCardProps {
  listing: UnifiedListing & {
    images?: string[];
    vendor?: {
      name: string;
      image: string;
    };
    slug?:any
  };
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const formatPrice = (price: number | { min: number; max: number } | null | undefined) => {
    // Handle null/undefined prices
    if (!price) return 'Price not available';
    
    // Get currency symbol from the listing data
    const currencySymbol = listing.originalData?.currency_symbol || '₦';
    
    if (typeof price === 'number') {
      return price > 0 ? `${currencySymbol}${price.toLocaleString()}` : 'Free';
    }
    
    // Handle price range objects
    if (typeof price === 'object' && price.min !== undefined) {
      const min = price.min || 0;
      const max = price.max || price.min || 0;
      
      if (min === max) {
        return min > 0 ? `${currencySymbol}${min.toLocaleString()}` : 'Free';
      }
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    }
    
    return 'Price not available';
  };

  // Enhanced image handling with multiple fallbacks
  const getImage = () => {
    // Try multiple image sources in order of preference
    const imageSources = [
      listing.images?.[0],
      listing.image,
      listing.originalData?.featured_image,
      listing.originalData?.gallery_images?.[0]
    ].filter(Boolean);

    // Return first valid image or placeholder
    return imageSources[0] || '/placeholder.svg';
  };

  // Handle vendor information with fallbacks
  const getVendorName = () => {
    return listing.vendor?.name || 
           listing.providerName || 
           listing.originalData?.user_details?.full_name ||
           listing.originalData?.user_details?.username ||
           listing.originalData?.provider_name ||
           'Unknown Provider';
  };

  const getVendorImage = () => {
    return listing.vendor?.image || '/avatar.jpeg';
  };

  // Enhanced location handling
  const getLocation = () => {
    if (listing.location && listing.location !== 'Unknown') {
      return listing.location;
    }
    
    // Try to build location from original data
    const locationParts = [
      listing.originalData?.city_details?.name,
      listing.originalData?.state_details?.name,
      listing.originalData?.country_details?.name
    ].filter(Boolean);
    
    if (locationParts.length > 0) {
      return locationParts.join(', ');
    }
    
    return listing.isService && listing.originalData?.serves_remote 
      ? 'Remote Available' 
      : 'Location not specified';
  };

  // Safe rating display
  const getRating = () => {
    const rating = listing.rating || listing.originalData?.average_rating || 0;
    return Math.max(0, Math.min(5, rating)); // Ensure rating is between 0-5
  };

  const getRatingCount = () => {
    return listing.ratingCount || listing.originalData?.rating_count || 0;
  };

  // Generate appropriate URL based on listing type and slug availability
  const getListingUrl = () => {
    // Priority order: use slug if available, fallback to ID
    const slug = listing.originalData?.slug || listing.slug;
    const id = listing.id;
    
    if (slug) {
      // Use slug-based URLs with type specification for better SEO
      if (listing.isService) {
        return `/service/${slug}`;
      } else {
        return `/product/${slug}`;
      }
    } else {
      // Fallback to ID-based URL
      return `/listing/id/${id}`;
    }
  };

  // Enhanced image error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // If this is already the placeholder, don't try again
    if (img.src.includes('/placeholder.svg')) {
      return;
    }
    
    // Try fallback images first
    const fallbacks = [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ];
    
    const currentSrc = img.src;
    const nextFallback = fallbacks.find(fallback => !currentSrc.includes(fallback));
    
    if (nextFallback) {
      img.src = nextFallback;
    }
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.includes('/avatar.jpeg')) {
      img.src = '/avatar.jpeg';
    }
  };

  return (
    <Link to={getListingUrl()}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white border-gray-200">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={getImage()}
            alt={listing.title || 'Listing image'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy" // Add lazy loading for performance
          />
          
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {listing.isService && (
              <Badge className="bg-blue-600 text-white text-xs">
                Service
              </Badge>
            )}
            {!listing.isService && (
              <Badge className="bg-green-600 text-white text-xs">
                Product
              </Badge>
            )}
            {listing.isPromoted && (
              <Badge className="bg-yellow-500 text-white text-xs">
                Promoted
              </Badge>
            )}
            {listing.isFeatured && (
              <Badge className="bg-purple-600 text-white text-xs">
                Featured
              </Badge>
            )}
            {listing.isVerified && (
              <Badge className="bg-green-600 text-white text-xs">
                Verified
              </Badge>
            )}
          </div>
          
          {/* Service-specific badge */}
          {listing.isService && listing.originalData?.serves_remote && (
            <Badge className="absolute top-2 right-2 bg-indigo-600 text-white text-xs">
              Remote
            </Badge>
          )}

          {/* Product condition badge */}
          {!listing.isService && listing.originalData?.product_condition && (
            <Badge className="absolute top-2 right-2 bg-gray-600 text-white text-xs capitalize">
              {listing.originalData.product_condition}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title || 'Untitled Listing'}
          </h3>
          
          {/* Rating section with safe handling */}
          <div className="flex items-center space-x-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{getRating().toFixed(1)}</span>
            <span className="text-sm text-gray-500">
              ({getRatingCount()} {getRatingCount() === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Location with enhanced handling */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{getLocation()}</span>
          </div>

          {/* Price and provider section */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm text-gray-500 truncate">
                by {getVendorName()}
              </div>
            </div>
            <div className="flex items-center ml-2">
              <img
                src={getVendorImage()}
                alt={getVendorName()}
                className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
                onError={handleAvatarError}
                loading="lazy"
              />
            </div>
          </div>

          {/* Tags section with better handling */}
          <div className="flex flex-wrap gap-1">
            {(listing.tags || []).slice(0, 3).map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {(listing.tags || []).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(listing.tags || []).length - 3} more
              </Badge>
            )}
          </div>

          {/* Additional info for services */}
          {listing.isService && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
              {listing.originalData?.response_time && (
                <span>Response: {listing.originalData.response_time}</span>
              )}
              {listing.originalData?.serves_remote && (
                <span className="text-indigo-600 font-medium">Remote Available</span>
              )}
              {listing.originalData?.price_type && (
                <span className="capitalize">Per {listing.originalData.price_type}</span>
              )}
            </div>
          )}

          {/* Additional info for products */}
          {!listing.isService && (
            <div className="mt-2 flex flex-wrap gap-2">
              {listing.originalData?.product_brand && (
                <Badge variant="outline" className="text-xs">
                  {listing.originalData.product_brand}
                </Badge>
              )}
              {listing.originalData?.is_negotiable && (
                <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                  Negotiable
                </Badge>
              )}
              {listing.originalData?.discount_percentage && (
                <Badge variant="secondary" className="text-xs text-red-700 bg-red-100">
                  {listing.originalData.discount_percentage}% Off
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;