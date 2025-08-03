import { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { categoryService} from '@/service/categoryService';
import type { Category } from '@/service/categoryService';
interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearchModal = ({ isOpen, onClose }: MobileSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const navigate = useNavigate();

  // Mock AI search recommendations - could be replaced with real trending data
  const trendingSearches = [
    'Photography Services',
    'Web Development',
    'Graphic Design',
    'Digital Marketing',
    'Content Writing'
  ];

  const recentSearches = [
    'Logo Design',
    'SEO Services',
    'Mobile App Development'
  ];

  // Fetch popular categories when modal opens
  useEffect(() => {
    if (isOpen && popularCategories.length === 0) {
      const fetchPopularCategories = async () => {
        setIsLoadingCategories(true);
        try {
          // Fetch all categories since none are marked as featured yet
          const categories = await categoryService.getCategories();
          // Limit to 4 categories for better mobile UI
          setPopularCategories(categories.slice(0, 4));
        } catch (error) {
          console.error('Failed to load popular categories:', error);
          // Keep empty array to prevent infinite loading
          setPopularCategories([]);
        } finally {
          setIsLoadingCategories(false);
        }
      };

      fetchPopularCategories();
    }
  }, [isOpen, popularCategories.length]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsLoading(true);
      // Simulate AI search suggestions
      const timeout = setTimeout(() => {
        const mockSuggestions = [
          `${searchQuery} services`,
          `${searchQuery} expert`,
          `${searchQuery} consultant`,
          `${searchQuery} freelancer`
        ];
        setSuggestions(mockSuggestions);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timeout);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/listings?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/listings?category=${category.slug}`);
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
      <DialogContent className="p-0 max-w-full h-full sm:max-w-md sm:h-auto bg-background/95 backdrop-blur-md border-0 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center p-4 border-b">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                autoFocus
              />
            </form>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  AI Suggestions
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center space-x-3"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {!searchQuery && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending Searches
                </h3>
                <div className="space-y-2">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center space-x-3"
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center space-x-3"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            {!searchQuery && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Popular Categories
                </h3>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : popularCategories.length > 0 ? (
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
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No categories available
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSearchModal;