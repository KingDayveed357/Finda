import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock, ArrowRight, Package, Briefcase, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { searchService, type QuickSearchResult, type TrendingSearchesResponse } from '@/service/searchService';
import { categoryService, type Category } from '@/service/categoryService';
import { useDebounce } from '@/hooks/useDebounce';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearchModal = ({ isOpen, onClose }: MobileSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickResults, setQuickResults] = useState<QuickSearchResult | null>(null);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearchesResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadInitialData = async () => {
        setIsInitialLoading(true);
        try {
          const [trending, recent, categories] = await Promise.all([
            searchService.getTrendingSearches(),
            Promise.resolve(searchService.getRecentSearches()),
            categoryService.getCategories()
          ]);
          
          setTrendingSearches(trending);
          setRecentSearches(recent);
          setPopularCategories(categories.slice(0, 4)); // Limit for mobile UI
        } catch (error) {
          console.error('Failed to load initial search data:', error);
          setError('Failed to load search suggestions');
        } finally {
          setIsInitialLoading(false);
        }
      };

      loadInitialData();

      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when modal closes
      setSearchQuery('');
      setQuickResults(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

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

    if (isOpen) {
      performQuickSearch();
    }
  }, [debouncedSearchQuery, isOpen]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchService.addToRecentSearches(query);
      navigate(`/listings?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/listings?category=${category.slug}`);
    onClose();
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleServiceClick = (slug: string) => {
    navigate(`/service/${slug}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const getCategoryCount = (category: Category): number => {
    const productCount = category.products_count || 0;
    const serviceCount = category.services_count || 0;
    
    switch (category.category_type) {
      case 'both':
        return productCount + serviceCount;
      case 'product':
        return productCount;
      case 'service':
        return serviceCount;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-full overflow-y-auto h-full sm:max-w-md sm:h-auto bg-background/95 backdrop-blur-md border-0 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center p-4 border-b bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search products and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-lg placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
              />
              {isLoading && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </form>
            {/* <Button variant="ghost" size="sm" onClick={onClose} className="ml-2">
              <X className="h-5 w-5" />
            </Button> */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Error State */}
            {error && (
              <div className="text-red-500 text-sm py-2 text-center">{error}</div>
            )}

            {/* Quick Results */}
            {quickResults && !isLoading && searchQuery.length >= 2 && (
              <div className="space-y-4">
                {/* AI Suggestions */}
                {quickResults.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Suggestions
                    </h3>
                    <div className="space-y-2">
                      {quickResults.suggestions.slice(0, 4).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(suggestion.query)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span>{suggestion.query}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {quickResults.products.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Products
                    </h3>
                    <div className="space-y-2">
                      {quickResults.products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.slug)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center space-x-3 group"
                        >
                          <img
                            src={product.featured_image_url || '/placeholder-product.jpg'}
                            alt={product.product_name}
                            className="h-12 w-12 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {product.product_name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-primary font-medium">
                                {product.formatted_price}
                              </span>
                              {product.discount_percentage > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  -{product.discount_percentage}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.full_location}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services */}
                {quickResults.services.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Services
                    </h3>
                    <div className="space-y-2">
                      {quickResults.services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceClick(service.slug)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center space-x-3 group"
                        >
                          <img
                            src={service.featured_image_url || '/placeholder-service.jpg'}
                            alt={service.service_name}
                            className="h-12 w-12 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-service.jpg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {service.service_name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-primary font-medium">
                                {service.formatted_price_range}
                              </span>
                              {service.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              by {service.provider_name}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Results */}
                {quickResults.total_count > 0 && (
                  <div className="border-t pt-3">
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="w-full text-center py-3 text-primary hover:text-primary/80 font-medium text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      View all {quickResults.total_count}+ results
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && searchQuery.length >= 2 && quickResults && 
             quickResults.products.length === 0 && quickResults.services.length === 0 && 
             quickResults.suggestions.length === 0 && (

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </h3>
                    <div className="space-y-2">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{search}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
              
            )}

            {/* Recent and Trending Searches (when no query) */}
            {!searchQuery && !isInitialLoading && (
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </h3>
                    <div className="space-y-2">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{search}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {trendingSearches && trendingSearches.trending_searches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trending Searches
                    </h3>
                    <div className="space-y-2">
                      {trendingSearches.trending_searches.slice(0, 5).map((trending, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(trending.search_term)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>{trending.search_term}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {trending.search_count}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Categories */}
                {popularCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Popular Categories
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {popularCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category)}
                          className="p-4 rounded-lg border hover:bg-muted transition-colors text-center"
                        >
                          <div className="text-2xl mb-2">{category.icon || '📁'}</div>
                          <div className="font-medium text-sm">{category.name}</div>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {getCategoryCount(category)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && searchQuery.length >= 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Initial Loading State */}
            {isInitialLoading && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSearchModal;