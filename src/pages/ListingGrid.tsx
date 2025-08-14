// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { 
//   Grid, 
//   List, 
//   // SlidersHorizontal, 
//   Loader2, 
//   TrendingUp, 
//   Star, 
//   RefreshCw,
//   AlertTriangle,
//   Wifi,
//   WifiOff,
//   Search,
//   Eye,
//   Filter,
//   Clock,
//   Target
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import Layout from '@/components/Layout';
// import ListingCard from '@/components/ListingCard';
// import ListingCardSkeleton from '@/components/SkeletonListingCard';
// import HeaderSkeleton from '@/components/SkeletonListingHeader';
// import FiltersSidebar from '@/components/FiltersSidebar';
// import { 
//   searchService, 
//   type SearchParams, 
//   // type SearchResult,
//   type Product,
//   type Service,
//   type SearchFilters,
//   type TrendingSearch,
//   type QuickSearchResult
// } from '@/service/searchService';

// // Enhanced UnifiedListing interface using search service types
// interface UnifiedListing {
//   id: string;
//   title: string;
//   description: string;
//   price: number | { min: number; max: number } | null;
//   currency: string;
//   currencySymbol: string;
//   image: string;
//   images: string[];
//   rating: number;
//   ratingCount: number;
//   location: string;
//   tags: string[];
//   isService: boolean;
//   isPromoted: boolean;
//   isFeatured: boolean;
//   isVerified: boolean;
//   viewsCount: number;
//   providerName: string;
//   providerImage?: string;
//   slug: string;
//   createdAt: string;
//   originalData: Product | Service;
// }

// interface UIFilters {
//   categories: number[];
//   locations: {
//     countries: number[];
//     states: number[];
//     cities: number[];
//   };
//   priceRange: [number, number];
//   rating: number;
//   isService: boolean | null;
//   productCondition: string | null;
//   isPromoted: boolean | null;
//   isFeatured: boolean | null;
//   servesRemote: boolean | null;
//   isVerified: boolean | null;
// }

// interface LoadingStates {
//   initial: boolean;
//   updating: boolean;
//   suggestions: boolean;
//   trending: boolean;
//   quickSearch: boolean;
// }

// type ErrorType = 'network' | 'timeout' | 'server' | 'not_found' | 'unknown';

// interface ErrorState {
//   type: ErrorType;
//   message: string;
//   retryable: boolean;
//   suggestions?: string[];
// }

// interface SearchState {
//   query: string;
//   results: UnifiedListing[];
//   relatedResults: UnifiedListing[];
//   quickResults: QuickSearchResult | null;
//   totalCount: number;
//   hasMore: boolean;
//   currentPage: number;
// }

// // Performance monitoring hook
// const usePerformanceMonitor = () => {
//   const metrics = useRef({
//     searchStartTime: 0,
//     renderStartTime: 0,
//     lastSearchDuration: 0,
//     averageSearchTime: 0,
//     searchCount: 0
//   });

//   const startSearch = useCallback(() => {
//     metrics.current.searchStartTime = performance.now();
//   }, []);

//   const endSearch = useCallback(() => {
//     const duration = performance.now() - metrics.current.searchStartTime;
//     metrics.current.lastSearchDuration = duration;
//     metrics.current.searchCount++;
//     metrics.current.averageSearchTime = 
//       (metrics.current.averageSearchTime * (metrics.current.searchCount - 1) + duration) / 
//       metrics.current.searchCount;
    
//     console.debug(`Search completed in ${duration.toFixed(2)}ms (avg: ${metrics.current.averageSearchTime.toFixed(2)}ms)`);
//   }, []);

//   return { startSearch, endSearch, metrics: metrics.current };
// };

// const ListingGrid = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [sortBy, setSortBy] = useState('relevance');
//   const [activeTab, setActiveTab] = useState('all');
//   const [error, setError] = useState<ErrorState | null>(null);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [showQuickSearch, setShowQuickSearch] = useState(false);
//   const [quickSearchQuery, setQuickSearchQuery] = useState('');
  
//   const [searchState, setSearchState] = useState<SearchState>({
//     query: '',
//     results: [],
//     relatedResults: [],
//     quickResults: null,
//     totalCount: 0,
//     hasMore: false,
//     currentPage: 1
//   });
  
//   const [loadingStates, setLoadingStates] = useState<LoadingStates>({
//     initial: true,
//     updating: false,
//     suggestions: false,
//     trending: false,
//     quickSearch: false
//   });

//   // Performance monitoring
//   const { startSearch, endSearch } = usePerformanceMonitor();

//   // Refs for cleanup and performance
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const mountedRef = useRef(true);
//   const lastSearchRef = useRef<string>('');
//   const retryCountRef = useRef(0);
//   const maxRetries = 3;
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const quickSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Network status monitoring
//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   // Extract search params with validation
//   const searchQuery = useMemo(() => {
//     const query = searchParams.get('search') || searchParams.get('q') || '';
//     return query.trim();
//   }, [searchParams]);

//   const currentCategory = useMemo(() => {
//     const category = searchParams.get('category') || '';
//     return category.trim();
//   }, [searchParams]);

//   // Parse filters from URL params (this function reads the current state)
//   const filtersFromUrl = useMemo((): UIFilters => {
//     const filters: UIFilters = {
//       categories: [],
//       locations: {
//         countries: [],
//         states: [],
//         cities: []
//       },
//       priceRange: [0, 10000],
//       rating: 0,
//       isService: null,
//       productCondition: null,
//       isPromoted: null,
//       isFeatured: null,
//       servesRemote: null,
//       isVerified: null
//     };

//     // Parse categories
//     const categories = searchParams.get('categories');
//     if (categories) {
//       filters.categories = categories.split(',').map(Number).filter(n => !isNaN(n));
//     }

//     // Parse single category (for backward compatibility)
//     const category = searchParams.get('category');
//     if (category && !isNaN(Number(category))) {
//       const categoryId = Number(category);
//       if (!filters.categories.includes(categoryId)) {
//         filters.categories.push(categoryId);
//       }
//     }

//     // Parse locations
//     const countries = searchParams.get('countries');
//     if (countries) {
//       filters.locations.countries = countries.split(',').map(Number).filter(n => !isNaN(n));
//     }

//     const states = searchParams.get('states');
//     if (states) {
//       filters.locations.states = states.split(',').map(Number).filter(n => !isNaN(n));
//     }

//     const cities = searchParams.get('cities');
//     if (cities) {
//       filters.locations.cities = cities.split(',').map(Number).filter(n => !isNaN(n));
//     }

//     // Parse location (general location string)
//     const location = searchParams.get('location');
//     if (location && !isNaN(Number(location))) {
//       const locationId = Number(location);
//       // Try to determine if it's a country, state, or city
//       // For now, we'll add it to countries as a fallback
//       if (!filters.locations.countries.includes(locationId)) {
//         filters.locations.countries.push(locationId);
//       }
//     }

//     // Parse price range
//     const minPrice = searchParams.get('min_price') || searchParams.get('minPrice');
//     const maxPrice = searchParams.get('max_price') || searchParams.get('maxPrice');
//     if (minPrice && !isNaN(Number(minPrice))) {
//       filters.priceRange[0] = Number(minPrice);
//     }
//     if (maxPrice && !isNaN(Number(maxPrice))) {
//       filters.priceRange[1] = Number(maxPrice);
//     }

//     // Parse rating
//     const rating = searchParams.get('min_rating') || searchParams.get('rating');
//     if (rating && !isNaN(Number(rating))) {
//       filters.rating = Number(rating);
//     }

//     // Parse item type
//     const itemType = searchParams.get('item_type') || searchParams.get('type');
//     if (itemType === 'services') {
//       filters.isService = true;
//     } else if (itemType === 'products') {
//       filters.isService = false;
//     }

//     // Parse product condition
//     const condition = searchParams.get('condition') || searchParams.get('product_condition');
//     if (condition && ['new', 'used', 'refurbished'].includes(condition)) {
//       filters.productCondition = condition;
//     }

//     // Parse feature flags
//     const promoted = searchParams.get('promoted') || searchParams.get('is_promoted');
//     if (promoted === 'true') {
//       filters.isPromoted = true;
//     }

//     const featured = searchParams.get('featured') || searchParams.get('is_featured');
//     if (featured === 'true') {
//       filters.isFeatured = true;
//     }

//     const remote = searchParams.get('remote') || searchParams.get('serves_remote');
//     if (remote === 'true') {
//       filters.servesRemote = true;
//     }

//     const verified = searchParams.get('verified') || searchParams.get('is_verified');
//     if (verified === 'true') {
//       filters.isVerified = true;
//     }

//     return filters;
//   }, [searchParams]);

//   // Convert Product/Service to UnifiedListing with enhanced error handling
//   const convertToUnifiedListing = useCallback((item: Product | Service): UnifiedListing => {
//     try {
//       const isService = 'service_name' in item;
      
//       if (isService) {
//         const service = item as Service;
//         return {
//           id: service.id.toString(),
//           title: service.service_name || 'Untitled Service',
//           description: service.service_description || '',
//           price: service.max_price > service.starting_price 
//             ? { min: service.starting_price, max: service.max_price }
//             : service.starting_price || 0,
//           currency: service.currency || 'NGN',
//           currencySymbol: '₦',
//           image: service.featured_image_url || '/placeholder.svg',
//           images: service.gallery_images || [],
//           rating: service.average_rating || 0,
//           ratingCount: service.rating_count || 0,
//           location: service.user_details?.full_name || 'Remote Available',
//           tags: service.tags ? service.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
//           isService: true,
//           isPromoted: service.is_promoted || false,
//           isFeatured: service.is_featured || false,
//           isVerified: service.is_verified || false,
//           viewsCount: service.views_count || 0,
//           providerName: service.provider_name || service.user_details?.full_name || 'Unknown Provider',
//           providerImage: service.user_details?.email ? 
//             `https://www.gravatar.com/avatar/${btoa(service.user_details.email)}?d=mp&s=80` : 
//             undefined,
//           slug: service.slug || `service-${service.id}`,
//           createdAt: service.created_at,
//           originalData: service
//         };
//       } else {
//         const product = item as Product;
//         return {
//           id: product.id.toString(),
//           title: product.product_name || 'Untitled Product',
//           description: product.product_description || '',
//           price: product.product_price || 0,
//           currency: product.currency || 'NGN',
//           currencySymbol: product.currency_symbol || '₦',
//           image: product.featured_image_url || '/placeholder.svg',
//           images: product.gallery_images || [],
//           rating: product.average_rating || 0,
//           ratingCount: product.rating_count || 0,
//           location: product.full_location || product.address_details || 'Location not specified',
//           tags: product.tags_list || [],
//           isService: false,
//           isPromoted: product.is_promoted || false,
//           isFeatured: product.is_featured || false,
//           isVerified: false, // Products don't have verification in the API
//           viewsCount: product.views_count || 0,
//           providerName: product.user_details?.full_name || 'Unknown Provider',
//           providerImage: product.user_details?.email ? 
//             `https://www.gravatar.com/avatar/${btoa(product.user_details.email)}?d=mp&s=80` : 
//             undefined,
//           slug: product.slug || `product-${product.id}`,
//           createdAt: product.created_at,
//           originalData: product
//         };
//       }
//     } catch (error) {
//       console.error('Error converting listing:', error, item);
//       // Return a fallback listing to prevent crashes
//       return {
//         id: item.id?.toString() || 'unknown',
//         title: 'Error Loading Item',
//         description: 'This item could not be loaded properly',
//         price: null,
//         currency: 'NGN',
//         currencySymbol: '₦',
//         image: '/placeholder.svg',
//         images: [],
//         rating: 0,
//         ratingCount: 0,
//         location: 'Unknown',
//         tags: [],
//         isService: 'service_name' in item,
//         isPromoted: false,
//         isFeatured: false,
//         isVerified: false,
//         viewsCount: 0,
//         providerName: 'Unknown Provider',
//         slug: `error-${item.id}`,
//         createdAt: new Date().toISOString(),
//         originalData: item
//       };
//     }
//   }, []);

