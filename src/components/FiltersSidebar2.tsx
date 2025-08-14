// components/FiltersSidebar.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { categoryService, type Category } from '../service/categoryService';
import { locationService, type Country, type State, type City } from '@/service/locationService';

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
  filters: UIFilters;
  onFiltersChange: (filters: UIFilters) => void;
  loading?: boolean;
}

// Cache structure for storing fetched data
interface FilterCache {
  categories: Category[];
  countries: Country[];
  states: Map<number, State[]>; // countryId -> states
  cities: Map<number, City[]>; // stateId -> cities
  lastFetch: {
    categories: number;
    countries: number;
    states: Map<number, number>; // countryId -> timestamp
    cities: Map<number, number>; // stateId -> timestamp
  };
}

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Global cache instance
let filterCache: FilterCache = {
  categories: [],
  countries: [],
  states: new Map(),
  cities: new Map(),
  lastFetch: {
    categories: 0,
    countries: 0,
    states: new Map(),
    cities: new Map(),
  }
};

// Skeleton loading components
const SkeletonItem = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const CategorySkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <SkeletonItem className="w-4 h-4" />
        <SkeletonItem className="h-4 w-32" />
        <SkeletonItem className="h-3 w-8 ml-auto" />
      </div>
    ))}
  </div>
);

const LocationSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <SkeletonItem className="w-4 h-4" />
        <SkeletonItem className="h-4 w-24" />
      </div>
    ))}
  </div>
);

const FiltersSidebar = ({ 
  filters, 
  onFiltersChange,
  loading = false
}: FiltersSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    categories: true,
    price: true,
    rating: true,
    location: false,
    condition: false,
    features: false
  });

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  
  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    countries: false,
    states: false,
    cities: false
  });

  const [errors, setErrors] = useState({
    categories: null as string | null,
    countries: null as string | null,
    states: null as string | null,
    cities: null as string | null
  });

  // Helper function to check if cache is valid
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_EXPIRY;
  };

  // Helper function to update loading state
  const updateLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function to update error state
  const updateErrorState = useCallback((key: keyof typeof errors, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  // Load categories with caching
  const loadCategories = useCallback(async () => {
    // Check cache first
    if (filterCache.categories.length > 0 && isCacheValid(filterCache.lastFetch.categories)) {
      setAvailableCategories(filterCache.categories);
      return;
    }

    updateLoadingState('categories', true);
    updateErrorState('categories', null);

    try {
      const categories = await categoryService.getCategories();
      filterCache.categories = categories;
      filterCache.lastFetch.categories = Date.now();
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      updateErrorState('categories', 'Failed to load categories');
      // Use cached data if available
      if (filterCache.categories.length > 0) {
        setAvailableCategories(filterCache.categories);
      }
    } finally {
      updateLoadingState('categories', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load countries with caching
  const loadCountries = useCallback(async () => {
    // Check cache first
    if (filterCache.countries.length > 0 && isCacheValid(filterCache.lastFetch.countries)) {
      setAvailableCountries(filterCache.countries);
      return;
    }

    updateLoadingState('countries', true);
    updateErrorState('countries', null);

    try {
      const countries = await locationService.getCountries();
      filterCache.countries = countries;
      filterCache.lastFetch.countries = Date.now();
      setAvailableCountries(countries);
    } catch (error) {
      console.error('Error loading countries:', error);
      updateErrorState('countries', 'Failed to load countries');
      // Use cached data if available
      if (filterCache.countries.length > 0) {
        setAvailableCountries(filterCache.countries);
      }
    } finally {
      updateLoadingState('countries', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load states with caching
  const loadStates = useCallback(async (countryId: number) => {
    // Check cache first
    const cachedStates = filterCache.states.get(countryId);
    const lastFetch = filterCache.lastFetch.states.get(countryId) || 0;
    
    if (cachedStates && isCacheValid(lastFetch)) {
      setAvailableStates(cachedStates);
      return;
    }

    updateLoadingState('states', true);
    updateErrorState('states', null);

    try {
      const states = await locationService.getStatesByCountry(countryId);
      filterCache.states.set(countryId, states);
      filterCache.lastFetch.states.set(countryId, Date.now());
      setAvailableStates(states);
    } catch (error) {
      console.error('Error loading states:', error);
      updateErrorState('states', 'Failed to load states');
      // Use cached data if available
      const fallbackStates = filterCache.states.get(countryId);
      if (fallbackStates) {
        setAvailableStates(fallbackStates);
      } else {
        setAvailableStates([]);
      }
    } finally {
      updateLoadingState('states', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Load cities with caching
  const loadCities = useCallback(async (stateId: number) => {
    // Check cache first
    const cachedCities = filterCache.cities.get(stateId);
    const lastFetch = filterCache.lastFetch.cities.get(stateId) || 0;
    
    if (cachedCities && isCacheValid(lastFetch)) {
      setAvailableCities(cachedCities);
      return;
    }

    updateLoadingState('cities', true);
    updateErrorState('cities', null);

    try {
      const cities = await locationService.getCitiesByState(stateId);
      filterCache.cities.set(stateId, cities);
      filterCache.lastFetch.cities.set(stateId, Date.now());
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error loading cities:', error);
      updateErrorState('cities', 'Failed to load cities');
      // Use cached data if available
      const fallbackCities = filterCache.cities.get(stateId);
      if (fallbackCities) {
        setAvailableCities(fallbackCities);
      } else {
        setAvailableCities([]);
      }
    } finally {
      updateLoadingState('cities', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Initial load of categories and countries
  useEffect(() => {
    const initializeFilters = async () => {
      await Promise.all([
        loadCategories(),
        loadCountries()
      ]);
    };

    initializeFilters();
  }, [loadCategories, loadCountries]);

  // Load states when countries change
  useEffect(() => {
    if (filters.locations.countries.length > 0) {
      const countryId = filters.locations.countries[0];
      loadStates(countryId);
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [filters.locations.countries, loadStates]);

  // Load cities when states change
  useEffect(() => {
    if (filters.locations.states.length > 0) {
      const stateId = filters.locations.states[0];
      loadCities(stateId);
    } else {
      setAvailableCities([]);
    }
  }, [filters.locations.states, loadCities]);

  // Memoized loading state
  const isInitialLoading = useMemo(() => {
    return loadingStates.categories && availableCategories.length === 0;
  }, [loadingStates.categories, availableCategories.length]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: number, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, categoryId]
      : filters.categories.filter(c => c !== categoryId);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  }, [filters, onFiltersChange]);

  const handleCountryChange = useCallback((countryId: number, checked: boolean) => {
    const newCountries = checked 
      ? [countryId] // Only allow one country selection for simplicity
      : [];
    
    onFiltersChange({
      ...filters,
      locations: {
        ...filters.locations,
        countries: newCountries,
        states: [], // Reset states when country changes
        cities: []  // Reset cities when country changes
      }
    });
  }, [filters, onFiltersChange]);

  const handleStateChange = useCallback((stateId: number, checked: boolean) => {
    const newStates = checked 
      ? [stateId] // Only allow one state selection
      : [];
    
    onFiltersChange({
      ...filters,
      locations: {
        ...filters.locations,
        states: newStates,
        cities: [] // Reset cities when state changes
      }
    });
  }, [filters, onFiltersChange]);

  const handleCityChange = useCallback((cityId: number, checked: boolean) => {
    const newCities = checked 
      ? [...filters.locations.cities, cityId]
      : filters.locations.cities.filter(c => c !== cityId);
    
    onFiltersChange({
      ...filters,
      locations: {
        ...filters.locations,
        cities: newCities
      }
    });
  }, [filters, onFiltersChange]);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: range
    });
  }, [filters, onFiltersChange]);

  const handleRatingChange = useCallback((rating: number) => {
    onFiltersChange({
      ...filters,
      rating
    });
  }, [filters, onFiltersChange]);

  const handleTypeChange = useCallback((isService: boolean | null) => {
    onFiltersChange({
      ...filters,
      isService
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
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
    });
  }, [onFiltersChange]);

  const getFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.locations.countries.length > 0 || filters.locations.states.length > 0 || filters.locations.cities.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.rating > 0) count++;
    if (filters.isService !== null) count++;
    if (filters.productCondition !== null) count++;
    if (filters.isPromoted !== null) count++;
    if (filters.isFeatured !== null) count++;
    if (filters.servesRemote !== null) count++;
    if (filters.isVerified !== null) count++;
    return count;
  }, [filters]);

  const FilterSection = ({ 
    title, 
    section, 
    children,
    // isLoading = false,
    error = null
  }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    children: React.ReactNode;
    isLoading?: boolean;
    error?: string | null;
  }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => toggleSection(section)}
      >
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {title}
          {error && <AlertCircle className="h-4 w-4 text-red-500" />}
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
  );

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <SkeletonItem className="h-6 w-24" />
          <SkeletonItem className="h-8 w-20" />
        </div>
        <div className="space-y-6">
          {/* Type section skeleton */}
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
          {/* Categories section skeleton */}
          <div className="border-b border-gray-200 pb-4">
            <SkeletonItem className="h-5 w-20 mb-3" />
            <CategorySkeleton />
          </div>
          {/* Price range skeleton */}
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
        <h2 className="text-lg font-semibold text-gray-900">
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
      <FilterSection title="Type" section="type">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-types"
              checked={filters.isService === null}
              onCheckedChange={() => handleTypeChange(null)}
            />
            <Label htmlFor="all-types">All (Products & Services)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="products-only"
              checked={filters.isService === false}
              onCheckedChange={() => handleTypeChange(false)}
            />
            <Label htmlFor="products-only">Products Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="services-only"
              checked={filters.isService === true}
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
        isLoading={loadingStates.categories}
        error={errors.categories}
      >
        {loadingStates.categories && availableCategories.length === 0 ? (
          <CategorySkeleton />
        ) : (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm text-gray-700 truncate flex-1 flex items-center gap-2"
                  >
                    <span>{category.icon}</span>
                    {category.name}
                    <span className="text-xs text-gray-500">
                      ({(category.products_count || 0) + (category.services_count || 0)})
                    </span>
                  </Label>
                </div>
              ))}
            </div>

            {/* Selected categories */}
            {filters.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.categories.map((categoryId) => {
                  const category = availableCategories.find(c => c.id === categoryId);
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
      <FilterSection title="Price Range" section="price">
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${filters.priceRange[0].toLocaleString()}</span>
            <span>${filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating" section="rating">
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={() => handleRatingChange(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center">
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
        isLoading={loadingStates.countries || loadingStates.states || loadingStates.cities}
        error={errors.countries || errors.states || errors.cities}
      >
        <div className="space-y-4">
          {/* Countries */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Countries
            </Label>
            {loadingStates.countries && availableCountries.length === 0 ? (
              <LocationSkeleton count={5} />
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableCountries.slice(0, 10).map((country) => (
                  <div key={country.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country.id}`}
                      checked={filters.locations.countries.includes(country.id)}
                      onCheckedChange={(checked) => 
                        handleCountryChange(country.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`country-${country.id}`}
                      className="text-sm text-gray-700 truncate flex-1"
                    >
                      {country.flag_emoji} {country.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* States */}
          {(availableStates.length > 0 || loadingStates.states) && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                States/Regions
              </Label>
              {loadingStates.states ? (
                <LocationSkeleton count={4} />
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableStates.map((state) => (
                    <div key={state.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`state-${state.id}`}
                        checked={filters.locations.states.includes(state.id)}
                        onCheckedChange={(checked) => 
                          handleStateChange(state.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`state-${state.id}`}
                        className="text-sm text-gray-700 truncate flex-1"
                      >
                        {state.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cities */}
          {(availableCities.length > 0 || loadingStates.cities) && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Cities
              </Label>
              {loadingStates.cities ? (
                <LocationSkeleton count={6} />
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableCities.slice(0, 20).map((city) => (
                    <div key={city.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`city-${city.id}`}
                        checked={filters.locations.cities.includes(city.id)}
                        onCheckedChange={(checked) => 
                          handleCityChange(city.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`city-${city.id}`}
                        className="text-sm text-gray-700 truncate flex-1"
                      >
                        {city.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Product Condition (only show when products are selected) */}
      {filters.isService !== true && (
        <FilterSection title="Product Condition" section="condition">
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
                  checked={filters.productCondition === condition.value}
                  onCheckedChange={() => 
                    onFiltersChange({
                      ...filters,
                      productCondition: condition.value
                    })
                  }
                />
                <Label htmlFor={`condition-${condition.value || 'any'}`}>
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Features */}
      <FilterSection title="Features" section="features">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="promoted"
              checked={filters.isPromoted === true}
              onCheckedChange={(checked) => 
                onFiltersChange({
                  ...filters,
                  isPromoted: checked ? true : null
                })
              }
            />
            <Label htmlFor="promoted">Promoted</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.isFeatured === true}
              onCheckedChange={(checked) => 
                onFiltersChange({
                  ...filters,
                  isFeatured: checked ? true : null
                })
              }
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
          {filters.isService !== false && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={filters.servesRemote === true}
                  onCheckedChange={(checked) => 
                    onFiltersChange({
                      ...filters,
                      servesRemote: checked ? true : null
                    })
                  }
                />
                <Label htmlFor="remote">Serves Remote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.isVerified === true}
                  onCheckedChange={(checked) => 
                    onFiltersChange({
                      ...filters,
                      isVerified: checked ? true : null
                    })
                  }
                />
                <Label htmlFor="verified">Verified Provider</Label>
              </div>
            </>
          )}
        </div>
      </FilterSection>

      {/* Apply Filters Button (Mobile) */}
      <div className="mt-6 md:hidden">
        <Button className="w-full" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Applying...
            </>
          ) : (
            `Apply Filters (${getFilterCount})`
          )}
        </Button>
      </div>
    </div>
  );
};

export default FiltersSidebar;