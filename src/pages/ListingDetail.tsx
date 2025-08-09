import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { listingService } from '@/service/listingService';
import { useAuth } from '@/hooks/useAuth';
import { ImageGallery } from '@/components/ListingDetail/ImageGallery';
import { ListingHeader } from '@/components/ListingDetail/ListingHeader';
import { ServiceDetails } from '@/components/ListingDetail/ServiceDetails';
import { ProductDetails } from '@/components/ListingDetail/ProductDetails';
import { ReviewsSection } from '@/components/ListingDetail/ReviewsSection';
import { VendorSidebar } from '@/components/ListingDetail/VendorSidebar';
import { SkeletonLoader } from '@/components/ListingDetail/SkeletonLoader';
import { ErrorDisplay } from '@/components/ListingDetail/ErrorDisplay';
import { RelatedItems } from '@/components/ListingDetail/RelatedItems';
import { AddReviewModal } from '@/components/ListingDetail/AddReviewModal';
import { useReviews } from '@/hooks/useReviews';
import { ErrorType, type ErrorState, type UnifiedListing,  type Product, type Service } from '@/types/listing';
import type { ProductRating, ServiceRating } from '@/service/reviewsService';

// Helper functions
const getImageWithFallback = (src: string | undefined): string => {
  return src || '/placeholder.svg';
};

const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const networkKeywords = [
    'network',
    'fetch',
    'connection',
    'timeout',
    'cors',
    'failed to fetch',
    'networkerror',
    'net::',
    'offline'
  ];
  
  return networkKeywords.some(keyword => errorString.includes(keyword)) ||
         error.name === 'NetworkError' ||
         error.code === 'NETWORK_ERROR' ||
         !navigator.onLine;
};

const ListingDetail = () => {
  const { slug, id } = useParams<{ slug: string; id?: string }>();
  const [listing, setListing] = useState<UnifiedListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductRating | ServiceRating | null>(null);

  // Use auth hook
  const { isAuthenticated, getStoredUser } = useAuth();
  const currentUser = getStoredUser();
  
  // FIXED: useReviews now properly handles slug-based reviews with safe initialization
  const {
    // ratings,
    // loading: reviewsLoading,
    // error: reviewsError,
    createRating,
    updateRating,
    averageRating,
    totalCount
  } = useReviews(
    listing?.slug || '', // Use slug instead of ID
    listing?.isService || false,
    {
      autoFetch: !!listing?.slug // Auto-fetch when slug is available
    }
  );
 
  const handleSubmitReview = async (reviewData: any): Promise<ProductRating | ServiceRating> => {
    if (!listing) throw new Error('Listing not found');

    console.log(`=== ListingDetail: Submitting review for slug "${listing.slug}" ===`);

    try {
      if (isEditMode && editingReview) {
        // Update existing review
        return await updateRating(editingReview.id, reviewData);
      } else {
        // Create new review
        return await createRating(reviewData);
      }
    } catch (error) {
      console.error('Error in handleSubmitReview:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Handle review added/updated
  const handleReviewAdded = (review: ProductRating | ServiceRating) => {
    console.log('Review added/updated:', review);
    
    // Update listing's average rating and count with latest values from hook
    if (listing && (averageRating > 0 || totalCount > 0)) {
      setListing(prevListing => prevListing ? {
        ...prevListing,
        rating: averageRating,
        ratingCount: totalCount
      } : null);
    }
  };

  // Handle edit review
  const handleEditReview = (review: ProductRating | ServiceRating) => {
    console.log('Editing review:', review);
    setEditingReview(review);
    setIsEditMode(true);
    setIsReviewModalOpen(true);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsReviewModalOpen(false);
    setIsEditMode(false);
    setEditingReview(null);
  };

  // Check if current user is the vendor/owner of this listing
  const isCurrentUserVendor = currentUser && listing && 
    currentUser.id === (listing.originalData as any).user_id;

  // Enhanced slug-based fetching using ListingService
  const fetchListing = async () => {
    if (!slug && !id) {
      console.warn('No slug or ID provided to ListingDetail');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`=== ListingDetail: Fetching listing ===`);
      console.log('Slug:', slug);
      console.log('ID:', id);
      console.log('Current path:', window.location.pathname);

      let fetchedListing: UnifiedListing | null = null;

      if (slug) {
        // Try to determine if it's a service or product from the URL path
        const isServiceFromPath = window.location.pathname.includes('/service/');
        const isProductFromPath = window.location.pathname.includes('/product/');
        
        console.log('Path detection:', { isServiceFromPath, isProductFromPath });
        
        if (isServiceFromPath) {
          // Fetch service by slug
          console.log('Fetching service by slug...');
          fetchedListing = await listingService.getListingBySlug(slug, 'service');
        } else if (isProductFromPath) {
          // Fetch product by slug
          console.log('Fetching product by slug...');
          fetchedListing = await listingService.getListingBySlug(slug, 'product');
        } else {
          // Use smart detection for generic /listing/:slug routes
          console.log('Using smart slug detection...');
          fetchedListing = await listingService.getListingBySlugSmart(slug);
        }
      } else if (id) {
        // Legacy ID-based handling
        console.log('Using legacy ID-based fetching...');
        fetchedListing = await listingService.getListing(id);
      }

      if (!fetchedListing) {
        console.error('No listing found');
        setError({
          type: ErrorType.NOT_FOUND,
          message: 'Listing not found'
        });
        return;
      }

      console.log('✓ Listing fetched successfully:', {
        id: fetchedListing.id,
        slug: fetchedListing.slug,
        title: fetchedListing.title,
        isService: fetchedListing.isService
      });

      setListing(fetchedListing);
      
      // Warm cache for related listings
      listingService.warmCacheForListing(fetchedListing);
      
    } catch (err: any) {
      console.error('Error fetching listing:', err);
      
      if (isNetworkError(err)) {
        setError({
          type: ErrorType.NETWORK,
          message: 'Please check your internet connection and try again.'
        });
      } else if (err.message?.includes('not found') || err.status === 404) {
        setError({
          type: ErrorType.NOT_FOUND,
          message: 'Listing not found'
        });
      } else {
        setError({
          type: ErrorType.GENERIC,
          message: err.message || 'Failed to load listing details'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [slug, id]);

  // FIXED: Update listing ratings when review data changes with proper safety checks
  useEffect(() => {
    if (listing && typeof averageRating === 'number' && typeof totalCount === 'number' && averageRating >= 0 && totalCount >= 0) {
      // Only update if the values have actually changed
      if (listing.rating !== averageRating || listing.ratingCount !== totalCount) {
        console.log(`Updating listing ratings: ${listing.rating} -> ${averageRating}, ${listing.ratingCount} -> ${totalCount}`);
        
        setListing(prevListing => prevListing ? {
          ...prevListing,
          rating: averageRating,
          ratingCount: totalCount
        } : null);
      }
    }
  }, [averageRating, totalCount, listing]);

  const handleRetry = () => {
    fetchListing();
  };

  const formatPrice = (price: number | { min: number; max: number } | null | undefined) => {
    if (!price && price !== 0) return 'Price not available';
    
    const currencySymbol = (listing?.originalData as any)?.currency_symbol || '₦';
    
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
      const shareText = `Check out this ${listing?.isService ? 'service' : 'product'}: ${listing?.title} - ${url}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    });
  };

  const handleContactVendor = () => {
    if (!isAuthenticated()) {
      alert('Please sign up or log in to contact vendors');
    }
  };

  const getContactInfo = () => {
    if (listing?.isService) {
      const service = listing.originalData as Service;
      return {
        phone: service.provider_phone,
        email: service.provider_email,
        whatsapp: service.provider_whatsapp,
        website: service.provider_website,
        linkedin: service.provider_linkedin
      };
    } else {
      const product = listing?.originalData as Product;
      return {
        phone: product?.product_provider_phone,
        email: undefined,
        whatsapp: undefined,
        website: undefined,
        linkedin: undefined
      };
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  if (!listing) {
    return <ErrorDisplay error={{ type: ErrorType.NOT_FOUND, message: 'Listing not found' }} onRetry={handleRetry} />;
  }

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
            <ImageGallery
              listing={listing}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              getImageWithFallback={getImageWithFallback}
            />

            {/* Title and Price */}
            <ListingHeader
              listing={listing}
              formatPrice={formatPrice}
              onShare={handleShare}
            />

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

            {/* Service/Product-specific Information */}
            {listing.isService ? (
              <ServiceDetails service={listing.originalData as Service} />
            ) : (
              <ProductDetails product={listing.originalData as Product} />
            )}

            {/* Reviews Section - Now uses slug */}
            <ReviewsSection
              listingSlug={listing.slug ?? ""} // Changed from listingId to listingSlug
              isService={listing.isService}
              isAuthenticated={isAuthenticated()}
              currentUserId={currentUser?.id}
              onAddReview={() => {
                console.log(`Opening review modal for listing slug: ${listing.slug}`);
                setIsReviewModalOpen(true);
              }}
              onEditReview={handleEditReview}
            />

            {/* Related Items */}
            <RelatedItems currentListing={listing} />
          </div>

          {/* Sidebar */}
          <VendorSidebar
            listing={listing}
            contactInfo={contactInfo}
            isAuthenticated={isAuthenticated()}
            isCurrentUserVendor={!!isCurrentUserVendor}
            onContactVendor={handleContactVendor}
          />
        </div>

        {/* FIXED: AddReviewModal with proper props and error handling */}
        {listing && (
          <AddReviewModal
            isOpen={isReviewModalOpen}
            onClose={handleCloseModal}
            listing={listing}
            onReviewAdded={handleReviewAdded}
            onSubmitReview={handleSubmitReview}
            editMode={isEditMode}
            existingReview={editingReview}
          />
        )}
      </div>
    </Layout>
  );
};

export default ListingDetail;