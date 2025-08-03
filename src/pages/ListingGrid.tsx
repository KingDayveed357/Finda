import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, Loader2, TrendingUp, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/SkeletonListingCard';
import HeaderSkeleton from '@/components/SkeletonListingHeader';
import FiltersSidebar from '@/components/FiltersSidebar';
import { listingService, type UnifiedListing, type ListingFilters } from '../service/listingService';

// Updated UIFilters interface to match FiltersSidebar
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

const ListingGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [trendingListings, setTrendingListings] = useState<UnifiedListing[]>([]);
  const [topRatedListings, setTopRatedListings] = useState<UnifiedListing[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load
  const [updating, setUpdating] = useState(false); // Track filter updates
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent infinite loops
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFiltersRef = useRef<string>('');
  
  // Initialize filters with proper structure
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

  // Memoize search params - STABLE references
  const searchQuery = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  
  // Convert UI filters to API filters - MEMOIZED to prevent recreating
  const convertToApiFilters = useCallback((uiFilters: UIFilters): ListingFilters => {
    const apiFilters: ListingFilters = {};

    // Search query
    if (searchQuery) {
      apiFilters.search = searchQuery;
    }

    // Category
    if (uiFilters.categories.length > 0) {
      apiFilters.category = uiFilters.categories[0];
    } else if (currentCategory) {
      const categoryId = parseInt(currentCategory);
      if (!isNaN(categoryId)) {
        apiFilters.category = categoryId;
      }
    }

    // Location
    if (uiFilters.locations.cities.length > 0) {
      apiFilters.city = uiFilters.locations.cities[0];
    } else if (uiFilters.locations.states.length > 0) {
      apiFilters.state = uiFilters.locations.states[0];
    } else if (uiFilters.locations.countries.length > 0) {
      apiFilters.country = uiFilters.locations.countries[0];
    }

    // Price range
    if (uiFilters.priceRange[0] > 0) {
      apiFilters.min_price = uiFilters.priceRange[0];
    }
    if (uiFilters.priceRange[1] < 10000) {
      apiFilters.max_price = uiFilters.priceRange[1];
    }

    // Rating
    if (uiFilters.rating > 0) {
      apiFilters.min_rating = uiFilters.rating;
    }

    // Type
    if (uiFilters.isService === true) {
      apiFilters.item_type = 'services';
    } else if (uiFilters.isService === false) {
      apiFilters.item_type = 'products';
    }

    // Product condition
    if (uiFilters.productCondition) {
      apiFilters.product_condition = uiFilters.productCondition as 'new' | 'used' | 'refurbished';
    }

    // Features
    if (uiFilters.isPromoted === true) {
      apiFilters.is_promoted = true;
    }
    if (uiFilters.isFeatured === true) {
      apiFilters.is_featured = true;
    }
    if (uiFilters.servesRemote === true) {
      apiFilters.serves_remote = true;
    }
    if (uiFilters.isVerified === true) {
      apiFilters.is_verified = true;
    }

    // Ordering
    apiFilters.ordering = getOrderingValue(sortBy);

    return apiFilters;
  }, [searchQuery, currentCategory, sortBy]);

  const getOrderingValue = (sortValue: string): string => {
    switch (sortValue) {
      case 'price-low':
        return 'product_price';
      case 'price-high':
        return '-product_price';
      case 'rating':
        return '-average_rating';
      case 'newest':
        return '-created_at';
      case 'views':
        return '-views_count';
      default:
        return '-created_at';
    }
  };

  // SINGLE data loading function with proper error handling
  const loadData = useCallback(async (forceReload = false, isUpdate = false) => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current && !forceReload) {
      return;
    }

    // Create a stable string representation of filters for comparison
    const filtersString = JSON.stringify({
      filters,
      activeTab,
      searchQuery,
      currentCategory,
      sortBy
    });

    // Skip if same filters (prevents infinite loops)
    if (!forceReload && lastFiltersRef.current === filtersString) {
      return;
    }

    try {
      loadingRef.current = true;
      
      // Set appropriate loading state
      if (isUpdate) {
        setUpdating(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      lastFiltersRef.current = filtersString;

      const apiFilters = convertToApiFilters(filters);
      
      let fetchedListings: UnifiedListing[];
      
      // Choose strategy based on active tab
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
          fetchedListings = await listingService.getAllListings(apiFilters);
      }

      // Only update state if component is still mounted
      if (mountedRef.current) {
        setListings(fetchedListings);
      }

    } catch (err) {
      console.error('Error loading listings:', err);
      if (mountedRef.current) {
        setError('Failed to load listings. Please try again.');
        setListings([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setUpdating(false);
        setInitialLoad(false);
      }
      loadingRef.current = false;
    }
  }, [filters, activeTab, convertToApiFilters]);

  // Load supplementary data ONCE
  const loadSupplementaryData = useCallback(async () => {
    try {
      const [trending, topRated] = await Promise.all([
        listingService.getTrendingListings(),
        listingService.getTopRatedListings()
      ]);
      
      if (mountedRef.current) {
        setTrendingListings(trending.slice(0, 10));
        setTopRatedListings(topRated.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading supplementary data:', error);
    }
  }, []);

  // SINGLE useEffect for initial load
  useEffect(() => {
    mountedRef.current = true;
    
    const initialize = async () => {
      await Promise.all([
        loadData(true, false), // Force initial load
        loadSupplementaryData()
      ]);
    };

    initialize();

    return () => {
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  // DEBOUNCED effect for filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialLoad) { // Don't trigger during initial load
        loadData(false, true); // This is an update, not initial load
      }
    }, 300); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [filters, activeTab, sortBy, initialLoad, loadData]);

  // Update filters when URL params change (but don't reload data immediately)
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
  }, [currentCategory]); // Don't include filters in deps to avoid loops

  // Apply sorting - properly memoized
  const sortedListings = useMemo(() => {
    if (!listings.length) return [];

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
          const priceA = typeof a.price === 'number' 
            ? a.price 
            : (a.price?.max || a.price?.min || 0);
          const priceB = typeof b.price === 'number' 
            ? b.price 
            : (b.price?.max || b.price?.min || 0);
          return priceB - priceA;
        });
      
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'views':
        return sorted.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      
      case 'promoted':
        return sorted.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
      
      default:
        return sorted;
    }
  }, [listings, sortBy]);

  // Event handlers
  const handleFilterChange = useCallback((newFilters: UIFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRetry = useCallback(() => {
    loadData(true, false); // Force reload
  }, [loadData]);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  }, [setSearchParams]);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'trending':
        return `Trending (${trendingListings.length})`;
      case 'top-rated':
        return `Top Rated (${topRatedListings.length})`;
      case 'promoted':
        return 'Promoted';
      default:
        return `All (${sortedListings.length})`;
    }
  };

  // Function to render skeleton cards
  const renderSkeletonCards = () => {
    return Array(12).fill(0).map((_, index) => (
      <ListingCardSkeleton key={`skeleton-${index}`} />
    ));
  };

  // Function to render tab content with skeletons
  const renderTabContent = (tabListings: UnifiedListing[], isActiveTab: boolean) => {
    const showSkeletons = (initialLoad || (updating && isActiveTab)) && tabListings.length === 0;
    const showListings = !showSkeletons && tabListings.length > 0;
    const showEmptyState = !showSkeletons && !showListings && !loading && !updating;

    if (showSkeletons) {
      return (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {renderSkeletonCards()}
        </div>
      );
    }

    if (showEmptyState) {
      return (
        <div className="text-center py-12">
          <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 mb-4">No listings found</p>
          <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </div>
      );
    }

    return (
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }>
        {tabListings.map((listing) => (
          <ListingCard 
            key={listing.id} 
            listing={{
              ...listing,
              images: [listing.image],
              vendor: {
                name: listing.providerName,
                image: '/placeholder-avatar.jpg'
              }
            }} 
          />
        ))}
      </div>
    );
  };

  // Error state (only show if no data at all)
  if (error && listings.length === 0 && !loading && !initialLoad) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <Button onClick={handleRetry} className="flex items-center gap-2 mx-auto">
              <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with skeleton loading */}
        {initialLoad ? (
          <HeaderSkeleton />
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Results for "${searchQuery}"` : 'Browse Listings'}
              </h1>
              <p className="text-gray-600">
                {updating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating results...
                  </span>
                ) : (
                  <>
                    {sortedListings.length} {sortedListings.length === 1 ? 'result' : 'results'} found
                  </>
                )}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mt-4 sm:mt-0">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy} disabled={updating}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="promoted">Promoted First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filters Button */}
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
                      <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                        •
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <FiltersSidebar 
                    filters={filters} 
                    onFiltersChange={handleFilterChange}
                    loading={updating}
                  />
                </SheetContent>
              </Sheet>

              {/* Grid/List View Toggle */}
              <div className="hidden md:flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
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
            <FiltersSidebar 
              filters={filters} 
              onFiltersChange={handleFilterChange}
              loading={updating}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs for different listing types */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2" disabled={updating}>
                  <List className="h-4 w-4" />
                  {initialLoad ? 'All' : getTabTitle('all')}
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2" disabled={updating}>
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="top-rated" className="flex items-center gap-2" disabled={updating}>
                  <Star className="h-4 w-4" />
                  Top Rated
                </TabsTrigger>
                <TabsTrigger value="promoted" className="flex items-center gap-2" disabled={updating}>
                  <Award className="h-4 w-4" />
                  Promoted
                </TabsTrigger>
              </TabsList>

              {/* Loading indicator for active searches */}
              {updating && listings.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Updating results...</span>
                </div>
              )}

              {/* Tab Contents */}
              <TabsContent value="all">
                {renderTabContent(sortedListings, activeTab === 'all')}
              </TabsContent>

              <TabsContent value="trending">
                {renderTabContent(trendingListings, activeTab === 'trending')}
              </TabsContent>

              <TabsContent value="top-rated">
                {renderTabContent(topRatedListings, activeTab === 'top-rated')}
              </TabsContent>

              <TabsContent value="promoted">
                {renderTabContent(
                  listings.filter(listing => listing.isPromoted), 
                  activeTab === 'promoted'
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingGrid;