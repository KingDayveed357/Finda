import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  Loader2, 
  TrendingUp, 
  Star, 
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/SkeletonListingCard';
import HeaderSkeleton from '@/components/SkeletonListingHeader';
import FiltersSidebar from '@/components/FiltersSidebar';
import { listingService, type UnifiedListing, type ListingFilters } from '../service/listingService';

interface UIFilters {
  categories: number[];
  locations: {
    countries: number[];
    states: number[];
    cities: number[];
  };
  priceRange: [number, number];
  rating: number;
  isService: boolean | null;
  productCondition: string | null;
  isPromoted: boolean | null;
  isFeatured: boolean | null;
  servesRemote: boolean | null;
  isVerified: boolean | null;
}

interface LoadingStates {
  initial: boolean;
  updating: boolean;
  retrying: boolean;
  supplementary: boolean;
}

type ErrorType = 'network' | 'timeout' | 'server' | 'unknown';

interface ErrorState {
  type: ErrorType;
  message: string;
  retryable: boolean;
}

const ListingGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [trendingListings, setTrendingListings] = useState<UnifiedListing[]>([]);
  const [topRatedListings, setTopRatedListings] = useState<UnifiedListing[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<ErrorState | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    updating: false,
    retrying: false,
    supplementary: false
  });

  // Performance optimization refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const lastFiltersRef = useRef<string>('');
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize filters
  const initialFilters: UIFilters = {
    categories: [],
    locations: {
      countries: [],
      states: [],
      cities: []
    },
    priceRange: [0, 10000],
    rating: 0,
    isService: null,
    productCondition: null,
    isPromoted: null,
    isFeatured: null,
    servesRemote: null,
    isVerified: null
  };

  const [filters, setFilters] = useState<UIFilters>(initialFilters);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Stable search params
  const searchQuery = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';

  // FIXED: Optimized API filter conversion with proper caching
  const convertToApiFilters = useCallback((uiFilters: UIFilters): ListingFilters => {
    const apiFilters: ListingFilters = {
      limit: 24, // Reduced from 50 for better performance
      offset: 0
    };

    if (searchQuery.trim()) {
      apiFilters.search = searchQuery.trim();
    }

    if (uiFilters.categories.length > 0) {
      apiFilters.category = uiFilters.categories[0];
    } else if (currentCategory) {
      const categoryId = parseInt(currentCategory);
      if (!isNaN(categoryId)) {
        apiFilters.category = categoryId;
      }
    }

    // Location filters - prioritize most specific
    if (uiFilters.locations.cities.length > 0) {
      apiFilters.city = uiFilters.locations.cities[0];
    } else if (uiFilters.locations.states.length > 0) {
      apiFilters.state = uiFilters.locations.states[0];
    } else if (uiFilters.locations.countries.length > 0) {
      apiFilters.country = uiFilters.locations.countries[0];
    }

    // Price filters
    if (uiFilters.priceRange[0] > 0) {
      apiFilters.min_price = uiFilters.priceRange[0];
    }
    if (uiFilters.priceRange[1] < 10000) {
      apiFilters.max_price = uiFilters.priceRange[1];
    }

    if (uiFilters.rating > 0) {
      apiFilters.min_rating = uiFilters.rating;
    }

    // Type handling
    if (uiFilters.isService === true) {
      apiFilters.item_type = 'services';
    } else if (uiFilters.isService === false) {
      apiFilters.item_type = 'products';
    } else {
      apiFilters.item_type = 'all';
    }

    // Additional filters
    if (uiFilters.productCondition) {
      apiFilters.product_condition = uiFilters.productCondition as 'new' | 'used' | 'refurbished';
    }

    if (uiFilters.isPromoted === true) apiFilters.is_promoted = true;
    if (uiFilters.isFeatured === true) apiFilters.is_featured = true;
    if (uiFilters.servesRemote === true) apiFilters.serves_remote = true;
    if (uiFilters.isVerified === true) apiFilters.is_verified = true;

    apiFilters.ordering = getOrderingValue(sortBy);

    return apiFilters;
  }, [searchQuery, currentCategory, sortBy]);

  const getOrderingValue = (sortValue: string): string => {
    switch (sortValue) {
      case 'price-low': return 'product_price';
      case 'price-high': return '-product_price';
      case 'rating': return '-average_rating';
      case 'newest': return '-created_at';
      case 'views': return '-views_count';
      case 'promoted': return '-is_promoted';
      default: return '-created_at';
    }
  };

  // FIXED: Better error handling with specific error types
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error in ${context}:`, error);

    let errorState: ErrorState = {
      type: 'unknown',
      message: 'Something went wrong. Please try again.',
      retryable: true
    };

    if (!isOnline) {
      errorState = {
        type: 'network',
        message: 'No internet connection. Please check your connection and try again.',
        retryable: true
      };
    } else if (error?.name === 'AbortError') {
      return; // Ignore abort errors
    } else if (error?.message?.includes('timeout') || error?.code === 'TIMEOUT') {
      errorState = {
        type: 'timeout',
        message: 'Request timed out. The server might be slow. Please try again.',
        retryable: true
      };
    } else if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      errorState = {
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
        retryable: true
      };
    } else if (error?.status >= 500) {
      errorState = {
        type: 'server',
        message: 'Server error. Our team has been notified. Please try again later.',
        retryable: true
      };
    }

    setError(errorState);
  }, [isOnline]);

  // FIXED: Optimized data loading with better timeout handling
  const loadData = useCallback(async (
    forceReload = false, 
    isRetry = false,
    isUpdate = false
  ) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const filtersString = JSON.stringify({
      filters,
      activeTab,
      searchQuery,
      currentCategory,
      sortBy
    });

    // Skip if same filters and not forced
    if (!forceReload && !isRetry && lastFiltersRef.current === filtersString) {
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setError(null);
      
      // Set loading state
      setLoadingStates(prev => ({
        ...prev,
        ...(isRetry ? { retrying: true } : 
           isUpdate ? { updating: true } : 
           { initial: true })
      }));

      lastFiltersRef.current = filtersString;

      // FIXED: Reduced timeout to 8 seconds instead of 10
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      loadTimeoutRef.current = setTimeout(() => {
        if (!signal.aborted) {
          setError({
            type: 'timeout',
            message: 'Loading is taking longer than expected. This might be due to a slow connection.',
            retryable: true
          });
        }
      }, 8000);

      const apiFilters = convertToApiFilters(filters);
      let fetchedListings: UnifiedListing[] = [];

      // FIXED: Better tab-based loading with parallel requests where possible
      switch (activeTab) {
        case 'trending':
          fetchedListings = await listingService.getTrendingListings();
          break;
        case 'top-rated':
          fetchedListings = await listingService.getTopRatedListings();
          break;
        case 'promoted':
          fetchedListings = await listingService.getPromotedListings();
          break;
        default:
          // Use search if there's a search query, otherwise get all listings
          if (searchQuery.trim()) {
            fetchedListings = await listingService.searchListings(apiFilters);
          } else {
            fetchedListings = await listingService.getAllListings(apiFilters);
          }
      }

      // Clear timeout if successful
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      // Check if component is still mounted and request not aborted
      if (mountedRef.current && !signal.aborted) {
        setListings(fetchedListings);
        retryCountRef.current = 0;
      }

    } catch (err: any) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      if (mountedRef.current && !signal.aborted) {
        handleError(err, 'loadData');
        setListings([]);
      }
    } finally {
      if (mountedRef.current && !signal.aborted) {
        setLoadingStates({
          initial: false,
          updating: false,
          retrying: false,
          supplementary: false
        });
      }
    }
  }, [filters, activeTab, convertToApiFilters, searchQuery, handleError]);

  // FIXED: Optimized supplementary data loading - only load when needed
  const loadSupplementaryData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoadingStates(prev => ({ ...prev, supplementary: true }));
      
      // Only load supplementary data that's not already cached
      const promises: Promise<UnifiedListing[]>[] = [];
      
      if (trendingListings.length === 0) {
        promises.push(listingService.getTrendingListings());
      } else {
        promises.push(Promise.resolve(trendingListings));
      }
      
      if (topRatedListings.length === 0) {
        promises.push(listingService.getTopRatedListings());
      } else {
        promises.push(Promise.resolve(topRatedListings));
      }
      
      const [trending, topRated] = await Promise.all(promises);
      
      if (mountedRef.current) {
        if (trendingListings.length === 0) {
          setTrendingListings(trending.slice(0, 12));
        }
        if (topRatedListings.length === 0) {
          setTopRatedListings(topRated.slice(0, 12));
        }
      }
    } catch (error) {
      console.warn('Error loading supplementary data:', error);
    } finally {
      if (mountedRef.current) {
        setLoadingStates(prev => ({ ...prev, supplementary: false }));
      }
    }
  }, [trendingListings.length, topRatedListings.length]);

  // FIXED: Optimized initial load
  useEffect(() => {
    mountedRef.current = true;
    
    const initialize = async () => {
      // Start with main data load
      await loadData(true, false, false);
      
      // Load supplementary data in background after main data loads
      setTimeout(() => {
        if (mountedRef.current) {
          loadSupplementaryData();
        }
      }, 500);
    };

    initialize();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array

  // FIXED: Better debounced effect for filter changes
  useEffect(() => {
    if (loadingStates.initial) return; // Skip during initial load

    const timeoutId = setTimeout(() => {
      loadData(false, false, true);
    }, 500); // Increased debounce to 500ms

    return () => clearTimeout(timeoutId);
  }, [filters, activeTab, sortBy, loadData, loadingStates.initial]);

  // Update filters from URL params
  useEffect(() => {
    if (currentCategory) {
      const categoryId = parseInt(currentCategory);
      if (!isNaN(categoryId) && !filters.categories.includes(categoryId)) {
        setFilters(prev => ({
          ...prev,
          categories: [categoryId]
        }));
      }
    }
  }, [currentCategory, filters.categories]);

  // FIXED: Optimized sorted listings with better type safety
  const sortedListings = useMemo(() => {
    if (!Array.isArray(listings) || listings.length === 0) return [];

    // Return listings as-is if they're already sorted by the service
    if (activeTab === 'trending' || activeTab === 'top-rated' || activeTab === 'promoted') {
      return listings;
    }

    const sorted = [...listings];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : (a.price?.min || 0);
          const priceB = typeof b.price === 'number' ? b.price : (b.price?.min || 0);
          return priceA - priceB;
        });
      
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : (a.price?.max || a.price?.min || 0);
          const priceB = typeof b.price === 'number' ? b.price : (b.price?.max || b.price?.min || 0);
          return priceB - priceA;
        });
      
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'views':
        return sorted.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      
      case 'promoted':
        return sorted.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
      
      default:
        return sorted;
    }
  }, [listings, sortBy, activeTab]);

  // Event handlers
  const handleFilterChange = useCallback((newFilters: UIFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRetry = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      setError({
        type: 'unknown',
        message: 'Maximum retry attempts reached. Please refresh the page or try again later.',
        retryable: false
      });
      return;
    }

    retryCountRef.current++;
    await loadData(true, true, false);
  }, [loadData]);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams, initialFilters]);

  // FIXED: Better tab title generation
  const getTabTitle = useCallback((tab: string) => {
    switch (tab) {
      case 'trending':
        return `Trending${trendingListings.length > 0 ? ` (${trendingListings.length})` : ''}`;
      case 'top-rated':
        return `Top Rated${topRatedListings.length > 0 ? ` (${topRatedListings.length})` : ''}`;
      case 'promoted':
        return 'Promoted';
      default:
        return `All${sortedListings.length > 0 ? ` (${sortedListings.length})` : ''}`;
    }
  }, [trendingListings.length, topRatedListings.length, sortedListings.length]);

  // FIXED: Optimized skeleton rendering
  const renderSkeletonCards = useCallback(() => {
    return Array(8).fill(0).map((_, index) => ( // Reduced from 12 to 8
      <ListingCardSkeleton key={`skeleton-${index}`} />
    ));
  }, []);

  const renderListings = useCallback((listingsToRender: UnifiedListing[]) => {
    if (!Array.isArray(listingsToRender)) return null;
    
    return listingsToRender.map((listing) => (
      <ListingCard 
        key={listing.id} 
        listing={listing}
        loading={false}
        className={viewMode === 'list' ? 'w-full' : ''}
      />
    ));
  }, [viewMode]);

  // Network error component
  const NetworkError = () => (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <span>You appear to be offline. Some features may not work properly.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );

  // Loading error component
  const LoadingError = ({ error }: { error: ErrorState }) => (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium mb-1">
              {error.type === 'network' && 'Network Error'}
              {error.type === 'timeout' && 'Slow Connection'}
              {error.type === 'server' && 'Server Error'}
              {error.type === 'unknown' && 'Error'}
            </div>
            <div>{error.message}</div>
            {retryCountRef.current > 0 && (
              <div className="text-sm mt-1">
                Retry attempt {retryCountRef.current}/{maxRetries}
              </div>
            )}
          </div>
          {error.retryable && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              disabled={loadingStates.retrying}
              className="ml-2"
            >
              {loadingStates.retrying ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              {loadingStates.retrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <List className="h-20 w-20 text-gray-300 mx-auto mb-6" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">No listings found</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {searchQuery 
          ? `No results found for "${searchQuery}". Try adjusting your search terms or filters.`
          : "No listings match your current filters. Try adjusting your criteria."
        }
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Page
        </Button>
      </div>
    </div>
  );

  const renderTabContent = useCallback((tabListings: UnifiedListing[], isActiveTab: boolean) => {
    const isLoading = (loadingStates.initial || (loadingStates.updating && isActiveTab)) && tabListings.length === 0;
    const hasListings = Array.isArray(tabListings) && tabListings.length > 0;
    const showEmptyState = !isLoading && !hasListings && !error;

    if (isLoading) {
      return (
        <div className={viewMode === 'grid' ? 
          'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
          'space-y-4'
        }>
          {renderSkeletonCards()}
        </div>
      );
    }

    if (showEmptyState) {
      return <EmptyState />;
    }

    if (hasListings) {
      return (
        <div className={viewMode === 'grid' ? 
          'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
          'space-y-4'
        }>
          {renderListings(tabListings)}
        </div>
      );
    }

    return null;
  }, [viewMode, loadingStates, error, renderSkeletonCards, renderListings]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Network status */}
        {!isOnline && <NetworkError />}
        
        {/* Error display */}
        {error && <LoadingError error={error} />}

        {/* Header */}
        {loadingStates.initial ? (
          <HeaderSkeleton />
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Browse Listings'}
                </h1>
                {!isOnline && <WifiOff className="h-5 w-5 text-orange-500" />}
                {isOnline && <Wifi className="h-5 w-5 text-green-500" />}
              </div>
              <p className="text-gray-600">
                {loadingStates.updating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating results...
                  </span>
                ) : loadingStates.retrying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Retrying... ({retryCountRef.current}/{maxRetries})
                  </span>
                ) : (
                  <>
                    {sortedListings.length} {sortedListings.length === 1 ? 'listing' : 'listings'} found
                    {loadingStates.supplementary && (
                      <span className="ml-2 text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                        Loading more...
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mt-4 sm:mt-0">
              {/* Sort Dropdown */}
              <Select 
                value={sortBy} 
                onValueChange={setSortBy} 
                disabled={loadingStates.updating || loadingStates.retrying}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="promoted">Promoted First</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {Object.values(filters).some(v => 
                      Array.isArray(v) ? v.length > 0 : 
                      typeof v === 'object' && v !== null ? Object.values(v).some(av => Array.isArray(av) ? av.length > 0 : false) :
                      v !== null && v !== 0
                    ) && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                        Active
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <FiltersSidebar 
                    filters={filters} 
                    onFiltersChange={handleFilterChange}
                    loading={loadingStates.updating || loadingStates.retrying}
                  />
                </SheetContent>
              </Sheet>

              {/* View Toggle */}
              <div className="hidden md:flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  disabled={loadingStates.updating}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  disabled={loadingStates.updating}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FiltersSidebar 
                filters={filters} 
                onFiltersChange={handleFilterChange}
                loading={loadingStates.updating || loadingStates.retrying}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger 
                  value="all" 
                  disabled={loadingStates.updating || loadingStates.retrying}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  {loadingStates.initial ? 'All' : getTabTitle('all')}
                </TabsTrigger>
                <TabsTrigger 
                  value="trending" 
                  disabled={loadingStates.updating || loadingStates.retrying}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  {getTabTitle('trending')}
                </TabsTrigger>
                <TabsTrigger 
                  value="top-rated" 
                  disabled={loadingStates.updating || loadingStates.retrying}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  {getTabTitle('top-rated')}
                </TabsTrigger>
              </TabsList>

              {/* Loading indicator */}
              {(loadingStates.updating || loadingStates.retrying) && sortedListings.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {loadingStates.retrying 
                      ? `Retrying... (${retryCountRef.current}/${maxRetries})`
                      : 'Updating results...'
                    }
                  </span>
                </div>
              )}

              {/* Tab Contents */}
              <TabsContent value="all" className="mt-0">
                {renderTabContent(sortedListings, activeTab === 'all')}
              </TabsContent>

              <TabsContent value="trending" className="mt-0">
                {renderTabContent(trendingListings, activeTab === 'trending')}
              </TabsContent>

              <TabsContent value="top-rated" className="mt-0">
                {renderTabContent(topRatedListings, activeTab === 'top-rated')}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingGrid;