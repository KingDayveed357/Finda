// Fixed AddReviewModal component with proper error handling and prop types
import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReviewForm } from '@/hooks/useReviews';
import { StarRating } from '@/components/StarRating';
import type { UnifiedListing } from '@/types/listing';
import type { ProductRating, ServiceRating } from '@/service/reviewsService';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: UnifiedListing;
  onReviewAdded: (review: ProductRating | ServiceRating) => void;
  onSubmitReview: (reviewData: any) => Promise<ProductRating | ServiceRating>;
  editMode?: boolean;
  existingReview?: ProductRating | ServiceRating | null;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  listing,
  onReviewAdded,
  onSubmitReview,
  editMode = false,
  existingReview = null
}) => {
  // Memoize the isService value to prevent unnecessary re-renders
  const isService = useMemo(() => listing.isService, [listing.isService]);
  const form = useReviewForm(isService);

  // Populate form with existing review data when in edit mode
  useEffect(() => {
    if (editMode && existingReview && isOpen) {
      console.log('Populating form with existing review:', existingReview);
      
      // Set common fields
      form.setRating(existingReview.rating);
      form.setReviewText(existingReview.review);
      form.setWouldRecommend(existingReview.would_recommend);
      
      if (existingReview.review_title) {
        form.setReviewTitle(existingReview.review_title);
      }

      // Set type-specific fields
      if (isService && 'communication_rating' in existingReview) {
        const serviceReview = existingReview as ServiceRating;
        form.setCommunicationRating(serviceReview.communication_rating);
        form.setQualityRating(serviceReview.quality_rating);
        form.setTimelinessRating(serviceReview.timeliness_rating);
        form.setWouldHireAgain(serviceReview.would_hire_again);
      } else if (!isService && 'pros' in existingReview) {
        const productReview = existingReview as ProductRating;
        if (productReview.pros) form.setPros(productReview.pros);
        if (productReview.cons) form.setCons(productReview.cons);
      }
    } else if (!editMode && isOpen) {
      // Reset form when opening in create mode
      form.resetForm();
    }
  }, [isOpen, editMode, existingReview, isService]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.validateForm()) {
      console.log('Form validation failed:', form.errors);
      return;
    }

    try {
      // Set submitting state
      form.resetForm();
      
      const formData = form.getFormData();
      
      // Extensive debugging for decimal support
      console.log('=== DEBUGGING DECIMAL FORM DATA ===');
      console.log('Raw form data:', formData);
      console.log('Rating value:', formData.rating);
      console.log('Rating type:', typeof formData.rating);
      console.log('Rating is decimal?', formData.rating % 1 !== 0);
      console.log('Full payload JSON:', JSON.stringify(formData, null, 2));
      
      if (isService) {
        const serviceData = formData as any;
        console.log('Service sub-ratings:', {
          communication: serviceData.communication_rating,
          quality: serviceData.quality_rating,
          timeliness: serviceData.timeliness_rating
        });
      }
      console.log('================================');
      
      const newReview = await onSubmitReview(formData);
      
      console.log('Review submitted successfully:', newReview);
      onReviewAdded(newReview);
      form.resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Set error in form state
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit review';
      console.error('Setting form error:', errorMessage);
      
      // You might want to show this error in the UI
      alert(`Error: ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-xs transition-all duration-300 ease-in-out">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {editMode ? 'Edit Review' : 'Add Review'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{listing.title}</h4>
            <p className="text-sm text-gray-600">
              {editMode ? 'Update your experience with' : 'Share your experience with'} this {listing.isService ? 'service' : 'product'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Overall Rating */}
            <StarRating
              rating={form.rating}
              onRatingChange={form.setRating}
              label="Overall Rating"
              error={form.errors.rating}
              size="md"
              showValue={true}
            />

            {/* Service-specific ratings */}
            {listing.isService && (
              <>
                <StarRating
                  rating={form.communicationRating}
                  onRatingChange={form.setCommunicationRating}
                  label="Communication"
                  error={form.errors.communicationRating}
                  size="md"
                  showValue={true}
                />
                <StarRating
                  rating={form.qualityRating}
                  onRatingChange={form.setQualityRating}
                  label="Quality of Work"
                  error={form.errors.qualityRating}
                  size="md"
                  showValue={true}
                />
                <StarRating
                  rating={form.timelinessRating}
                  onRatingChange={form.setTimelinessRating}
                  label="Timeliness"
                  error={form.errors.timelinessRating}
                  size="md"
                  showValue={true}
                />
              </>
            )}

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={form.reviewTitle}
                onChange={(e) => form.setReviewTitle(e.target.value)}
                placeholder="Give your review a title..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                maxLength={100}
              />
              {form.errors.reviewTitle && (
                <p className="text-sm text-red-500 mt-1">{form.errors.reviewTitle}</p>
              )}
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.reviewText}
                onChange={(e) => form.setReviewText(e.target.value)}
                placeholder="Share your detailed experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                {form.errors.reviewText && (
                  <p className="text-sm text-red-500">{form.errors.reviewText}</p>
                )}
                <p className="text-sm text-gray-400 ml-auto">
                  {form.reviewText.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Product-specific fields */}
            {!listing.isService && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pros (Optional)
                  </label>
                  <textarea
                    value={form.pros}
                    onChange={(e) => form.setPros(e.target.value)}
                    placeholder="What did you like most about this product?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {form.errors.pros && (
                      <p className="text-sm text-red-500">{form.errors.pros}</p>
                    )}
                    <p className="text-sm text-gray-400 ml-auto">
                      {form.pros.length}/500 characters
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cons (Optional)
                  </label>
                  <textarea
                    value={form.cons}
                    onChange={(e) => form.setCons(e.target.value)}
                    placeholder="What could be improved about this product?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {form.errors.cons && (
                      <p className="text-sm text-red-500">{form.errors.cons}</p>
                    )}
                    <p className="text-sm text-gray-400 ml-auto">
                      {form.cons.length}/500 characters
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you recommend this {listing.isService ? 'service' : 'product'}?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    checked={form.wouldRecommend === true}
                    onChange={() => form.setWouldRecommend(true)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Yes, I recommend it</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    checked={form.wouldRecommend === false}
                    onChange={() => form.setWouldRecommend(false)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">No, I don't recommend it</span>
                </label>
              </div>
            </div>

            {/* Service-specific: Would hire again */}
            {listing.isService && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Would you hire this service provider again?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="hireAgain"
                      checked={form.wouldHireAgain === true}
                      onChange={() => form.setWouldHireAgain(true)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Yes, I would hire again</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="hireAgain"
                      checked={form.wouldHireAgain === false}
                      onChange={() => form.setWouldHireAgain(false)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">No, I wouldn't hire again</span>
                  </label>
                </div>
              </div>
            )}

            {/* Error display */}
            {Object.keys(form.errors).length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  Please fix the errors above before submitting your review.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-all hover:bg-gray-50"
                disabled={form.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 transition-all"
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  `${editMode ? 'Update' : 'Submit'} Review`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};