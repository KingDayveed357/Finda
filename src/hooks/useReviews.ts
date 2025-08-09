// hooks/useReviews.ts - Fixed with proper type safety and array initialization
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  reviewsService, 
  type ProductRating, 
  type ServiceRating, 
  type CreateProductRatingRequest, 
  type CreateServiceRatingRequest,
  type UpdateProductRatingRequest,
  type UpdateServiceRatingRequest
} from '@/service/reviewsService';

export interface UseReviewsState {
  ratings: (ProductRating | ServiceRating)[];
  loading: boolean;
  error: string | null;
  averageRating: number;
  totalCount: number;
  ratingDistribution: Record<number, number>;
}

export interface UseReviewsActions {
  refetch: () => Promise<void>;
  createRating: (ratingData: CreateProductRatingRequest | CreateServiceRatingRequest) => Promise<ProductRating | ServiceRating>;
  updateRating: (ratingId: number, ratingData: UpdateProductRatingRequest | UpdateServiceRatingRequest) => Promise<ProductRating | ServiceRating>;
  deleteRating: (ratingId: number) => Promise<void>;
  sortRatings: (sortBy: 'rating' | 'date' | 'helpful', order?: 'asc' | 'desc') => void;
  filterByMinRating: (minRating: number) => void;
  clearFilters: () => void;
}

export interface UseReviewsOptions {
  autoFetch?: boolean;
  sortBy?: 'rating' | 'date' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  minRating?: number;
}

// Updated to use slug-based approach
export function useReviews(
  listingSlug: string,
  isService: boolean,
  options: UseReviewsOptions = {}
): UseReviewsState & UseReviewsActions {
  const {
    autoFetch = true,
    sortBy = 'date',
    sortOrder = 'desc',
    minRating
  } = options;

  const [state, setState] = useState<UseReviewsState>({
    ratings: [],
    loading: false,
    error: null,
    averageRating: 0,
    totalCount: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // FIXED: Initialize allRatings as empty array to prevent iteration errors
  const [allRatings, setAllRatings] = useState<(ProductRating | ServiceRating)[]>([]);
  const [currentFilters, setCurrentFilters] = useState({
    sortBy,
    sortOrder,
    minRating
  });

  // Calculate derived state from ratings
  const updateDerivedState = useCallback((ratings: (ProductRating | ServiceRating)[]) => {
    // FIXED: Ensure ratings is always an array
    const safeRatings = Array.isArray(ratings) ? ratings : [];
    const averageRating = reviewsService.calculateAverageRating(safeRatings);
    const ratingDistribution = reviewsService.getRatingDistribution(safeRatings);
    
    setState(prev => ({
      ...prev,
      ratings: safeRatings,
      averageRating,
      totalCount: safeRatings.length,
      ratingDistribution
    }));
  }, []);

  // Apply filters and sorting to ratings
  const applyFiltersAndSorting = useCallback((ratings: (ProductRating | ServiceRating)[]) => {
    // FIXED: Ensure ratings is always an array
    const safeRatings = Array.isArray(ratings) ? [...ratings] : [];
    let filteredRatings = safeRatings;

    // Apply minimum rating filter
    if (currentFilters.minRating !== undefined) {
      filteredRatings = reviewsService.filterRatingsByMinimum(filteredRatings, currentFilters.minRating);
    }

    // Apply sorting
    filteredRatings = reviewsService.sortRatings(
      filteredRatings,
      currentFilters.sortBy,
      currentFilters.sortOrder
    );

    updateDerivedState(filteredRatings);
  }, [currentFilters, updateDerivedState]);

  // UPDATED: Fetch ratings using slug instead of ID
  const fetchRatings = useCallback(async () => {
    if (!listingSlug) {
      console.warn('No listing slug provided to useReviews');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`=== useReviews: Fetching ratings for slug "${listingSlug}" ===`);
      
      const ratings = await reviewsService.getListingRatingsBySlug(listingSlug, isService);
      
      // FIXED: Ensure we always set an array
      const safeRatings = Array.isArray(ratings) ? ratings : [];
      setAllRatings(safeRatings);
      applyFiltersAndSorting(safeRatings);
      
      console.log(`✓ useReviews: Successfully fetched ${safeRatings.length} ratings`);
    } catch (err: any) {
      console.error('Error fetching ratings:', err);
      
      // FIXED: Set empty array on error to prevent iteration issues
      setAllRatings([]);
      
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch ratings',
        ratings: [],
        averageRating: 0,
        totalCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [listingSlug, isService, applyFiltersAndSorting]);

  // FIXED: Create new rating using slug with proper error handling
  const createRating = useCallback(async (
    ratingData: CreateProductRatingRequest | CreateServiceRatingRequest
  ): Promise<ProductRating | ServiceRating> => {
    if (!listingSlug) {
      throw new Error('No listing slug provided');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`=== useReviews: Creating rating for slug "${listingSlug}" ===`);
      
      const newRating = await reviewsService.createListingRatingBySlug(listingSlug, isService, ratingData);
      
      // FIXED: Ensure allRatings is always an array before spreading
      const currentRatings = Array.isArray(allRatings) ? allRatings : [];
      const updatedRatings = [newRating, ...currentRatings];
      
      setAllRatings(updatedRatings);
      applyFiltersAndSorting(updatedRatings);

      console.log('✓ useReviews: Successfully created rating');
      return newRating;
    } catch (error) {
      console.error('Error creating rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rating';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [listingSlug, isService, allRatings, applyFiltersAndSorting]);

  // FIXED: Update existing rating using slug with proper error handling
  const updateRating = useCallback(async (
    ratingId: number,
    ratingData: UpdateProductRatingRequest | UpdateServiceRatingRequest
  ): Promise<ProductRating | ServiceRating> => {
    if (!listingSlug) {
      throw new Error('No listing slug provided');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`=== useReviews: Updating rating ${ratingId} for slug "${listingSlug}" ===`);
      
      const updatedRating = await reviewsService.updateListingRatingBySlug(
        listingSlug,
        ratingId,
        isService,
        ratingData
      );

      // FIXED: Ensure allRatings is always an array before mapping
      const currentRatings = Array.isArray(allRatings) ? allRatings : [];
      const updatedRatings = currentRatings.map(rating => 
        rating.id === ratingId ? updatedRating : rating
      );
      
      setAllRatings(updatedRatings);
      applyFiltersAndSorting(updatedRatings);

      console.log('✓ useReviews: Successfully updated rating');
      return updatedRating;
    } catch (error) {
      console.error('Error updating rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update rating';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [listingSlug, isService, allRatings, applyFiltersAndSorting]);

  // FIXED: Delete rating using slug with proper error handling
  const deleteRating = useCallback(async (ratingId: number): Promise<void> => {
    if (!listingSlug) {
      throw new Error('No listing slug provided');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`=== useReviews: Deleting rating ${ratingId} for slug "${listingSlug}" ===`);
      
      await reviewsService.deleteListingRatingBySlug(listingSlug, ratingId, isService);

      // FIXED: Ensure allRatings is always an array before filtering
      const currentRatings = Array.isArray(allRatings) ? allRatings : [];
      const updatedRatings = currentRatings.filter(rating => rating.id !== ratingId);
      
      setAllRatings(updatedRatings);
      applyFiltersAndSorting(updatedRatings);
      
      console.log('✓ useReviews: Successfully deleted rating');
    } catch (error) {
      console.error('Error deleting rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete rating';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [listingSlug, isService, allRatings, applyFiltersAndSorting]);

  // Sort ratings
  const sortRatings = useCallback((
    sortBy: 'rating' | 'date' | 'helpful',
    order: 'asc' | 'desc' = 'desc'
  ) => {
    setCurrentFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: order
    }));
  }, []);

  // Filter by minimum rating
  const filterByMinRating = useCallback((minRating: number) => {
    setCurrentFilters(prev => ({
      ...prev,
      minRating
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setCurrentFilters({
      sortBy: 'date',
      sortOrder: 'desc',
      minRating: undefined
    });
  }, []);

  // Apply filters when they change
  useEffect(() => {
    // FIXED: Ensure allRatings is always an array
    const safeRatings = Array.isArray(allRatings) ? allRatings : [];
    if (safeRatings.length > 0) {
      applyFiltersAndSorting(safeRatings);
    }
  }, [currentFilters, allRatings, applyFiltersAndSorting]);

  // Auto-fetch on mount and when slug changes
  useEffect(() => {
    if (autoFetch && listingSlug) {
      fetchRatings();
    }
  }, [autoFetch, listingSlug]); // Removed fetchRatings dependency to prevent infinite loop

  return useMemo(() => ({
    // State
    ...state,
    
    // Actions
    refetch: fetchRatings,
    createRating,
    updateRating,
    deleteRating,
    sortRatings,
    filterByMinRating,
    clearFilters
  }), [
    state,
    fetchRatings,
    createRating,
    updateRating,
    deleteRating,
    sortRatings,
    filterByMinRating,
    clearFilters
  ]);
}

// Specialized hook for product reviews using slug
export function useProductReviews(productSlug: string, options: UseReviewsOptions = {}) {
  return useReviews(productSlug, false, options);
}

// Specialized hook for service reviews using slug
export function useServiceReviews(serviceSlug: string, options: UseReviewsOptions = {}) {
  return useReviews(serviceSlug, true, options);
}

// Hook for managing review form state
export interface UseReviewFormState {
  // Common fields (supporting decimals)
  rating: number;
  reviewTitle: string;
  reviewText: string;
  wouldRecommend: boolean;
  
  // Product-specific fields
  pros: string;
  cons: string;
  
  // Service-specific fields (supporting decimals)
  communicationRating: number;
  qualityRating: number;
  timelinessRating: number;
  wouldHireAgain: boolean;
  
  // Form state
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface UseReviewFormActions {
  setRating: (rating: number) => void;
  setReviewTitle: (title: string) => void;
  setReviewText: (text: string) => void;
  setWouldRecommend: (recommend: boolean) => void;
  setPros: (pros: string) => void;
  setCons: (cons: string) => void;
  setCommunicationRating: (rating: number) => void;
  setQualityRating: (rating: number) => void;
  setTimelinessRating: (rating: number) => void;
  setWouldHireAgain: (hire: boolean) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  getFormData: () => CreateProductRatingRequest | CreateServiceRatingRequest;
}

export function useReviewForm(isService: boolean): UseReviewFormState & UseReviewFormActions {
  const [state, setState] = useState<UseReviewFormState>({
    // Common fields
    rating: 0,
    reviewTitle: '',
    reviewText: '',
    wouldRecommend: true,
    
    // Product-specific fields
    pros: '',
    cons: '',
    
    // Service-specific fields
    communicationRating: 0,
    qualityRating: 0,
    timelinessRating: 0,
    wouldHireAgain: true,
    
    // Form state
    isSubmitting: false,
    errors: {}
  });

  // Support decimal ratings (0.5 increments)
  const setRating = useCallback((rating: number) => {
    const decimalRating = Math.round(rating * 2) / 2;
    setState(prev => ({ 
      ...prev, 
      rating: decimalRating, 
      errors: { ...prev.errors, rating: '' } 
    }));
  }, []);

  const setReviewTitle = useCallback((reviewTitle: string) => {
    setState(prev => ({ ...prev, reviewTitle, errors: { ...prev.errors, reviewTitle: '' } }));
  }, []);

  const setReviewText = useCallback((reviewText: string) => {
    setState(prev => ({ ...prev, reviewText, errors: { ...prev.errors, reviewText: '' } }));
  }, []);

  const setWouldRecommend = useCallback((wouldRecommend: boolean) => {
    setState(prev => ({ ...prev, wouldRecommend }));
  }, []);

  const setPros = useCallback((pros: string) => {
    setState(prev => ({ ...prev, pros, errors: { ...prev.errors, pros: '' } }));
  }, []);

  const setCons = useCallback((cons: string) => {
    setState(prev => ({ ...prev, cons, errors: { ...prev.errors, cons: '' } }));
  }, []);

  const setCommunicationRating = useCallback((communicationRating: number) => {
    const decimalRating = Math.round(communicationRating * 2) / 2;
    setState(prev => ({ 
      ...prev, 
      communicationRating: decimalRating, 
      errors: { ...prev.errors, communicationRating: '' } 
    }));
  }, []);

  const setQualityRating = useCallback((qualityRating: number) => {
    const decimalRating = Math.round(qualityRating * 2) / 2;
    setState(prev => ({ 
      ...prev, 
      qualityRating: decimalRating, 
      errors: { ...prev.errors, qualityRating: '' } 
    }));
  }, []);

  const setTimelinessRating = useCallback((timelinessRating: number) => {
    const decimalRating = Math.round(timelinessRating * 2) / 2;
    setState(prev => ({ 
      ...prev, 
      timelinessRating: decimalRating, 
      errors: { ...prev.errors, timelinessRating: '' } 
    }));
  }, []);

  const setWouldHireAgain = useCallback((wouldHireAgain: boolean) => {
    setState(prev => ({ ...prev, wouldHireAgain }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Helper function to validate decimal ratings
    const validateRating = (value: number, fieldName: string) => {
      if (!value || value < 1 || value > 5 || typeof value !== 'number') {
        errors[fieldName] = `Please provide a ${fieldName.replace('Rating', '').toLowerCase()} rating between 1 and 5 stars`;
        return false;
      }
      // Check if it's in valid 0.5 increments
      if ((value * 2) % 1 !== 0) {
        errors[fieldName] = `${fieldName.replace('Rating', '').toLowerCase()} rating must be in 0.5 increments (e.g., 3.5, 4.0, 4.5)`;
        return false;
      }
      return true;
    };

    // Validate common fields
    validateRating(state.rating, 'rating');

    if (!state.reviewText.trim()) {
      errors.reviewText = 'Please write a review';
    } else if (state.reviewText.trim().length < 10) {
      errors.reviewText = 'Review must be at least 10 characters long';
    } else if (state.reviewText.trim().length > 1000) {
      errors.reviewText = 'Review cannot exceed 1000 characters';
    }

    if (state.reviewTitle.length > 100) {
      errors.reviewTitle = 'Review title cannot exceed 100 characters';
    }

    if (state.pros.length > 500) {
      errors.pros = 'Pros section cannot exceed 500 characters';
    }

    if (state.cons.length > 500) {
      errors.cons = 'Cons section cannot exceed 500 characters';
    }

    // Validate service-specific fields
    if (isService) {
      validateRating(state.communicationRating, 'communicationRating');
      validateRating(state.qualityRating, 'qualityRating');
      validateRating(state.timelinessRating, 'timelinessRating');
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state, isService]);

  const resetForm = useCallback(() => {
    setState({
      rating: 0,
      reviewTitle: '',
      reviewText: '',
      wouldRecommend: true,
      pros: '',
      cons: '',
      communicationRating: 0,
      qualityRating: 0,
      timelinessRating: 0,
      wouldHireAgain: true,
      isSubmitting: false,
      errors: {}
    });
  }, []);

  const getFormData = useCallback((): CreateProductRatingRequest | CreateServiceRatingRequest => {
    console.log('=== getFormData Debug (Decimal Support) ===');
    console.log('Current state:', state);
    console.log('Rating from state:', state.rating, typeof state.rating);
    
    if (isService) {
      const serviceData: CreateServiceRatingRequest = {
        rating: Number(state.rating.toFixed(1)),
        review: state.reviewText,
        communication_rating: Number(state.communicationRating.toFixed(1)),
        quality_rating: Number(state.qualityRating.toFixed(1)),
        timeliness_rating: Number(state.timelinessRating.toFixed(1)),
        would_recommend: state.wouldRecommend,
        would_hire_again: state.wouldHireAgain
      };

      if (state.reviewTitle.trim()) {
        serviceData.review_title = state.reviewTitle.trim();
      }

      console.log('Service data created:', serviceData);
      return serviceData;
    } else {
      const productData: CreateProductRatingRequest = {
        rating: Number(state.rating.toFixed(1)),
        review: state.reviewText,
        would_recommend: state.wouldRecommend
      };

      if (state.reviewTitle.trim()) {
        productData.review_title = state.reviewTitle.trim();
      }

      if (state.pros.trim()) {
        productData.pros = state.pros.trim();
      }

      if (state.cons.trim()) {
        productData.cons = state.cons.trim();
      }

      console.log('Product data created:', productData);
      return productData;
    }
  }, [state, isService]);

  return useMemo(() => ({
    ...state,
    setRating,
    setReviewTitle,
    setReviewText,
    setWouldRecommend,
    setPros,
    setCons,
    setCommunicationRating,
    setQualityRating,
    setTimelinessRating,
    setWouldHireAgain,
    validateForm,
    resetForm,
    getFormData
  }), [
    state,
    setRating,
    setReviewTitle,
    setReviewText,
    setWouldRecommend,
    setPros,
    setCons,
    setCommunicationRating,
    setQualityRating,
    setTimelinessRating,
    setWouldHireAgain,
    validateForm,
    resetForm,
    getFormData
  ]);
}