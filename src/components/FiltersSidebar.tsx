// components/FiltersSidebar.tsx
import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  memo 
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp, AlertCircle, Loader2, Search, Filter } from 'lucide-react';
import { categoryService, type Category } from '../service/categoryService';
import { locationService, type Country, type State, type City } from '@/service/locationService';
// import { searchService } from '@/service/searchService';

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

interface FiltersSidebarProps {
  loading?: boolean;
  onFiltersApplied?: () => void; // Callback when filters are applied
}

// Define the sections type
type FilterSectionKey = 'type' | 'categories' | 'price' | 'rating' | 'location' | 'condition' | 'features';

interface ExpandedSections {
  type: boolean;
  categories: boolean;
  price: boolean;
  rating: boolean;
  location: boolean;
  condition: boolean;
  features: boolean;
}

// Enhanced cache with better memory management
class FilterDataCache {
  private static instance: FilterDataCache;
  private cache = new Map<string, { data: any; timestamp: number; expiry: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Auto cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  public static getInstance(): FilterDataCache {
    if (!FilterDataCache.instance) {
      FilterDataCache.instance = new FilterDataCache();
    }
    return FilterDataCache.instance;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      if (item) this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      if (item) this.cache.delete(key);
      return false;
    }
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Memoized skeleton components
const SkeletonItem = memo(({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
));

const CategorySkeleton = memo(() => (
  <div className="space-y-2">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <SkeletonItem className="w-4 h-4" />
        <SkeletonItem className="h-4 w-32" />
        <SkeletonItem className="h-3 w-8 ml-auto" />
      </div>
    ))}
  </div>
));

const LocationSkeleton = memo(({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <SkeletonItem className="w-4 h-4" />
        <SkeletonItem className="h-4 w-24" />
      </div>
    ))}
  </div>
));

// Memoized filter section component
const FilterSection = memo(({ 
  title, 
  section, 
  children,
  isLoading = false,
  error = null,
  expandedSections,
  onToggle
}: { 
  title: string; 
  section: FilterSectionKey; 
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  expandedSections: ExpandedSections;
  onToggle: (section: FilterSectionKey) => void;
}) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <button
      className="flex items-center justify-between w-full text-left"
      onClick={() => onToggle(section)}
      type="button"
    >
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        {title}
        {error && <AlertCircle className="h-4 w-4 text-red-500" />}
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
      </h3>
      {expandedSections[section] ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
    {expandedSections[section] && (
      <div className="mt-3 space-y-3">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        {children}
      </div>
    )}
  </div>
));

// Main FiltersSidebar component with URL params integration
const FiltersSidebar = memo(({ 
  loading = false,
  onFiltersApplied
}: FiltersSidebarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Stable refs to prevent unnecessary re-renders
  const cache = useRef(FilterDataCache.getInstance());
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Consolidated state
  const [state, setState] = useState({
    expandedSections: {
      type: true,
      categories: true,
      price: true,
      rating: true,
      location: false,
      condition: false,
      features: false
    } as ExpandedSections,
    availableCategories: [] as Category[],
    availableCountries: [] as Country[],
    availableStates: [] as State[],
    availableCities: [] as City[],
    loadingStates: {
      categories: false,
      countries: false,
      states: false,
      cities: false
    },
    errors: {
      categories: null as string | null,
      countries: null as string | null,
      states: null as string | null,
      cities: null as string | null
    }
  });

  // Parse filters from URL params
  const filtersFromUrl = useMemo((): UIFilters => {
    const filters: UIFilters = {
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

    // Parse categories
    const categories = searchParams.get('categories');
    if (categories) {
      filters.categories = categories.split(',').map(Number).filter(n => !isNaN(n));
    }

    // Parse single category (for backward compatibility)
    const category = searchParams.get('category');
    if (category && !isNaN(Number(category))) {
      const categoryId = Number(category);
      if (!filters.categories.includes(categoryId)) {
        filters.categories.push(categoryId);
      }
    }

    // Parse locations
    const countries = searchParams.get('countries');
    if (countries) {
      filters.locations.countries = countries.split(',').map(Number).filter(n => !isNaN(n));
    }

    const states = searchParams.get('states');
    if (states) {
      filters.locations.states = states.split(',').map(Number).filter(n => !isNaN(n));
    }

    const cities = searchParams.get('cities');
    if (cities) {
      filters.locations.cities = cities.split(',').map(Number).filter(n => !isNaN(n));
    }

    // Parse location (general location string)
    const location = searchParams.get('location');
    if (location && !isNaN(Number(location))) {
      const locationId = Number(location);
      // Try to determine if it's a country, state, or city
      // For now, we'll add it to countries as a fallback
      if (!filters.locations.countries.includes(locationId)) {
        filters.locations.countries.push(locationId);
      }
    }

    // Parse price range
    const minPrice = searchParams.get('min_price') || searchParams.get('minPrice');
    const maxPrice = searchParams.get('max_price') || searchParams.get('maxPrice');
    if (minPrice && !isNaN(Number(minPrice))) {
      filters.priceRange[0] = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filters.priceRange[1] = Number(maxPrice);
    }

    // Parse rating
    const rating = searchParams.get('min_rating') || searchParams.get('rating');
    if (rating && !isNaN(Number(rating))) {
      filters.rating = Number(rating);
    }

    // Parse item type
    const itemType = searchParams.get('item_type') || searchParams.get('type');
    if (itemType === 'services') {
      filters.isService = true;
    } else if (itemType === 'products') {
      filters.isService = false;
    }

    // Parse product condition
    const condition = searchParams.get('condition') || searchParams.get('product_condition');
    if (condition && ['new', 'used', 'refurbished'].includes(condition)) {
      filters.productCondition = condition;
    }

    // Parse feature flags
    const promoted = searchParams.get('promoted') || searchParams.get('is_promoted');
    if (promoted === 'true') {
      filters.isPromoted = true;
    }

    const featured = searchParams.get('featured') || searchParams.get('is_featured');
    if (featured === 'true') {
      filters.isFeatured = true;
    }

    const remote = searchParams.get('remote') || searchParams.get('serves_remote');
    if (remote === 'true') {
      filters.servesRemote = true;
    }

    const verified = searchParams.get('verified') || searchParams.get('is_verified');
    if (verified === 'true') {
      filters.isVerified = true;
    }

    return filters;
  }, [searchParams]);

  // Memoized update functions to prevent recreation
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateLoadingState = useCallback((key: string, value: boolean) => {
    setState(prev => ({
      ...prev,
      loadingStates: { ...prev.loadingStates, [key]: value }
    }));
  }, []);

  const updateErrorState = useCallback((key: string, value: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: value }
    }));
  }, []);

  // Update URL params with filters
  const updateUrlParams = useCallback((filters: UIFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams);

      // Preserve existing search query
      const currentQuery = searchParams.get('search') || searchParams.get('q');
      if (currentQuery) {
        newSearchParams.set('search', currentQuery);
      }

      // Update categories
      if (filters.categories.length > 0) {
        newSearchParams.set('categories', filters.categories.join(','));
      } else {
        newSearchParams.delete('categories');
        newSearchParams.delete('category');
      }

      // Update locations
      if (filters.locations.countries.length > 0) {
        newSearchParams.set('countries', filters.locations.countries.join(','));
      } else {
        newSearchParams.delete('countries');
      }

      if (filters.locations.states.length > 0) {
        newSearchParams.set('states', filters.locations.states.join(','));
      } else {
        newSearchParams.delete('states');
      }

      if (filters.locations.cities.length > 0) {
        newSearchParams.set('cities', filters.locations.cities.join(','));
      } else {
        newSearchParams.delete('cities');
      }

      // Remove general location param if we have specific location filters
      if (filters.locations.countries.length > 0 || filters.locations.states.length > 0 || filters.locations.cities.length > 0) {
        newSearchParams.delete('location');
      }

      // Update price range
      if (filters.priceRange[0] > 0) {
        newSearchParams.set('min_price', filters.priceRange[0].toString());
      } else {
        newSearchParams.delete('min_price');
        newSearchParams.delete('minPrice');
      }

      if (filters.priceRange[1] < 10000) {
        newSearchParams.set('max_price', filters.priceRange[1].toString());
      } else {
        newSearchParams.delete('max_price');
        newSearchParams.delete('maxPrice');
      }

      // Update rating
      if (filters.rating > 0) {
        newSearchParams.set('min_rating', filters.rating.toString());
      } else {
        newSearchParams.delete('min_rating');
        newSearchParams.delete('rating');
      }

      // Update item type
      if (filters.isService === true) {
        newSearchParams.set('item_type', 'services');
      } else if (filters.isService === false) {
        newSearchParams.set('item_type', 'products');
      } else {
        newSearchParams.delete('item_type');
        newSearchParams.delete('type');
      }

      // Update product condition
      if (filters.productCondition) {
        newSearchParams.set('condition', filters.productCondition);
      } else {
        newSearchParams.delete('condition');
        newSearchParams.delete('product_condition');
      }

      // Update feature flags
      if (filters.isPromoted) {
        newSearchParams.set('promoted', 'true');
      } else {
        newSearchParams.delete('promoted');
        newSearchParams.delete('is_promoted');
      }

      if (filters.isFeatured) {
        newSearchParams.set('featured', 'true');
      } else {
        newSearchParams.delete('featured');
        newSearchParams.delete('is_featured');
      }

      if (filters.servesRemote) {
        newSearchParams.set('remote', 'true');
      } else {
        newSearchParams.delete('remote');
        newSearchParams.delete('serves_remote');
      }

      if (filters.isVerified) {
        newSearchParams.set('verified', 'true');
      } else {
        newSearchParams.delete('verified');
        newSearchParams.delete('is_verified');
      }

      setSearchParams(newSearchParams);
      onFiltersApplied?.();
    }, 300); // Debounce URL updates
  }, [searchParams, setSearchParams, onFiltersApplied]);

  // Optimized data loading functions
  const loadCategories = useCallback(async (force = false) => {
    const cacheKey = 'categories';
    
    if (!force && cache.current.has(cacheKey)) {
      const cached = cache.current.get<Category[]>(cacheKey);
      if (cached) {
        updateState({ availableCategories: cached });
        return;
      }
    }

    if (state.loadingStates.categories) return;
    
    updateLoadingState('categories', true);
    updateErrorState('categories', null);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const categories = await categoryService.getCategories();
      
      if (mountedRef.current) {
        cache.current.set(cacheKey, categories);
        updateState({ availableCategories: categories });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error loading categories:', error);
      if (mountedRef.current) {
        updateErrorState('categories', 'Failed to load categories');
        
        const stale = cache.current.get<Category[]>(cacheKey);
        if (stale) {
          updateState({ availableCategories: stale });
        }
      }
    } finally {
      if (mountedRef.current) {
        updateLoadingState('categories', false);
      }
    }
  }, [state.loadingStates.categories, updateState, updateLoadingState, updateErrorState]);

  const loadCountries = useCallback(async (force = false) => {
    const cacheKey = 'countries';
    
    if (!force && cache.current.has(cacheKey)) {
      const cached = cache.current.get<Country[]>(cacheKey);
      if (cached) {
        updateState({ availableCountries: cached });
        return;
      }
    }

    if (state.loadingStates.countries) return;
    
    updateLoadingState('countries', true);
    updateErrorState('countries', null);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const countries = await locationService.getCountries();
      
      if (mountedRef.current) {
        cache.current.set(cacheKey, countries);
        updateState({ availableCountries: countries });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error loading countries:', error);
      if (mountedRef.current) {
        updateErrorState('countries', 'Failed to load countries');
        
        const stale = cache.current.get<Country[]>(cacheKey);
        if (stale) {
          updateState({ availableCountries: stale });
        }
      }
    } finally {
      if (mountedRef.current) {
        updateLoadingState('countries', false);
      }
    }
  }, [state.loadingStates.countries, updateState, updateLoadingState, updateErrorState]);

  const loadStates = useCallback(async (countryId: number, force = false) => {
    const cacheKey = `states-${countryId}`;
    
    if (!force && cache.current.has(cacheKey)) {
      const cached = cache.current.get<State[]>(cacheKey);
      if (cached) {
        updateState({ availableStates: cached });
        return;
      }
    }

    if (state.loadingStates.states) return;
    
    updateLoadingState('states', true);
    updateErrorState('states', null);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const states = await locationService.getStatesByCountry(countryId);
      
      if (mountedRef.current) {
        cache.current.set(cacheKey, states);
        updateState({ availableStates: states });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error loading states:', error);
      if (mountedRef.current) {
        updateErrorState('states', 'Failed to load states');
        
        const stale = cache.current.get<State[]>(cacheKey);
        if (stale) {
          updateState({ availableStates: stale });
        } else {
          updateState({ availableStates: [] });
        }
      }
    } finally {
      if (mountedRef.current) {
        updateLoadingState('states', false);
      }
    }
  }, [state.loadingStates.states, updateState, updateLoadingState, updateErrorState]);

  const loadCities = useCallback(async (stateId: number, force = false) => {
    const cacheKey = `cities-${stateId}`;
    
    if (!force && cache.current.has(cacheKey)) {
      const cached = cache.current.get<City[]>(cacheKey);
      if (cached) {
        updateState({ availableCities: cached });
        return;
      }
    }

    if (state.loadingStates.cities) return;
    
    updateLoadingState('cities', true);
    updateErrorState('cities', null);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const cities = await locationService.getCitiesByState(stateId);
      
      if (mountedRef.current) {
        cache.current.set(cacheKey, cities);
        updateState({ availableCities: cities });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error loading cities:', error);
      if (mountedRef.current) {
        updateErrorState('cities', 'Failed to load cities');
        
        const stale = cache.current.get<City[]>(cacheKey);
        if (stale) {
          updateState({ availableCities: stale });
        } else {
          updateState({ availableCities: [] });
        }
      }
    } finally {
      if (mountedRef.current) {
        updateLoadingState('cities', false);
      }
    }
  }, [state.loadingStates.cities, updateState, updateLoadingState, updateErrorState]);

  // Initial data loading effect
  useEffect(() => {
    const initializeFilters = async () => {
      await Promise.allSettled([
        loadCategories(),
        new Promise(resolve => setTimeout(resolve, 100)).then(() => loadCountries())
      ]);
    };

    initializeFilters();
  }, [loadCategories, loadCountries]);

  // Location dependency effects with debouncing
  useEffect(() => {
    if (filtersFromUrl.locations.countries.length > 0) {
      const countryId = filtersFromUrl.locations.countries[0];
      const timeoutId = setTimeout(() => {
        loadStates(countryId);
      }, 150);

      return () => clearTimeout(timeoutId);
    } else {
      updateState({ 
        availableStates: [], 
        availableCities: [] 
      });
    }
  }, [filtersFromUrl.locations.countries, loadStates, updateState]);

  useEffect(() => {
    if (filtersFromUrl.locations.states.length > 0) {
      const stateId = filtersFromUrl.locations.states[0];
      const timeoutId = setTimeout(() => {
        loadCities(stateId);
      }, 150);

      return () => clearTimeout(timeoutId);
    } else {
      updateState({ availableCities: [] });
    }
  }, [filtersFromUrl.locations.states, loadCities, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Memoized computed values
  const isInitialLoading = useMemo(() => {
    return state.loadingStates.categories && state.availableCategories.length === 0;
  }, [state.loadingStates.categories, state.availableCategories.length]);

  const getFilterCount = useMemo(() => {
    let count = 0;
    if (filtersFromUrl.categories.length > 0) count++;
    if (filtersFromUrl.locations.countries.length > 0 || filtersFromUrl.locations.states.length > 0 || filtersFromUrl.locations.cities.length > 0) count++;
    if (filtersFromUrl.priceRange[0] > 0 || filtersFromUrl.priceRange[1] < 10000) count++;
    if (filtersFromUrl.rating > 0) count++;
    if (filtersFromUrl.isService !== null) count++;
    if (filtersFromUrl.productCondition !== null) count++;
    if (filtersFromUrl.isPromoted !== null) count++;
    if (filtersFromUrl.isFeatured !== null) count++;
    if (filtersFromUrl.servesRemote !== null) count++;
    if (filtersFromUrl.isVerified !== null) count++;
    return count;
  }, [filtersFromUrl]);

  // Optimized event handlers with useCallback
  const toggleSection = useCallback((section: FilterSectionKey) => {
    setState(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [section]: !prev.expandedSections[section]
      }
    }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: number, checked: boolean) => {
    const newCategories = checked 
      ? [...filtersFromUrl.categories, categoryId]
      : filtersFromUrl.categories.filter(c => c !== categoryId);
    
    updateUrlParams({
      ...filtersFromUrl,
      categories: newCategories
    });
  }, [filtersFromUrl, updateUrlParams]);

  const handleCountryChange = useCallback((countryId: number, checked: boolean) => {
    const newCountries = checked ? [countryId] : [];
    
    updateUrlParams({
      ...filtersFromUrl,
      locations: {
        ...filtersFromUrl.locations,
        countries: newCountries,
        states: [],
        cities: []
      }
    });
  }, [filtersFromUrl, updateUrlParams]);

  const handleStateChange = useCallback((stateId: number, checked: boolean) => {
    const newStates = checked ? [stateId] : [];
    
    updateUrlParams({
      ...filtersFromUrl,
      locations: {
        ...filtersFromUrl.locations,
        states: newStates,
        cities: []
      }
    });
  }, [filtersFromUrl, updateUrlParams]);

  const handleCityChange = useCallback((cityId: number, checked: boolean) => {
    const newCities = checked 
      ? [...filtersFromUrl.locations.cities, cityId]
      : filtersFromUrl.locations.cities.filter(c => c !== cityId);
    
    updateUrlParams({
      ...filtersFromUrl,
      locations: {
        ...filtersFromUrl.locations,
        cities: newCities
      }
    });
  }, [filtersFromUrl, updateUrlParams]);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    updateUrlParams({
      ...filtersFromUrl,
      priceRange: range
    });
  }, [filtersFromUrl, updateUrlParams]);

  const handleRatingChange = useCallback((rating: number) => {
    updateUrlParams({
      ...filtersFromUrl,
      rating
    });
  }, [filtersFromUrl, updateUrlParams]);

  const handleTypeChange = useCallback((isService: boolean | null) => {
    updateUrlParams({
      ...filtersFromUrl,
      isService
    });
  }, [filtersFromUrl, updateUrlParams]);

  const clearAllFilters = useCallback(() => {
    const newSearchParams = new URLSearchParams();
    const currentQuery = searchParams.get('search') || searchParams.get('q');
    if (currentQuery) {
      newSearchParams.set('search', currentQuery);
    }
    setSearchParams(newSearchParams);
    onFiltersApplied?.();
  }, [searchParams, setSearchParams, onFiltersApplied]);

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <SkeletonItem className="h-6 w-24" />
          <SkeletonItem className="h-8 w-20" />
        </div>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <SkeletonItem className="h-5 w-16 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <SkeletonItem className="w-4 h-4" />
                  <SkeletonItem className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <SkeletonItem className="h-5 w-20 mb-3" />
            <CategorySkeleton />
          </div>
          <div className="border-b border-gray-200 pb-4">
            <SkeletonItem className="h-5 w-24 mb-3" />
            <SkeletonItem className="h-2 w-full mb-2" />
            <div className="flex justify-between">
              <SkeletonItem className="h-4 w-12" />
              <SkeletonItem className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters {getFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getFilterCount}
            </Badge>
          )}
        </h2>
        {getFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Type Filter */}
      <FilterSection 
        title="Type" 
        section="type"
        expandedSections={state.expandedSections}
        onToggle={toggleSection}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-types"
              checked={filtersFromUrl.isService === null}
              onCheckedChange={() => handleTypeChange(null)}
            />
            <Label htmlFor="all-types">All (Products & Services)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="products-only"
              checked={filtersFromUrl.isService === false}
              onCheckedChange={() => handleTypeChange(false)}
            />
            <Label htmlFor="products-only">Products Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="services-only"
              checked={filtersFromUrl.isService === true}
              onCheckedChange={() => handleTypeChange(true)}
            />
            <Label htmlFor="services-only">Services Only</Label>
          </div>
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection 
        title="Categories" 
        section="categories"
        isLoading={state.loadingStates.categories}
        error={state.errors.categories}
        expandedSections={state.expandedSections}
        onToggle={toggleSection}
      >
        {state.loadingStates.categories && state.availableCategories.length === 0 ? (
          <CategorySkeleton />
        ) : (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.availableCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filtersFromUrl.categories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm text-gray-700 truncate flex-1 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{category.icon}</span>
                    {category.name}
                    <span className="text-xs text-gray-500 ml-auto">
                      ({(category.products_count || 0) + (category.services_count || 0)})
                    </span>
                  </Label>
                </div>
              ))}
            </div>

            {/* Selected categories */}
            {filtersFromUrl.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filtersFromUrl.categories.map((categoryId) => {
                  const category = state.availableCategories.find(c => c.id === categoryId);
                  return (
                    <Badge key={categoryId} variant="secondary" className="text-xs">
                      {category?.icon} {category?.name || `Category ${categoryId}`}
                      <button
                        onClick={() => handleCategoryChange(categoryId, false)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection 
        title="Price Range" 
        section="price"
        expandedSections={state.expandedSections}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={filtersFromUrl.priceRange}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₦{filtersFromUrl.priceRange[0].toLocaleString()}</span>
            <span>₦{filtersFromUrl.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection 
        title="Minimum Rating" 
        section="rating"
        expandedSections={state.expandedSections}
        onToggle={toggleSection}
      >
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filtersFromUrl.rating === rating}
                onCheckedChange={() => handleRatingChange(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                {rating === 0 ? (
                  'Any Rating'
                ) : (
                  <div className="flex items-center">
                    {Array.from({ length: rating }, (_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                    <span className="ml-1 text-sm text-gray-600">& up</span>
                  </div>
                )}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection 
        title="Location" 
        section="location"
        isLoading={state.loadingStates.countries || state.loadingStates.states || state.loadingStates.cities}
        error={state.errors.countries || state.errors.states || state.errors.cities}
        expandedSections={state.expandedSections}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          {/* Countries */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Countries
            </Label>
            {state.loadingStates.countries && state.availableCountries.length === 0 ? (
              <LocationSkeleton count={5} />
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {state.availableCountries.slice(0, 10).map((country) => (
                  <div key={country.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country.id}`}
                      checked={filtersFromUrl.locations.countries.includes(country.id)}
                      onCheckedChange={(checked) => 
                        handleCountryChange(country.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`country-${country.id}`}
                      className="text-sm text-gray-700 truncate flex-1 cursor-pointer"
                    >
                      {country.flag_emoji} {country.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* States */}
          {(state.availableStates.length > 0 || state.loadingStates.states) && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                States/Regions
              </Label>
              {state.loadingStates.states ? (
                <LocationSkeleton count={4} />
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {state.availableStates.map((stateItem) => (
                    <div key={stateItem.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`state-${stateItem.id}`}
                        checked={filtersFromUrl.locations.states.includes(stateItem.id)}
                        onCheckedChange={(checked) => 
                          handleStateChange(stateItem.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`state-${stateItem.id}`}
                        className="text-sm text-gray-700 truncate flex-1 cursor-pointer"
                      >
                        {stateItem.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cities */}
          {(state.availableCities.length > 0 || state.loadingStates.cities) && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Cities
              </Label>
              {state.loadingStates.cities ? (
                <LocationSkeleton count={6} />
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {state.availableCities.slice(0, 20).map((city) => (
                    <div key={city.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`city-${city.id}`}
                        checked={filtersFromUrl.locations.cities.includes(city.id)}
                        onCheckedChange={(checked) => 
                          handleCityChange(city.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`city-${city.id}`}
                        className="text-sm text-gray-700 truncate flex-1 cursor-pointer"
                      >
                        {city.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected locations */}
          {(filtersFromUrl.locations.countries.length > 0 || 
            filtersFromUrl.locations.states.length > 0 || 
            filtersFromUrl.locations.cities.length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2">Selected:</div>
              <div className="flex flex-wrap gap-1">
                {/* Selected countries */}
                {filtersFromUrl.locations.countries.map((countryId) => {
                  const country = state.availableCountries.find(c => c.id === countryId);
                  return (
                    <Badge key={`selected-country-${countryId}`} variant="outline" className="text-xs">
                      {country?.flag_emoji} {country?.name || `Country ${countryId}`}
                      <button
                        onClick={() => handleCountryChange(countryId, false)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {/* Selected states */}
                {filtersFromUrl.locations.states.map((stateId) => {
                  const stateItem = state.availableStates.find(s => s.id === stateId);
                  return (
                    <Badge key={`selected-state-${stateId}`} variant="outline" className="text-xs">
                      {stateItem?.display_name || `State ${stateId}`}
                      <button
                        onClick={() => handleStateChange(stateId, false)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {/* Selected cities */}
                {filtersFromUrl.locations.cities.map((cityId) => {
                  const city = state.availableCities.find(c => c.id === cityId);
                  return (
                    <Badge key={`selected-city-${cityId}`} variant="outline" className="text-xs">
                      {city?.name || `City ${cityId}`}
                      <button
                        onClick={() => handleCityChange(cityId, false)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Product Condition (only show when products are selected) */}
      {filtersFromUrl.isService !== true && (
        <FilterSection 
          title="Product Condition" 
          section="condition"
          expandedSections={state.expandedSections}
          onToggle={toggleSection}
        >
          <div className="space-y-2">
            {[
              { value: null, label: 'Any Condition' },
              { value: 'new', label: 'New' },
              { value: 'used', label: 'Used' },
              { value: 'refurbished', label: 'Refurbished' }
            ].map((condition) => (
              <div key={condition.value || 'any'} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition.value || 'any'}`}
                  checked={filtersFromUrl.productCondition === condition.value}
                  onCheckedChange={() => 
                    updateUrlParams({
                      ...filtersFromUrl,
                      productCondition: condition.value
                    })
                  }
                />
                <Label htmlFor={`condition-${condition.value || 'any'}`} className="cursor-pointer">
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Features */}
      <FilterSection 
        title="Features" 
        section="features"
        expandedSections={state.expandedSections}
        onToggle={toggleSection}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="promoted"
              checked={filtersFromUrl.isPromoted === true}
              onCheckedChange={(checked) => 
                updateUrlParams({
                  ...filtersFromUrl,
                  isPromoted: checked ? true : null
                })
              }
            />
            <Label htmlFor="promoted" className="cursor-pointer">Promoted</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filtersFromUrl.isFeatured === true}
              onCheckedChange={(checked) => 
                updateUrlParams({
                  ...filtersFromUrl,
                  isFeatured: checked ? true : null
                })
              }
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
          </div>
          {filtersFromUrl.isService !== false && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={filtersFromUrl.servesRemote === true}
                  onCheckedChange={(checked) => 
                    updateUrlParams({
                      ...filtersFromUrl,
                      servesRemote: checked ? true : null
                    })
                  }
                />
                <Label htmlFor="remote" className="cursor-pointer">Serves Remote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filtersFromUrl.isVerified === true}
                  onCheckedChange={(checked) => 
                    updateUrlParams({
                      ...filtersFromUrl,
                      isVerified: checked ? true : null
                    })
                  }
                />
                <Label htmlFor="verified" className="cursor-pointer">Verified Provider</Label>
              </div>
            </>
          )}
        </div>
      </FilterSection>

      {/* Apply Filters Button (Mobile) */}
      <div className="mt-6 md:hidden">
        <Button 
          className="w-full" 
          disabled={loading}
          onClick={() => onFiltersApplied?.()}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Applying...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters ({getFilterCount})
            </>
          )}
        </Button>
      </div>

      {/* Filter Summary */}
      {getFilterCount > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-1">
            {filtersFromUrl.categories.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filtersFromUrl.categories.length} categor{filtersFromUrl.categories.length === 1 ? 'y' : 'ies'}
              </Badge>
            )}
            {(filtersFromUrl.locations.countries.length > 0 || 
              filtersFromUrl.locations.states.length > 0 || 
              filtersFromUrl.locations.cities.length > 0) && (
              <Badge variant="secondary" className="text-xs">
                Location
              </Badge>
            )}
            {(filtersFromUrl.priceRange[0] > 0 || filtersFromUrl.priceRange[1] < 10000) && (
              <Badge variant="secondary" className="text-xs">
                Price: ₦{filtersFromUrl.priceRange[0].toLocaleString()} - ₦{filtersFromUrl.priceRange[1].toLocaleString()}
              </Badge>
            )}
            {filtersFromUrl.rating > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filtersFromUrl.rating}+ stars
              </Badge>
            )}
            {filtersFromUrl.isService !== null && (
              <Badge variant="secondary" className="text-xs">
                {filtersFromUrl.isService ? 'Services' : 'Products'} only
              </Badge>
            )}
            {filtersFromUrl.productCondition && (
              <Badge variant="secondary" className="text-xs">
                {filtersFromUrl.productCondition}
              </Badge>
            )}
            {filtersFromUrl.isPromoted && (
              <Badge variant="secondary" className="text-xs">
                Promoted
              </Badge>
            )}
            {filtersFromUrl.isFeatured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            {filtersFromUrl.servesRemote && (
              <Badge variant="secondary" className="text-xs">
                Remote
              </Badge>
            )}
            {filtersFromUrl.isVerified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default FiltersSidebar;