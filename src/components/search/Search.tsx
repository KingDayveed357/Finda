// components/search/SearchComponent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, TrendingUp, Clock, ArrowRight} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchService, type QuickSearchResult, type TrendingSearchesResponse } from '@/service/searchService';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchComponentProps {
  placeholder?: string;
  className?: string;
  onSearchComplete?: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder = "Search with AI assistance...",
  className = "",
  onSearchComplete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [quickResults, setQuickResults] = useState<QuickSearchResult | null>(null);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearchesResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [trending, recent] = await Promise.all([
          searchService.getTrendingSearches(),
          Promise.resolve(searchService.getRecentSearches())
        ]);
        
        setTrendingSearches(trending);
        setRecentSearches(recent);
      } catch (error) {
        console.error('Failed to load initial search data:', error);
        setError('Failed to load search suggestions');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Perform quick search when query changes
  useEffect(() => {
    const performQuickSearch = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setQuickResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchService.quickSearch(debouncedSearchQuery);
        setQuickResults(results);
      } catch (error) {
        console.error('Quick search failed:', error);
        setError('Search suggestions unavailable');
        setQuickResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    performQuickSearch();
  }, [debouncedSearchQuery]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    searchService.addToRecentSearches(query);
    setRecentSearches(searchService.getRecentSearches());
    navigate(`/listings?search=${encodeURIComponent(query)}`);
    setSearchQuery('');
    setIsOpen(false);
    onSearchComplete?.();
  }, [navigate, onSearchComplete]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      setIsLoading(true);
    }
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  // Handle product/service click
  // const handleResultClick = (type: 'product' | 'service', slug: string) => {
  //   const path = type === 'product' ? `/product/${slug}` : `/service/${slug}`;
  //   navigate(path);
  //   setIsOpen(false);
  //   onSearchComplete?.();
  // };

  // const formatPrice = (price: number, currencySymbol: string = '₦') => {
  //   return `${currencySymbol}${price.toLocaleString()}`;
  // };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="w-full pl-4 pr-20 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
        >
          <Search className="h-4 w-4" />
          <Sparkles className="h-3 w-3" />
        </Button>
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            {/* Loading State */}
            {(isLoading && searchQuery.length >= 2) && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500 text-sm py-2">{error}</div>
            )}

            {/* Quick Results */}
            {quickResults && !isLoading && searchQuery.length >= 2 && (
              <div className="space-y-4">
                {/* Search Suggestions */}
                {quickResults.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Recent Searches
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{search}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {trendingSearches && trendingSearches.trending_searches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Trending Searches
                    </h4>
                    <div className="space-y-1">
                      {trendingSearches.trending_searches.slice(0, 5).map((trending, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(trending.search_term)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{trending.search_term}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {trending.search_count}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && searchQuery.length >= 2 && quickResults && 
             quickResults.products.length === 0 && quickResults.services.length === 0 && 
             quickResults.suggestions.length === 0 && (
            <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{search}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>
            )}

            {/* Initial Loading State */}
            {isInitialLoading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;