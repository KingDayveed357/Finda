import { useState, useMemo } from "react";
import { Grid, List, MoreHorizontal, TrendingUp, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/chatbot/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  seller: {
    name: string;
    type: 'amazon' | 'jumia' | 'ebay' | 'finda' | 'upwork';
    rating: number;
    reviewCount: number;
    responseTime: string;
    verificationLevel: string;
  };
  // featured_image_url:string;
  images: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  location: string;
  description: string;
  specifications: { [key: string]: string };
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }>;
  explanation: string;
  tags: string[];
  discount?: string;
}

interface SearchPerformance {
  time: string;
  sources: string[];
}

interface SearchResultsGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onShowFilters: () => void;
  searchPerformance: SearchPerformance;
}

export const SearchResultsGrid = ({ 
  products, 
  onProductClick, 
  onShowFilters,
  searchPerformance 
}: SearchResultsGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'delivery'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Enhanced product analytics
  const productAnalytics = useMemo(() => {
    if (products.length === 0) return null;

    const prices = products
      .map(p => parseFloat(String(p.price).replace(/[^0-9.]/g, '')))
      .filter(p => !isNaN(p));
    
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    const sellerTypes = products.reduce((acc, p) => {
      acc[p.seller.type] = (acc[p.seller.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocations = products.reduce((acc, p) => {
      acc[p.location] = (acc[p.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgPrice,
      minPrice,
      maxPrice,
      priceRange: `${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}`,
      sellerTypes,
      topLocations,
      avgRating: products.reduce((sum, p) => sum + p.rating, 0) / products.length,
      totalDiscounted: products.filter(p => p.discount).length 
    };
  }, [products]);

  // Sort products based on selected criteria
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
          const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
          const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
          return priceB - priceA;
        });
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'delivery':
        const deliveryOrder = ['Same day', 'Next day', '1-2 days', '2-3 days', '3-5 days'];
        return sorted.sort((a, b) => {
          const indexA = deliveryOrder.findIndex(d => a.deliveryTime.includes(d)) || 999;
          const indexB = deliveryOrder.findIndex(d => b.deliveryTime.includes(d)) || 999;
          return indexA - indexB;
        });
      default:
        return sorted; // relevance (default order from API)
    }
  }, [products, sortBy]);

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'rating': return 'Highest Rated';
      case 'delivery': return 'Fastest Delivery';
      default: return 'Best Match';
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header with Analytics */}
      <div className="p-4 border-b bg-muted/30 space-y-3">
        {/* Title and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold">Search Results</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {products.length} found
            </Badge>
            {productAnalytics && productAnalytics.totalDiscounted > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                {productAnalytics.totalDiscounted} on sale
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === 'grid' ? 'bg-muted' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === 'list' ? 'bg-muted' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Found in {searchPerformance.time}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                Sources: {searchPerformance.sources.join(', ')}
              </span>
            </div>
            {productAnalytics && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">
                    Avg: ★{productAnalytics.avgRating.toFixed(1)}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Best Match</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="delivery">Fastest Delivery</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onShowFilters}
              className="hidden sm:flex"
            >
              Filters
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onShowFilters}
              className="sm:hidden h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {productAnalytics && (
          <div className="flex items-center justify-between text-xs bg-muted/50 rounded-lg p-2">
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">
                Price range: <span className="font-medium">{productAnalytics.priceRange}</span>
              </span>
              <span className="text-muted-foreground">
                Avg: <span className="font-medium">{productAnalytics.avgPrice.toFixed(0)}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {Object.entries(productAnalytics.sellerTypes).slice(0, 3).map(([seller, count]) => (
                <Badge key={seller} variant="outline" className="text-xs">
                  {seller} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pagination info and progress for large result sets */}
        {products.length > itemsPerPage && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, products.length)} of {products.length}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Progress 
                value={(currentPage / totalPages) * 100} 
                className="w-16 h-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              seller={product.seller}
              // featured_image_url={product.featured_image_url}
              image={product.images[0]}
              rating={product.rating}
              reviewCount={product.reviewCount}
              deliveryTime={product.deliveryTime}
              location={product.location}
              explanation={product.explanation}
              tags={product.tags}
              discount={product.discount}
              onClick={() => onProductClick(product)}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Empty State */}
        {paginatedProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No results found for current filters on page {currentPage}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(1)}
            >
              Go to First Page
            </Button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Search Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Results:</span>
              <div className="font-medium">{products.length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Current Sort:</span>
              <div className="font-medium">{getSortLabel(sortBy)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">View Mode:</span>
              <div className="font-medium capitalize">{viewMode}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Search Time:</span>
              <div className="font-medium">{searchPerformance.time}</div>
            </div>
          </div>
          
          {productAnalytics && (
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Price Range:</span>
                  <div className="font-medium">{productAnalytics.priceRange}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Rating:</span>
                  <div className="font-medium">★ {productAnalytics.avgRating.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">On Sale:</span>
                  <div className="font-medium">{productAnalytics.totalDiscounted} items</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};