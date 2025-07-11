
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import FiltersSidebar from '@/components/FiltersSidebar';
import AIRecommendations from '@/components/AIRecommendations';
import AISearchSuggestions from '@/components/AISearchSuggestions';
import { mockListings} from '@/lib/mock-ai';
import type { Listing } from '@/lib/mock-ai';
import { useSearchHistory } from '@/hooks/useSearchHistory';

const ListingGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const { addToHistory, getRecentSearches } = useSearchHistory();
  const [filters, setFilters] = useState({
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
    locations: [] as string[],
    priceRange: [0, 2000] as [number, number],
    rating: 0,
    isService: null as boolean | null
  });

  const searchQuery = searchParams.get('search');
  const currentCategory = searchParams.get('category');
  const searchHistory = getRecentSearches();

  useEffect(() => {
    let filtered = [...mockListings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      // Add to search history
      addToHistory(searchQuery, currentCategory || undefined);
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(listing => filters.categories.includes(listing.category));
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(listing => filters.locations.includes(listing.location));
    }

    // Price filter
    filtered = filtered.filter(listing => {
      const price = typeof listing.price === 'number' ? listing.price : listing.price.max;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(listing => listing.rating >= filters.rating);
    }

    // Type filter
    if (filters.isService !== null) {
      filtered = filtered.filter(listing => listing.isService === filters.isService);
    }

    // AI-enhanced sorting
    switch (sortBy) {
      case 'ai-relevance':
        // AI-powered relevance sorting (mock implementation)
        filtered.sort((a, b) => {
          const aScore = searchQuery ? 
            (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
            (a.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ? 1 : 0) : 0;
          const bScore = searchQuery ? 
            (b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
            (b.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ? 1 : 0) : 0;
          return (bScore + b.rating) - (aScore + a.rating);
        });
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : a.price.min;
          const priceB = typeof b.price === 'number' ? b.price : b.price.min;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : a.price.max;
          const priceB = typeof b.price === 'number' ? b.price : b.price.max;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.reverse();
        break;
    }

    setFilteredListings(filtered);
  }, [searchQuery, filters, sortBy, currentCategory]);

  const handleAISearch = (query: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('search', query);
    setSearchParams(newSearchParams);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI-Enhanced Search */}
        <div className="mb-8 flex justify-center">
          <AISearchSuggestions 
            onSearch={handleAISearch}
            searchHistory={searchHistory}
            placeholder="Search with AI-powered suggestions..."
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {searchQuery ? `AI Results for "${searchQuery}"` : 'All Listings'}
              <Sparkles className="h-6 w-6 text-blue-600" />
            </h1>
            <p className="text-gray-600">
              {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'} found
              {searchQuery && ' • Powered by AI recommendations'}
            </p>
          </div>
          
<div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mt-4 sm:mt-0">
  {/* AI Recommendations Toggle */}
  <Button
    variant={showAIRecommendations ? 'default' : 'outline'}
    size="sm"
    onClick={() => setShowAIRecommendations(!showAIRecommendations)}
    className="flex items-center gap-2"
  >
    <Sparkles className="h-4 w-4" />
    AI Recommendations
  </Button>

  {/* Mobile Row: Sort + Filters */}
  <div className="flex w-full sm:w-auto gap-4 sm:gap-0 sm:flex-row justify-between sm:justify-start">
    {/* Sort Dropdown */}
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ai-relevance">🤖 AI Relevance</SelectItem>
        <SelectItem value="relevance">Most Relevant</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
        <SelectItem value="rating">Highest Rated</SelectItem>
        <SelectItem value="newest">Newest First</SelectItem>
      </SelectContent>
    </Select>

    {/* Mobile Filters Button */}
    <Sheet >
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden  sm:w-auto">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
      </SheetContent>
    </Sheet>
  </div>

  {/* Grid/List View Toggle (Only visible on md and above) */}
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

        {/* AI Recommendations Section */}
        {showAIRecommendations && (
          <div className="mb-8">
            <AIRecommendations 
              searchHistory={searchHistory}
              currentCategory={currentCategory || undefined}
              userPreferences={{
                priceRange: filters.priceRange,
                locations: filters.locations,
                ratings: filters.rating
              }}
            />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Listings */}
          <div className="flex-1">
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-4">No listings found</p>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                <Button onClick={() => setShowAIRecommendations(true)} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Show AI Recommendations
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }>
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingGrid;
