// components/ListingDetail/ReviewsSection.tsx - Updated for slug-based endpoints
import React, { useState } from 'react';
import { Star, MessageCircle, Filter, SortDesc, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useReviews } from '@/hooks/useReviews';
import type { ProductRating, ServiceRating } from '@/service/reviewsService';

// UPDATED: Props now accept slug instead of ID
interface ReviewsSectionProps {
  listingSlug: string; // Changed from listingId to listingSlug
  isService: boolean;
  isAuthenticated: boolean;
  currentUserId?: number;
  onAddReview: () => void;
  onEditReview?: (review: ProductRating | ServiceRating) => void;
}

interface ReviewItemProps {
  review: ProductRating | ServiceRating;
  isService: boolean;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ 
  review, 
  isService, 
  canEdit, 
  onEdit, 
  onDelete 
}) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const isLongReview = review.review.length > 300;

  // Type guards for safe access to service/product specific properties
  const isServiceRating = (rating: ProductRating | ServiceRating): rating is ServiceRating => {
    return 'communication_rating' in rating;
  };

  const isProductRating = (rating: ProductRating | ServiceRating): rating is ProductRating => {
    return 'is_verified_purchase' in rating;
  };

  // Helper function to render star rating with decimal support
  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          let starClassName = `${starClass} text-gray-300`;
          
          // Full star
          if (starValue <= Math.floor(rating)) {
            starClassName = `${starClass} fill-yellow-400 text-yellow-400`;
          }
          // Half star
          else if (starValue - 0.5 <= rating) {
            starClassName = `${starClass} fill-yellow-400 text-yellow-400 opacity-50`;
          }
          
          return (
            <Star key={i} className={starClassName} />
          );
        })}
        {/* Show decimal rating */}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback>
            {review.user_details?.first_name?.[0] || review.user_name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">
                  {review.user_details?.first_name && review.user_details?.last_name 
                    ? `${review.user_details.first_name} ${review.user_details.last_name}`
                    : review.user_name}
                </span>
                
                {/* FIXED: Type-safe access to verification badges */}
                {isProductRating(review) && review.is_verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
                
                {isServiceRating(review) && review.is_verified_customer && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Customer
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {renderStarRating(review.rating)}
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    •••
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Review
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Review Title */}
          {review.review_title && (
            <h4 className="font-medium text-gray-900 mb-2">
              {review.review_title}
            </h4>
          )}

          {/* UPDATED: Service-specific ratings with decimal support */}
          {isService && isServiceRating(review) && (
            <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {renderStarRating(review.communication_rating, 'sm')}
                </div>
                <p className="text-xs text-gray-600">Communication ({review.communication_rating.toFixed(1)})</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {renderStarRating(review.quality_rating, 'sm')}
                </div>
                <p className="text-xs text-gray-600">Quality ({review.quality_rating.toFixed(1)})</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {renderStarRating(review.timeliness_rating, 'sm')}
                </div>
                <p className="text-xs text-gray-600">Timeliness ({review.timeliness_rating.toFixed(1)})</p>
              </div>
            </div>
          )}

          {/* Review Text */}
          <div className="mb-3">
            <p className="text-gray-700 leading-relaxed">
              {isLongReview && !showFullReview 
                ? `${review.review.substring(0, 300)}...`
                : review.review
              }
            </p>
            
            {isLongReview && (
              <button
                onClick={() => setShowFullReview(!showFullReview)}
                className="text-blue-600 text-sm hover:underline mt-1"
              >
                {showFullReview ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* UPDATED: Product-specific pros/cons with type safety */}
          {!isService && isProductRating(review) && (review.pros || review.cons) && (
            <div className="space-y-2 mb-3">
              {review.pros && (
                <div className="flex items-start space-x-2">
                  <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Pros</p>
                    <p className="text-sm text-gray-600">{review.pros}</p>
                  </div>
                </div>
              )}
              
              {review.cons && (
                <div className="flex items-start space-x-2">
                  <ThumbsUp className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0 rotate-180" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Cons</p>
                    <p className="text-sm text-gray-600">{review.cons}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPDATED: Recommendation badges with type safety */}
          <div className="flex items-center space-x-2 mb-2">
            {review.would_recommend && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                ✓ Recommends
              </Badge>
            )}
            
            {isService && isServiceRating(review) && review.would_hire_again && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                ✓ Would hire again
              </Badge>
            )}
          </div>

          {/* Helpful count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ThumbsUp className="h-4 w-4" />
              <span>{review.helpful_count} found this helpful</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UPDATED: ReviewsSection now uses slug instead of ID
export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  listingSlug, // Changed from listingId
  isService,
  isAuthenticated,
  currentUserId,
  onAddReview,
  onEditReview
}) => {
  console.log(`=== ReviewsSection: Rendering for slug "${listingSlug}" ===`);

  const {
    ratings,
    loading,
    error,
    averageRating,
    totalCount,
    ratingDistribution,
    deleteRating,
    sortRatings,
    filterByMinRating,
    clearFilters
  } = useReviews(listingSlug, isService); // Using slug instead of ID

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentSort, setCurrentSort] = useState<'date' | 'rating' | 'helpful'>('date');
  const [currentFilter, setCurrentFilter] = useState<number | undefined>(undefined);

  const displayedReviews = showAllReviews ? ratings : ratings.slice(0, 5);

  const handleSort = (sortBy: 'date' | 'rating' | 'helpful') => {
    setCurrentSort(sortBy);
    sortRatings(sortBy);
  };

  const handleFilter = (minRating?: number) => {
    setCurrentFilter(minRating);
    if (minRating) {
      filterByMinRating(minRating);
    } else {
      clearFilters();
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteRating(reviewId);
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  // Enhanced star rating display with decimal support
  const renderOverallRating = () => {
    if (averageRating === 0) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            let starClassName = 'h-5 w-5 text-gray-300';
            
            // Full star
            if (starValue <= Math.floor(averageRating)) {
              starClassName = 'h-5 w-5 fill-yellow-400 text-yellow-400';
            }
            // Half star
            else if (starValue - 0.5 <= averageRating) {
              starClassName = 'h-5 w-5 fill-yellow-400 text-yellow-400 opacity-50';
            }
            
            return <Star key={i} className={starClassName} />;
          })}
        </div>
        <span className="font-normal text-base">
          {averageRating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Loading state
  if (loading && totalCount === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Early return if no slug is provided
  if (!listingSlug) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert className="border-yellow-200">
            <AlertDescription className="text-yellow-700">
              Unable to load reviews: Invalid listing identifier.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Reviews ({totalCount})</span>
              {renderOverallRating()}
            </CardTitle>

            {/* Enhanced rating distribution with decimal averages */}
            {totalCount > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(ratingDistribution)
                  .reverse()
                  .map(([stars, count]) => (
                  <div key={stars} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ 
                          width: totalCount > 0 ? `${(count / totalCount) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-gray-500 w-8">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {currentFilter && (
                    <Badge variant="secondary" className="ml-2">
                      {currentFilter}+ ★
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilter()}>
                  All Reviews
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilter(5)}>
                  5 Stars Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilter(4)}>
                  4+ Stars
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilter(3)}>
                  3+ Stars
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('date')}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('rating')}>
                  Highest Rated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('helpful')}>
                  Most Helpful
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Review Button */}
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAddReview}
              >
                Add Review
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Auth prompt */}
        {!isAuthenticated && (
          <Alert>
            <AlertDescription>
              <Link to="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link> to add a review and help others make informed decisions
            </AlertDescription>
          </Alert>
        )}

        {/* Error state */}
        {error && (
          <Alert className="border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Empty state */}
        {totalCount === 0 && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-lg mb-2">No reviews yet</h3>
            <p className="mb-4">Be the first to share your experience!</p>
            {isAuthenticated && (
              <Button onClick={onAddReview}>
                Write the First Review
              </Button>
            )}
          </div>
        )}

        {/* Reviews list */}
        {displayedReviews.length > 0 && (
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isService={isService}
                canEdit={currentUserId === review.user}
                onEdit={() => onEditReview?.(review)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))}
          </div>
        )}
        
        {/* Show more/less button */}
        {ratings.length > 5 && (
          <div className="text-center pt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowAllReviews(!showAllReviews)}
            >
              {showAllReviews 
                ? `Show Less` 
                : `View All Reviews (${totalCount})`
              }
            </Button>
          </div>
        )}

        {/* Loading more reviews */}
        {loading && totalCount > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};