//   // Convert UI filters to search service filters
//   const convertToSearchFilters = useCallback((uiFilters: UIFilters): SearchFilters => {
//     const searchFilters: SearchFilters = {};

//     if (uiFilters.categories.length > 0) {
//       searchFilters.category = uiFilters.categories[0].toString();
//     } else if (currentCategory) {
//       searchFilters.category = currentCategory;
//     }

//     // Location handling - prioritize most specific
//     if (uiFilters.locations.cities.length > 0) {
//       searchFilters.location = uiFilters.locations.cities[0].toString();
//     } else if (uiFilters.locations.states.length > 0) {
//       searchFilters.location = uiFilters.locations.states[0].toString();
//     } else if (uiFilters.locations.countries.length > 0) {
//       searchFilters.location = uiFilters.locations.countries[0].toString();
//     }

//     // Price range
//     if (uiFilters.priceRange[0] > 0 || uiFilters.priceRange[1] < 10000) {
//       searchFilters.price_range = uiFilters.priceRange;
//     }

//     if (uiFilters.rating > 0) {
//       searchFilters.min_rating = uiFilters.rating;
//     }

//     // Item type
//     if (uiFilters.isService === true) {
//       searchFilters.item_type = 'services';
//     } else if (uiFilters.isService === false) {
//       searchFilters.item_type = 'products';
//     } else {
//       searchFilters.item_type = 'all';
//     }

//     return searchFilters;
//   }, [currentCategory]);

//   // Enhanced error handling with smart suggestions
//   const handleError = useCallback((error: any, context: string, query?: string) => {
//     console.error(`Error in ${context}:`, error);

//     let errorState: ErrorState = {
//       type: 'unknown',
//       message: 'Something went wrong. Please try again.',
//       retryable: true
//     };

//     if (!isOnline) {
//       errorState = {
//         type: 'network',
//         message: 'No internet connection. Please check your connection and try again.',
//         retryable: true
//       };
//     } else if (error?.name === 'AbortError') {
//       return; // Ignore abort errors
//     } else if (error?.message?.includes('timeout') || error?.code === 'TIMEOUT') {
//       errorState = {
//         type: 'timeout',
//         message: 'Search timed out. The server might be slow. Please try again.',
//         retryable: true
//       };
//     } else if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
//       errorState = {
//         type: 'network',
//         message: 'Network error. Please check your connection and try again.',
//         retryable: true
//       };
//     } else if (error?.status >= 500) {
//       errorState = {
//         type: 'server',
//         message: 'Server error. Our team has been notified. Please try again later.',
//         retryable: true
//       };
//     } else if (error?.status === 404 || (query && searchState.results.length === 0)) {
//       errorState = {
//         type: 'not_found',
//         message: query 
//           ? `No results found for "${query}". Try these suggestions:`
//           : 'No listings found. Try adjusting your search or filters.',
//         retryable: false,
//         suggestions: recentSearches.slice(0, 4)
//       };
//     }

//     setError(errorState);
//   }, [isOnline, searchState.results.length, recentSearches]);

//   // Enhanced search with performance monitoring
//   const performSearch = useCallback(async (
//     searchQuery: string,
//     searchFilters: SearchFilters,
//     page = 1,
//     // isRetry = false
//   ) => {
//     startSearch();
    
//     try {
//       const searchParams: SearchParams = {
//         q: searchQuery,
//         ...searchFilters,
//         page,
//         page_size: 24
//       };

//       const result = await searchService.search(searchParams);
      
//       const unifiedListings = [
//         ...result.results.products.map(convertToUnifiedListing),
//         ...result.results.services.map(convertToUnifiedListing)
//       ].filter(Boolean); // Remove any null/undefined items

//       endSearch();
//       return {
//         listings: unifiedListings,
//         totalCount: unifiedListings.length,
//         hasMore: unifiedListings.length === 24 // Assume more if we got a full page
//       };
//     } catch (error) {
//       endSearch();
//       throw error;
//     }
//   }, [convertToUnifiedListing, startSearch, endSearch]);

//   // Quick search for autocomplete with debouncing
//   const performQuickSearch = useCallback(async (query: string) => {
//     if (!query || query.length < 2) {
//       setSearchState(prev => ({ ...prev, quickResults: null }));
//       return;
//     }

//     if (quickSearchTimeoutRef.current) {
//       clearTimeout(quickSearchTimeoutRef.current);
//     }

//     quickSearchTimeoutRef.current = setTimeout(async () => {
//       try {
//         setLoadingStates(prev => ({ ...prev, quickSearch: true }));
        
//         const result = await searchService.quickSearch(query);
        
//         if (mountedRef.current) {
//           setSearchState(prev => ({ 
//             ...prev, 
//             quickResults: result 
//           }));
//         }
//       } catch (error) {
//         console.error('Quick search failed:', error);
//       } finally {
//         if (mountedRef.current) {
//           setLoadingStates(prev => ({ ...prev, quickSearch: false }));
//         }
//       }
//     }, 300); // 300ms debounce
//   }, []);

//   // Main search function with enhanced error handling and caching
//   const performMainSearch = useCallback(async (
//     forceReload = false,
//     isRetry = false,
//     page = 1
//   ) => {
//     // Cancel previous request
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     const currentSearch = JSON.stringify({
//       query: searchQuery,
//       filters: filtersFromUrl, // Use the computed filters from URL
//       sortBy,
//       activeTab,
//       page
//     });

//     // Skip if same search and not forced (for first page only)
//     if (!forceReload && !isRetry && page === 1 && lastSearchRef.current === currentSearch) {
//       return;
//     }

//     abortControllerRef.current = new AbortController();

//     try {
//       setError(null);
      
//       if (page === 1) {
//         setSearchState(prev => ({ 
//           ...prev, 
//           relatedResults: [],
//           quickResults: null
//         }));
//       }
      
//       setLoadingStates(prev => ({
//         ...prev,
//         ...(isRetry || page > 1 ? { updating: true } : { initial: true })
//       }));

//       lastSearchRef.current = currentSearch;

//       // Clear timeout
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }

//       // Set timeout for slow searches
//       searchTimeoutRef.current = setTimeout(() => {
//         if (!abortControllerRef.current?.signal.aborted) {
//           setError({
//             type: 'timeout',
//             message: 'Search is taking longer than expected. This might be due to a slow connection.',
//             retryable: true
//           });
//         }
//       }, 10000); // 10 seconds

//       const searchFilters = convertToSearchFilters(filtersFromUrl); // Use the computed filters
//       let searchResult;

//       switch (activeTab) {
//         case 'trending':
//           // Use trending searches to get popular items
//           try {
//             const trendingData = await searchService.getTrendingSearches();
//             setTrendingSearches(trendingData.trending_searches);
            
//             if (trendingData.trending_searches.length > 0 && !searchQuery) {
//               const trendingTerm = trendingData.trending_searches[0].search_term;
//               searchResult = await performSearch(trendingTerm, searchFilters, page);
//             } else {
//               searchResult = await performSearch(searchQuery, searchFilters, page);
//             }
//           } catch (error) {
//             searchResult = await performSearch(searchQuery, searchFilters, page);
//           }
//           break;
          
//         case 'top-rated':
//           const ratedFilters = { ...searchFilters, min_rating: 4 };
//           searchResult = await performSearch(searchQuery, ratedFilters, page);
//           break;
          
//         default:
//           searchResult = await performSearch(searchQuery, searchFilters, page);
//       }

//       // Clear timeout if successful
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//         searchTimeoutRef.current = null;
//       }

//       // Check if component is still mounted
//       if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
//         setSearchState(prev => ({
//           ...prev,
//           query: searchQuery,
//           results: page === 1 ? searchResult.listings : [...prev.results, ...searchResult.listings],
//           totalCount: searchResult.totalCount,
//           hasMore: searchResult.hasMore,
//           currentPage: page
//         }));
        
//         retryCountRef.current = 0;
        
//         // If no results found on first page, show error with suggestions
//         if (searchResult.listings.length === 0 && searchQuery.trim() && page === 1) {
//           handleError({ status: 404 }, 'search', searchQuery);
//         }
//       }

//     } catch (err: any) {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//         searchTimeoutRef.current = null;
//       }

//       if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
//         handleError(err, 'performMainSearch', searchQuery);
//         if (!isRetry && page === 1) {
//           setSearchState(prev => ({ ...prev, results: [] }));
//         }
//       }
//     } finally {
//       if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
//         setLoadingStates({
//           initial: false,
//           updating: false,
//           suggestions: false,
//           trending: false,
//           quickSearch: false
//         });
//       }
//     }
//   }, [
//     searchQuery, 
//     filtersFromUrl, // Use the computed filters from URL
//     sortBy, 
//     activeTab, 
//     convertToSearchFilters, 
//     performSearch, 
//     handleError
//   ]);

//   // Load more results (infinite scroll)
//   const loadMoreResults = useCallback(async () => {
//     if (loadingStates.updating || !searchState.hasMore) return;
    
//     await performMainSearch(false, false, searchState.currentPage + 1);
//   }, [loadingStates.updating, searchState.hasMore, searchState.currentPage, performMainSearch]);

//   // Load trending searches on mount
//   const loadTrendingSearches = useCallback(async () => {
//     try {
//       setLoadingStates(prev => ({ ...prev, trending: true }));
//       const trendingData = await searchService.getTrendingSearches();
//       setTrendingSearches(trendingData.trending_searches);
//     } catch (error) {
//       console.warn('Error loading trending searches:', error);
//     } finally {
//       setLoadingStates(prev => ({ ...prev, trending: false }));
//     }
//   }, []);

//   // Load recent searches
//   const loadRecentSearches = useCallback(() => {
//     const recent = searchService.getRecentSearches();
//     setRecentSearches(recent);
//   }, []);

//   // Initial load
//   useEffect(() => {
//     mountedRef.current = true;
    
//     const initialize = async () => {
//       loadRecentSearches();
//       await Promise.all([
//         performMainSearch(true),
//         loadTrendingSearches()
//       ]);
//     };

//     initialize();

//     return () => {
//       mountedRef.current = false;
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//       if (quickSearchTimeoutRef.current) {
//         clearTimeout(quickSearchTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Debounced search when URL params change (filters change)
//   useEffect(() => {
//     if (loadingStates.initial) return;

//     if (debounceTimeoutRef.current) {
//       clearTimeout(debounceTimeoutRef.current);
//     }

//     debounceTimeoutRef.current = setTimeout(() => {
//       performMainSearch(false, false, 1);
//     }, 600);

//     return () => {
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//     };
//   }, [filtersFromUrl, activeTab, sortBy, performMainSearch, loadingStates.initial]); // Listen to filtersFromUrl changes

//   // Optimized sorted listings with stable sort
//   const sortedListings = useMemo(() => {
//     if (!Array.isArray(searchState.results) || searchState.results.length === 0) return [];

//     const sorted = [...searchState.results];
    
//     switch (sortBy) {
//       case 'price-low':
//         return sorted.sort((a, b) => {
//           const priceA = typeof a.price === 'number' ? a.price : (a.price?.min || 0);
//           const priceB = typeof b.price === 'number' ? b.price : (b.price?.min || 0);
//           return priceA - priceB || a.id.localeCompare(b.id);
//         });
      
//       case 'price-high':
//         return sorted.sort((a, b) => {
//           const priceA = typeof a.price === 'number' ? a.price : (a.price?.max || a.price?.min || 0);
//           const priceB = typeof b.price === 'number' ? b.price : (b.price?.max || b.price?.min || 0);
//           return priceB - priceA || a.id.localeCompare(b.id);
//         });
      
//       case 'rating':
//         return sorted.sort((a, b) => {
//           const ratingDiff = (b.rating || 0) - (a.rating || 0);
//           return ratingDiff !== 0 ? ratingDiff : (b.ratingCount || 0) - (a.ratingCount || 0);
//         });
      
//       case 'newest':
//         return sorted.sort((a, b) => {
//           const dateA = new Date(b.createdAt).getTime();
//           const dateB = new Date(a.createdAt).getTime();
//           return dateA - dateB || a.id.localeCompare(b.id);
//         });
      
//       case 'views':
//         return sorted.sort((a, b) => {
//           const viewsDiff = (b.viewsCount || 0) - (a.viewsCount || 0);
//           return viewsDiff !== 0 ? viewsDiff : a.id.localeCompare(b.id);
//         });
      
//       case 'promoted':
//         return sorted.sort((a, b) => {
//           if (a.isPromoted && !b.isPromoted) return -1;
//           if (!a.isPromoted && b.isPromoted) return 1;
//           const ratingDiff = (b.rating || 0) - (a.rating || 0);
//           return ratingDiff !== 0 ? ratingDiff : a.id.localeCompare(b.id);
//         });
      
//       default:
//         // Relevance - promoted first, then featured, then by rating
//         return sorted.sort((a, b) => {
//           if (a.isPromoted !== b.isPromoted) return b.isPromoted ? 1 : -1;
//           if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
//           const ratingDiff = (b.rating || 0) - (a.rating || 0);
//           return ratingDiff !== 0 ? ratingDiff : a.id.localeCompare(b.id);
//         });
//     }
//   }, [searchState.results, sortBy]);

//   // Event handlers
//   const handleRetry = useCallback(async () => {
//     if (retryCountRef.current >= maxRetries) {
//       setError({
//         type: 'unknown',
//         message: 'Maximum retry attempts reached. Please refresh the page.',
//         retryable: false
//       });
//       return;
//     }

//     retryCountRef.current++;
//     await performMainSearch(true, true, 1);
//   }, [performMainSearch]);

//   const handleClearFilters = useCallback(() => {
//     const newSearchParams = new URLSearchParams();
//     const currentQuery = searchParams.get('search') || searchParams.get('q');
//     if (currentQuery) {
//       newSearchParams.set('search', currentQuery);
//     }
//     setSearchParams(newSearchParams);
//     setSearchState(prev => ({ 
//       ...prev, 
//       relatedResults: [],
//       quickResults: null
//     }));
//   }, [searchParams, setSearchParams]);

//   const handleSuggestionClick = useCallback((suggestion: string) => {
//     const newSearchParams = new URLSearchParams(searchParams);
//     newSearchParams.set('search', suggestion);
//     setSearchParams(newSearchParams);
//     searchService.addToRecentSearches(suggestion);
//     setRecentSearches(searchService.getRecentSearches());
//   }, [searchParams, setSearchParams]);

//   const handleQuickSearchClick = useCallback((suggestion: string) => {
//     setQuickSearchQuery('');
//     setShowQuickSearch(false);
//     handleSuggestionClick(suggestion);
//   }, [handleSuggestionClick]);

//   // Callback for when filters are applied (from FiltersSidebar)
//   const handleFiltersApplied = useCallback(() => {
//     // The FiltersSidebar component handles URL updates internally
//     // We just need to trigger a new search when filters change
//     // This is handled by the useEffect that watches filtersFromUrl
//   }, []);

//   // Component renders
//   const renderSkeletonCards = useCallback(() => {
//     return Array(8).fill(0).map((_, index) => (
//       <ListingCardSkeleton key={`skeleton-${index}`} />
//     ));
//   }, []);

//   const renderListings = useCallback((listingsToRender: UnifiedListing[], startIndex = 0) => {
//     if (!Array.isArray(listingsToRender)) return null;
    
//     return listingsToRender.map((listing, index) => (
//       <ListingCard 
//         key={`${listing.isService ? 'service' : 'product'}-${listing.id}`}
//         listing={listing}
//         loading={false}
//         className={viewMode === 'list' ? 'w-full' : ''}
//         viewMode={viewMode}
//         // priority={index < 4 } // Prioritize first 4 images for loading
//         // index={startIndex + index}
//       />
//     ));
//   }, [viewMode]);

//   // Network error component
//   const NetworkError = () => (
//     <Alert className="mb-6 border-orange-200 bg-orange-50">
//       <WifiOff className="h-4 w-4 text-orange-600" />
//       <AlertDescription className="text-orange-800">
//         <div className="flex items-center justify-between">
//           <span>You appear to be offline. Some features may not work properly.</span>
//           <Button 
//             variant="outline" 
//             size="sm"
//             onClick={() => window.location.reload()}
//             className="ml-2"
//           >
//             <RefreshCw className="h-4 w-4 mr-1" />
//             Refresh
//           </Button>
//         </div>
//       </AlertDescription>
//     </Alert>
//   );

//   // Enhanced loading error component
//   const LoadingError = ({ error }: { error: ErrorState }) => (
//     <Alert className={`mb-6 ${
//       error.type === 'not_found' ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'
//     }`}>
//       <AlertTriangle className={`h-4 w-4 ${
//         error.type === 'not_found' ? 'text-blue-600' : 'text-red-600'
//       }`} />
//       <AlertDescription className={error.type === 'not_found' ? 'text-blue-800' : 'text-red-800'}>
//         <div className="space-y-3">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="font-medium mb-1">
//                 {error.type === 'network' && 'Network Error'}
//                 {error.type === 'timeout' && 'Slow Connection'}
//                 {error.type === 'server' && 'Server Error'}
//                 {error.type === 'not_found' && 'No Results Found'}
//                 {error.type === 'unknown' && 'Error'}
//               </div>
//               <div>{error.message}</div>
//               {retryCountRef.current > 0 && error.retryable && (
//                 <div className="text-sm mt-1">
//                   Retry attempt {retryCountRef.current}/{maxRetries}
//                 </div>
//               )}
//             </div>
//             {error.retryable && (
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 onClick={handleRetry}
//                 disabled={loadingStates.updating}
//                 className="ml-2"
//               >
//                 {loadingStates.updating ? (
//                   <Loader2 className="h-4 w-4 animate-spin mr-1" />
//                 ) : (
//                   <RefreshCw className="h-4 w-4 mr-1" />
//                 )}
//                 {loadingStates.updating ? 'Retrying...' : 'Retry'}
//               </Button>
//             )}
//           </div>
          
//           {/* Search suggestions */}
//           {error.suggestions && error.suggestions.length > 0 && (
//             <div>
//               <p className="text-sm font-medium mb-2">Try searching for:</p>
//               <div className="flex flex-wrap gap-2">
//                 {error.suggestions.map((suggestion, index) => (
//                   <Button
//                     key={`suggestion-${index}`}
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleSuggestionClick(suggestion)}
//                     className="text-xs"
//                   >
//                     <Search className="h-3 w-3 mr-1" />
//                     {suggestion}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </AlertDescription>
//     </Alert>
//   );

//   // Enhanced empty state component
//   const EmptyState = () => (
//     <div className="text-center py-16">
//       <Search className="h-20 w-20 text-gray-300 mx-auto mb-6" />
//       <h3 className="text-xl font-medium text-gray-900 mb-2">
//         {searchQuery ? 'No results found' : 'No listings found'}
//       </h3>
//       <p className="text-gray-500 mb-6 max-w-md mx-auto">
//         {searchQuery 
//           ? `We couldn't find any results for "${searchQuery}". Try adjusting your search terms or browse our suggestions below.`
//           : "No listings match your current filters. Try adjusting your criteria or browse all listings."
//         }
//       </p>
      
//       {/* Recent searches */}
//       {recentSearches.length > 0 && (
//         <div className="mb-6">
//           <p className="text-sm font-medium text-gray-700 mb-3">Recent searches:</p>
//           <div className="flex flex-wrap justify-center gap-2">
//             {recentSearches.slice(0, 4).map((recent, index) => (
//               <Button
//                 key={`recent-${index}`}
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleSuggestionClick(recent)}
//               >
//                 <Clock className="h-4 w-4 mr-1" />
//                 {recent}
//               </Button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Trending searches */}
//       {trendingSearches.length > 0 && (
//         <div className="mb-6">
//           <p className="text-sm font-medium text-gray-700 mb-3">Popular searches:</p>
//           <div className="flex flex-wrap justify-center gap-2">
//             {trendingSearches.slice(0, 5).map((trending, index) => (
//               <Button
//                 key={`trending-${index}`}
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSuggestionClick(trending.search_term)}
//                 className="text-blue-600 hover:bg-blue-50"
//               >
//                 <TrendingUp className="h-4 w-4 mr-1" />
//                 {trending.search_term}
//                 <Badge variant="secondary" className="ml-1 text-xs">
//                   {trending.search_count}
//                 </Badge>
//               </Button>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="flex gap-3 justify-center">
//         <Button variant="outline" onClick={handleClearFilters}>
//           Clear Filters
//         </Button>
//         <Button variant="outline" onClick={() => window.location.reload()}>
//           <RefreshCw className="h-4 w-4 mr-2" />
//           Refresh Page
//         </Button>
//       </div>
//     </div>
//   );

//   // Quick search dropdown
//   const QuickSearchDropdown = () => (
//     searchState.quickResults && showQuickSearch && (
//       <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
//         {loadingStates.quickSearch && (
//           <div className="p-4 text-center">
//             <Loader2 className="h-4 w-4 animate-spin mx-auto" />
//             <p className="text-sm text-gray-500 mt-2">Searching...</p>
//           </div>
//         )}
        
//         {searchState.quickResults && !loadingStates.quickSearch && (
//           <div className="p-2 space-y-2">
//             {/* Quick results */}
//             {[...searchState.quickResults.products, ...searchState.quickResults.services].slice(0, 4).map((item) => {
//               const listing = convertToUnifiedListing(item);
//               return (
//                 <div
//                   key={`quick-${listing.id}`}
//                   className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
//                   onClick={() => handleQuickSearchClick(listing.title)}
//                 >
//                   <img
//                     src={listing.image}
//                     alt={listing.title}
//                     className="w-10 h-10 object-cover rounded"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-medium text-sm truncate">{listing.title}</p>
//                     <p className="text-xs text-gray-500 truncate">{listing.location}</p>
//                   </div>
//                   <Badge variant={listing.isService ? 'secondary' : 'outline'} className="text-xs">
//                     {listing.isService ? 'Service' : 'Product'}
//                   </Badge>
//                 </div>
//               );
//             })}
            
//             {/* Suggestions */}
//             {searchState.quickResults.suggestions.length > 0 && (
//               <div className="border-t pt-2 mt-2">
//                 <p className="text-xs font-medium text-gray-700 mb-2 px-2">Suggestions:</p>
//                 {searchState.quickResults.suggestions.slice(0, 3).map((suggestion, index) => (
//                   <div
//                     key={`suggestion-${index}`}
//                     className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
//                     onClick={() => handleQuickSearchClick(suggestion.query)}
//                   >
//                     <Target className="h-3 w-3 text-gray-400" />
//                     <span className="text-sm">{suggestion.query}</span>
//                     {suggestion.count && (
//                       <Badge variant="outline" className="text-xs ml-auto">
//                         {suggestion.count}
//                       </Badge>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
            
//             {searchState.quickResults.total_count > 4 && (
//               <div className="border-t pt-2 mt-2">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="w-full"
//                   onClick={() => {
//                     handleQuickSearchClick(quickSearchQuery);
//                   }}
//                 >
//                   View all {searchState.quickResults.total_count} results
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     )
//   );

//   const getTabTitle = useCallback((tab: string, count?: number) => {
//     const baseTitle = {
//       'all': 'All',
//       'trending': 'Trending',
//       'top-rated': 'Top Rated'
//     }[tab] || 'All';
    
//     return count !== undefined && count > 0 ? `${baseTitle} (${count})` : baseTitle;
//   }, []);

//   const renderTabContent = useCallback((tabListings: UnifiedListing[], isActiveTab: boolean) => {
//     const isLoading = (loadingStates.initial || (loadingStates.updating && isActiveTab)) && tabListings.length === 0;
//     const hasListings = Array.isArray(tabListings) && tabListings.length > 0;
//     const showEmptyState = !isLoading && !hasListings && !error;

//     if (isLoading) {
//       return (
//         <div className={viewMode === 'grid' ? 
//           'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
//           'space-y-4'
//         }>
//           {renderSkeletonCards()}
//         </div>
//       );
//     }

//     if (showEmptyState) {
//       return <EmptyState />;
//     }

//     if (hasListings) {
//       return (
//         <div className="space-y-6">
//           <div className={viewMode === 'grid' ? 
//             'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
//             'space-y-4'
//           }>
//             {renderListings(tabListings)}
//           </div>
          
//           {/* Load more button */}
//           {searchState.hasMore && (
//             <div className="text-center py-6">
//               <Button
//                 variant="outline"
//                 onClick={loadMoreResults}
//                 disabled={loadingStates.updating}
//                 className="px-8"
//               >
//                 {loadingStates.updating ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     Loading more...
//                   </>
//                 ) : (
//                   <>
//                     <Eye className="h-4 w-4 mr-2" />
//                     Load More Results
//                   </>
//                 )}
//               </Button>
//             </div>
//           )}
//         </div>
//       );
//     }

//     return null;
//   }, [viewMode, loadingStates, error, renderSkeletonCards, renderListings, searchState.hasMore, loadMoreResults]);

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Network status */}
//         {!isOnline && <NetworkError />}
        
//         {/* Error display */}
//         {error && <LoadingError error={error} />}

//         {/* Header with enhanced search */}
//         {loadingStates.initial && !error ? (
//           <HeaderSkeleton />
//         ) : (
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
//             <div className="flex-1">
//               <div className="flex items-center gap-3 mb-2">
//                 <h1 className="text-3xl font-bold text-gray-900">
//                   {searchQuery ? `Results for "${searchQuery}"` : 'Browse Listings'}
//                 </h1>
//                 {!isOnline && <WifiOff className="h-5 w-5 text-orange-500" />}
//                 {isOnline && <Wifi className="h-5 w-5 text-green-500" />}
//                 {loadingStates.suggestions && (
//                   <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
//                 )}
//               </div>
              
//               <div className="flex items-center gap-4 mb-4">
//                 <p className="text-gray-600">
//                   {loadingStates.updating ? (
//                     <span className="flex items-center gap-2">
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       Searching...
//                     </span>
//                   ) : (
//                     <>
//                       {sortedListings.length} {sortedListings.length === 1 ? 'listing' : 'listings'} found
//                       {searchState.totalCount > sortedListings.length && (
//                         <span className="ml-2 text-blue-600">
//                           (showing {sortedListings.length} of {searchState.totalCount})
//                         </span>
//                       )}
//                     </>
//                   )}
//                 </p>
//               </div>

//               {/* Enhanced search bar */}
//               <div className="relative max-w-md">
//                 <Input
//                   placeholder="Quick search..."
//                   value={quickSearchQuery}
//                   onChange={(e) => {
//                     setQuickSearchQuery(e.target.value);
//                     performQuickSearch(e.target.value);
//                     setShowQuickSearch(true);
//                   }}
//                   onFocus={() => {
//                     if (quickSearchQuery) {
//                       setShowQuickSearch(true);
//                     }
//                   }}
//                   onBlur={() => {
//                     // Delay hiding to allow clicking on results
//                     setTimeout(() => setShowQuickSearch(false), 150);
//                   }}
//                   className="pr-10"
//                 />
//                 <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <QuickSearchDropdown />
//               </div>
//             </div>
            
//             {/* Controls */}
//             <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mt-4 sm:mt-0">
//               {/* Sort Dropdown */}
//               <Select 
//                 value={sortBy} 
//                 onValueChange={setSortBy} 
//                 disabled={loadingStates.updating}
//               >
//                 <SelectTrigger className="w-full sm:w-48">
//                   <SelectValue placeholder="Sort by" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="relevance">Most Relevant</SelectItem>
//                   <SelectItem value="promoted">Promoted First</SelectItem>
//                   <SelectItem value="newest">Newest First</SelectItem>
//                   <SelectItem value="price-low">Price: Low to High</SelectItem>
//                   <SelectItem value="price-high">Price: High to Low</SelectItem>
//                   <SelectItem value="rating">Highest Rated</SelectItem>
//                   <SelectItem value="views">Most Viewed</SelectItem>
//                 </SelectContent>
//               </Select>

//               {/* Mobile Filters */}
//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button variant="outline" className="md:hidden">
//                     <Filter className="h-4 w-4 mr-2" />
//                     Filters
//                     {/* Show active filter count */}
//                     {(filtersFromUrl.categories.length > 0 || 
//                       filtersFromUrl.locations.countries.length > 0 || 
//                       filtersFromUrl.locations.states.length > 0 || 
//                       filtersFromUrl.locations.cities.length > 0 ||
//                       filtersFromUrl.priceRange[0] > 0 || 
//                       filtersFromUrl.priceRange[1] < 10000 ||
//                       filtersFromUrl.rating > 0 ||
//                       filtersFromUrl.isService !== null ||
//                       filtersFromUrl.productCondition !== null ||
//                       filtersFromUrl.isPromoted !== null ||
//                       filtersFromUrl.isFeatured !== null ||
//                       filtersFromUrl.servesRemote !== null ||
//                       filtersFromUrl.isVerified !== null) && (
//                       <Badge variant="secondary" className="ml-2 text-xs">
//                         Active
//                       </Badge>
//                     )}
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="left" className="w-80">
//                   <FiltersSidebar 
//                     loading={loadingStates.updating}
//                     onFiltersApplied={handleFiltersApplied}
//                   />
//                 </SheetContent>
//               </Sheet>

//               {/* View Toggle */}
//               <div className="hidden md:flex items-center border rounded-lg overflow-hidden">
//                 <Button
//                   variant={viewMode === 'grid' ? 'default' : 'ghost'}
//                   size="sm"
//                   onClick={() => setViewMode('grid')}
//                   disabled={loadingStates.updating}
//                 >
//                   <Grid className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant={viewMode === 'list' ? 'default' : 'ghost'}
//                   size="sm"
//                   onClick={() => setViewMode('list')}
//                   disabled={loadingStates.updating}
//                 >
//                   <List className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex gap-8">
//           {/* Desktop Filters */}
//           <div className="hidden md:block w-80 flex-shrink-0">
//             <div className="sticky top-6">
//               <FiltersSidebar 
//                 loading={loadingStates.updating}
//                 onFiltersApplied={handleFiltersApplied}
//               />
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1 min-w-0">
//             {/* Trending searches banner */}
//             {!searchQuery && trendingSearches.length > 0 && !loadingStates.initial && (
//               <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
//                 <div className="flex items-center gap-2 mb-2">
//                   <TrendingUp className="h-4 w-4 text-blue-600" />
//                   <h3 className="font-medium text-blue-900">Trending Searches</h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {trendingSearches.slice(0, 6).map((trending, index) => (
//                     <button
//                       key={`trending-banner-${index}`}
//                       onClick={() => handleSuggestionClick(trending.search_term)}
//                       className="text-sm bg-white text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors border border-blue-200"
//                     >
//                       {trending.search_term}
//                       <span className="ml-1 text-xs text-blue-500">
//                         ({trending.search_count})
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Tabs */}
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
//               <TabsList className="grid w-full grid-cols-3 mb-6">
//                 <TabsTrigger 
//                   value="all" 
//                   disabled={loadingStates.updating}
//                   className="flex items-center gap-2"
//                 >
//                   <List className="h-4 w-4" />
//                   {getTabTitle('all', sortedListings.length)}
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="trending" 
//                   disabled={loadingStates.updating}
//                   className="flex items-center gap-2"
//                 >
//                   <TrendingUp className="h-4 w-4" />
//                   {getTabTitle('trending')}
//                   {loadingStates.trending && (
//                     <Loader2 className="h-3 w-3 animate-spin ml-1" />
//                   )}
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="top-rated" 
//                   disabled={loadingStates.updating}
//                   className="flex items-center gap-2"
//                 >
//                   <Star className="h-4 w-4" />
//                   {getTabTitle('top-rated')}
//                 </TabsTrigger>
//               </TabsList>

//               {/* Loading indicator */}
//               {loadingStates.updating && sortedListings.length > 0 && (
//                 <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
//                   <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
//                   <span className="text-sm text-blue-700">
//                     Updating results...
//                   </span>
//                 </div>
//               )}

//               {/* Tab Contents */}
//               <TabsContent value="all" className="mt-0">
//                 {renderTabContent(sortedListings, activeTab === 'all')}
//               </TabsContent>

//               <TabsContent value="trending" className="mt-0">
//                 {renderTabContent(sortedListings, activeTab === 'trending')}
//               </TabsContent>

//               <TabsContent value="top-rated" className="mt-0">
//                 {renderTabContent(sortedListings, activeTab === 'top-rated')}
//               </TabsContent>
//             </Tabs>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ListingGrid;