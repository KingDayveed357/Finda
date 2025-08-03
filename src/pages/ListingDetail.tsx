import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Share2, MessageCircle, ArrowLeft, Phone, Mail, Globe, MessageSquare, Clock, MapPin as LocationIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import { productService, type Product } from '@/service/productService';
import { serviceService, type Service } from '@/service/servicesService';

// Unified type for both products and services - separate from original types
type UnifiedListing = {
  // Original data (either Product or Service)
  originalData: Product | Service;
  // Common transformed properties
  id: number;
  isService: boolean;
  title: string;
  description: string;
  images: string[];
  price?: number | { min: number; max: number };
  location: string;
  tags: string[];
  vendor: {
    name: string;
    image: string;
    rating: number;
  };
  slug: string;
};

// Review type
interface Review {
  id: number;
  rating: number;
  review: string;
  user_name?: string;
  created_at: string;
  user_details?: {
    first_name?: string;
    last_name?: string;
  };
}

// Helper function to handle image loading with fallback
const getImageWithFallback = (src: string | undefined): string => {
  return src || '/placeholder.svg';
};

// Skeleton Loader Component
const SkeletonLoader = () => (
  <Layout>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button Skeleton */}
      <div className="h-10 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Skeleton */}
          <Card>
            <CardContent className="p-0">
              <div className="w-full h-96 bg-gray-200 rounded-t-lg animate-pulse"></div>
              <div className="flex space-x-2 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Title and Price Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Vendor Info Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </Layout>
);

// Related Items Carousel Component
const RelatedItems = ({ currentListing, isService }: { currentListing: UnifiedListing; isService: boolean }) => {
  const [relatedItems, setRelatedItems] = useState<UnifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setLoading(true);
        let items: UnifiedListing[] = [];

        if (isService) {
          const services = await serviceService.getServicesArray();
          items = services
            .filter(service => service.id !== currentListing.id)
            .slice(0, 10)
            .map(service => ({
              originalData: service,
              id: service.id,
              isService: true,
              title: service.service_name,
              description: service.service_description,
              images: [service.featured_image, ...(service.gallery_images || [])].filter(Boolean),
              price: {
                min: service.starting_price || 0,
                max: service.max_price || service.starting_price || 0
              },
              location: service.city_details?.full_address || 'Location not specified',
              tags: service.tags ? service.tags.split(',').map(tag => tag.trim()) : [],
              vendor: {
                name: service.user_details?.first_name && service.user_details?.last_name 
                  ? `${service.user_details.first_name} ${service.user_details.last_name}`
                  : service.user_details?.username || 'Unknown User',
                image: '/avatar.jpeg',
                rating: service.average_rating || 0
              },
              slug: service.slug
            }));
        } else {
          const products = await productService.getProductsArray();
          items = products
            .filter(product => product.id !== currentListing.id)
            .slice(0, 10)
            .map(product => ({
              originalData: product,
              id: product.id,
              isService: false,
              title: product.product_name,
              description: product.product_description,
              images: [product.product_image, ...(product.gallery_images || [])].filter(Boolean),
              price: product.product_price ?? 0,
              location: `${product.product_city || ''}, ${product.product_state || ''}, ${product.product_country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'Location not specified',
              tags: product.tags ? product.tags.split(',').map(tag => tag.trim()) : [],
              vendor: {
                name: product.user_details?.first_name && product.user_details?.last_name 
                  ? `${product.user_details.first_name} ${product.user_details.last_name}`
                  : product.user_details?.username || 'Unknown User',
                image: '/avatar.jpeg',
                rating: product.average_rating || 0
              },
              slug: product.slug
            }));
        }

        setRelatedItems(items);
      } catch (error) {
        console.error('Error fetching related items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [currentListing, isService]);

  const formatPrice = (price: number | { min: number; max: number } | undefined, currencySymbol = '₦') => {
    if (!price) return 'Price not available';
    
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related {isService ? 'Services' : 'Products'}</CardTitle>
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
        <CardTitle>Related {isService ? 'Services' : 'Products'}</CardTitle>
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
                to={`/listing/${item.slug}`}
                className="flex-shrink-0 w-72 mr-4 group block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-10 overflow-hidden rounded-t-lg">
                  <img
                    src={getImageWithFallback(item.images?.[0])}
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
                      {formatPrice(item.price, (item as any).currency_symbol)}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {(item.vendor?.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add Review Modal Component
const AddReviewModal = ({ 
  isOpen, 
  onClose, 
  listing, 
  onReviewAdded 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  listing: UnifiedListing; 
  onReviewAdded: (review: Review) => void;
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      // Mock review submission - replace with actual API call
      const newReview: Review = {
        id: Date.now(),
        rating,
        review: reviewText,
        user_name: 'Current User', // This would come from auth context
        created_at: new Date().toISOString(),
        user_details: {
          first_name: 'Current',
          last_name: 'User'
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onReviewAdded(newReview);
      setRating(0);
      setReviewText('');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{listing.title}</h4>
            <p className="text-sm text-gray-600">Rate your experience with this {listing.isService ? 'service' : 'product'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={rating === 0 || !reviewText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ListingDetail = () => {
  const { slug, id } = useParams<{ slug: string; id?: string }>();
  const [listing, setListing] = useState<UnifiedListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoggedIn] = useState(false); // Mock authentication state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Helper function to find ID by slug
  const findIdBySlug = async (slug: string): Promise<{ id: number; isService: boolean } | null> => {
    try {
      // First, try to find in products
      try {
        const products = await productService.getProductsArray();
        const product = products.find(p => p.slug === slug);
        if (product) {
          return { id: product.id, isService: false };
        }
      } catch (error) {
        console.log('Product search failed, trying services...');
      }

      // Then try services
      try {
        const services = await serviceService.getServicesArray();
        const service = services.find(s => s.slug === slug);
        if (service) {
          return { id: service.id, isService: true };
        }
      } catch (error) {
        console.log('Service search failed');
      }
      
      return null;
    } catch (error) {
      console.error('Error finding ID by slug:', error);
      return null;
    }
  };

  // Helper function to determine if we're dealing with a service or product
  const determineListingType = (): { isService: boolean; itemId: number } | null => {
    const path = window.location.pathname;
    
    // Check if we have an ID parameter (legacy URLs)
    if (id) {
      const itemId = parseInt(id, 10);
      if (isNaN(itemId)) return null;
      
      // Determine type based on URL path
      if (path.includes('/service/')) {
        return { isService: true, itemId };
      } else if (path.includes('/product/')) {
        return { isService: false, itemId };
      }
      
      // Default to product for generic /listing/id/ URLs
      return { isService: false, itemId };
    }
    
    return null;
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: listing?.title || 'Check out this listing',
      text: listing?.description || '',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Final fallback - open share dialog
      const shareText = `Check out this ${listing?.isService ? 'service' : 'product'}: ${listing?.title} - ${url}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    });
  };

  useEffect(() => {
    const fetchListing = async () => {
      if (!slug && !id) return;

      try {
        setLoading(true);
        setError(null);

        let itemId: number;
        let isService: boolean;

        // Handle legacy ID-based URLs
        const legacyType = determineListingType();
        if (legacyType) {
          itemId = legacyType.itemId;
          isService = legacyType.isService;
        } else if (slug) {
          // Handle slug-based URLs - find ID by slug
          const result = await findIdBySlug(slug);
          
          if (!result) {
            setError('Listing not found');
            return;
          }
          
          itemId = result.id;
          isService = result.isService;
        } else {
          setError('Invalid listing identifier');
          return;
        }

        // Fetch the full details using the ID
        let data: Product | Service;
        
        if (isService) {
          data = await serviceService.getService(itemId);
        } else {
          data = await productService.getProduct(itemId);
        }

        // Transform the data to unified format
        const unifiedListing: UnifiedListing = {
          originalData: data,
          id: data.id,
          isService,
          title: isService ? (data as Service).service_name : (data as Product).product_name,
          description: isService ? (data as Service).service_description : (data as Product).product_description,
          images: [
            isService ? (data as Service).featured_image : (data as Product).product_image,
            ...(isService ? (data as Service).gallery_images || [] : (data as Product).gallery_images || [])
          ].filter(Boolean),
          price: isService 
            ? { 
                min: (data as Service).starting_price || 0, 
                max: (data as Service).max_price || (data as Service).starting_price || 0 
              }
            : (data as Product).product_price ?? 0, 
          location: isService 
            ? (data as Service).city_details?.full_address || 'Location not specified'
            : [
                (data as Product).product_city,
                (data as Product).product_state,
                (data as Product).product_country
              ].filter(Boolean).join(', ') || 'Location not specified',
          tags: (isService ? (data as Service).tags : (data as Product).tags)?.split(',').map(tag => tag.trim()) || [],
          vendor: {
            name: data.user_details?.first_name && data.user_details?.last_name 
              ? `${data.user_details.first_name} ${data.user_details.last_name}`
              : data.user_details?.username || 'Unknown User',
            image: '/avatar.jpeg', // Default avatar since API doesn't provide user image
            rating: data.average_rating || 0
          },
          slug: isService ? (data as Service).slug : (data as Product).slug
        };

        setListing(unifiedListing);
        
        // Set initial reviews - properly typed
        const initialReviews: Review[] = (isService 
          ? (data as Service).service_ratings 
          : (data as Product).product_ratings) || [];
        setReviews(initialReviews);
      } catch (err) {
        setError('Failed to load listing details');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [slug, id]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Listing not found'}
            </h1>
            <Link to="/listings">
              <Button>Back to Listings</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number | { min: number; max: number } | undefined) => {
    if (!price) return 'Price not available';
    
    const currencySymbol = (listing as any).currency_symbol || '₦';
    
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

  const handleContactVendor = () => {
    if (!isLoggedIn) {
      alert('Please sign up or log in to contact vendors');
    }
  };

  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
    // Update listing rating (simplified calculation)
    if (listing) {
      const newAverageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating) / (reviews.length + 1);
      setListing({
        ...listing,
        vendor: {
          ...listing.vendor,
          rating: newAverageRating
        }
      });
    }
  };

  const getContactInfo = () => {
    if (listing.isService) {
      const service = listing.originalData as Service;
      return {
        phone: service.provider_phone,
        email: service.provider_email,
        whatsapp: service.provider_whatsapp,
        website: service.provider_website,
        linkedin: service.provider_linkedin
      };
    } else {
      const product = listing.originalData as Product;
      return {
        phone: product.product_provider_phone,
        email: null, // Product interface doesn't have provider_email
        whatsapp: null, // Product interface doesn't have provider_whatsapp
        website: null,
        linkedin: null
      };
    }
  };

  const contactInfo = getContactInfo();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/listings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={getImageWithFallback(listing.images?.[currentImageIndex])}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                      }
                    }}
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {listing.isService && (
                      <Badge className="bg-blue-600 text-white">Service</Badge>
                    )}
                    {!listing.isService && (
                      <Badge className="bg-green-600 text-white">Product</Badge>
                    )}
                    {(listing as any).is_promoted && (
                      <Badge className="bg-yellow-500 text-white">Promoted</Badge>
                    )}
                    {(listing as any).is_featured && (
                      <Badge className="bg-purple-600 text-white">Featured</Badge>
                    )}
                    {(listing as any).is_verified && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Remote service badge */}
                  {listing.isService && (listing.originalData as Service).serves_remote && (
                    <Badge className="absolute top-4 right-4 bg-indigo-600 text-white">
                      Remote Available
                    </Badge>
                  )}

                  {(listing.images?.length || 0) > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {listing.images?.length}
                    </div>
                  )}
                </div>

                {(listing.images?.length || 0) > 1 && (
                  <div className="flex space-x-2 p-4 overflow-x-auto">
                    {listing.images?.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={getImageWithFallback(image)} 
                          alt={`View ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/placeholder.svg') {
                              target.src = '/placeholder.svg';
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Title and Price */}
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
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-2xl font-bold text-blue-600 mb-4">
                 {listing.price ? formatPrice(listing.price) : 'Price not available'}
              </div>

              <div className="flex flex-wrap gap-2">
                {listing.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Service-specific Information */}
            {listing.isService && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(listing.originalData as Service).provider_name && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Provider Name</h4>
                        <p className="text-gray-600">{(listing.originalData as Service).provider_name}</p>
                      </div>
                    )}

                    {(listing.originalData as Service).provider_title && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Provider Title</h4>
                        <p className="text-gray-600">{(listing.originalData as Service).provider_title}</p>
                      </div>
                    )}
                    
                    {(listing.originalData as Service).provider_experience && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Experience</h4>
                        <p className="text-gray-600">{(listing.originalData as Service).provider_experience}</p>
                      </div>
                    )}
                    
                    {(listing.originalData as Service).response_time && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Response Time</h4>
                        <p className="text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {(listing.originalData as Service).response_time}
                        </p>
                      </div>
                    )}
                    
                    {(listing.originalData as Service).availability && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Availability</h4>
                        <p className="text-gray-600">{(listing.originalData as Service).availability}</p>
                      </div>
                    )}

                    {(listing.originalData as Service).price_type && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Price Type</h4>
                        <p className="text-gray-600 capitalize">{(listing.originalData as Service).price_type}</p>
                      </div>
                    )}
                  </div>

                  {(listing.originalData as Service).provider_bio && (
                    <div>
                      <h4 className="font-semibold text-gray-900">About Provider</h4>
                      <p className="text-gray-600">{(listing.originalData as Service).provider_bio}</p>
                    </div>
                  )}

                  {(listing.originalData as Service).provider_expertise && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Expertise</h4>
                      <p className="text-gray-600">{(listing.originalData as Service).provider_expertise}</p>
                    </div>
                  )}

                  {(listing.originalData as Service).provider_certifications && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Certifications</h4>
                      <p className="text-gray-600">{(listing.originalData as Service).provider_certifications}</p>
                    </div>
                  )}

                  {(listing.originalData as Service).provider_languages && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Languages</h4>
                      <p className="text-gray-600">{(listing.originalData as Service).provider_languages}</p>
                    </div>
                  )}

                  {(listing.originalData as Service).serves_remote && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 flex items-center">
                        <LocationIcon className="h-4 w-4 mr-2" />
                        Remote Service Available
                      </h4>
                      <p className="text-blue-700 text-sm mt-1">
                        This service provider offers remote services
                        {(listing.originalData as Service).service_radius && ` within ${(listing.originalData as Service).service_radius}km`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Product-specific Information */}
            {!listing.isService && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(listing.originalData as Product).product_brand && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Brand</h4>
                        <p className="text-gray-600">{(listing.originalData as Product).product_brand}</p>
                      </div>
                    )}
                    
                    {(listing.originalData as Product).product_category && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Category</h4>
                        <p className="text-gray-600">{(listing.originalData as Product).product_category}</p>
                      </div>
                    )}
                    
                    {(listing.originalData as Product).product_status && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Status</h4>
                        <Badge variant="outline" className="capitalize">
                          {(listing.originalData as Product).product_status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reviews ({reviews.length})</CardTitle>
                {isLoggedIn && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    Add Review
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {!isLoggedIn && (
                  <Alert>
                    <AlertDescription>
                      <Link to="/auth/signup" className="text-blue-600 hover:underline">
                        Sign up
                      </Link> to add a review
                    </AlertDescription>
                  </Alert>
                )}
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet. Be the first to review this {listing.isService ? 'service' : 'product'}!</p>
                  </div>
                ) : (
                  reviews.slice(0, 5).map((rating: Review) => (
                    <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {rating.user_details?.first_name?.[0] || rating.user_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {rating.user_details?.first_name && rating.user_details?.last_name 
                                ? `${rating.user_details.first_name} ${rating.user_details.last_name}`
                                : rating.user_name}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{rating.review}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {reviews.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      View All Reviews ({reviews.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Items */}
            <RelatedItems currentListing={listing} isService={listing.isService || false} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {listing.isService ? 'Service Provider' : 'Vendor'} Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={listing.vendor?.image} alt={listing.vendor?.name} />
                    <AvatarFallback>{listing.vendor?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{listing.vendor?.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm">{(listing.vendor?.rating || 0).toFixed(1)} rating</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm text-gray-600">
                  <div>Views: {(listing.originalData as any).views_count || 0}</div>
                  {listing.isService && (
                    <div>Contacts: {(listing.originalData as Service).contacts_count || 0}</div>
                  )}
                  <div>Member since: {new Date((listing.originalData as any).created_at || Date.now()).getFullYear()}</div>
                  {listing.isService && (listing.originalData as Service).response_time && (
                    <div>Response time: {(listing.originalData as Service).response_time}</div>
                  )}
                </div>

                {/* Contact Information */}
                {(contactInfo.phone || contactInfo.email || contactInfo.whatsapp) && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Contact Info</h4>
                      {contactInfo.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {contactInfo.phone}
                        </div>
                      )}
                      {contactInfo.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {contactInfo.email}
                        </div>
                      )}
                      {contactInfo.whatsapp && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp: {contactInfo.whatsapp}
                        </div>
                      )}
                      {contactInfo.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      {contactInfo.linkedin && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardContent className="pt-6">
                {!isLoggedIn && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      <Link to="/auth/signup" className="text-blue-600 hover:underline">
                        Sign up
                      </Link> to contact {listing.isService ? 'service providers' : 'vendors'}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleContactVendor}
                    disabled={!isLoggedIn}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact {listing.isService ? 'Provider' : 'Vendor'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!isLoggedIn}
                  >
                    {listing.isService ? 'Request Quote' : 'Add to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Always verify {listing.isService ? 'provider' : 'vendor'} credentials</li>
                  <li>• Meet in public places for local transactions</li>
                  <li>• Use secure payment methods</li>
                  <li>• Report suspicious activity</li>
                  {listing.isService && <li>• Request portfolio or previous work samples</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Review Modal */}
        <AddReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          listing={listing}
          onReviewAdded={handleReviewAdded}
        />
      </div>
    </Layout>
  );
};

export default ListingDetail;