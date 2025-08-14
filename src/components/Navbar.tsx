import { useState, useEffect } from 'react';
import { Search, Menu, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobileSearchModal from './MobileSearchModal';
import SearchComponent from '@/components/search/Search';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import AuthStatus from '@/components/auth/AuthStatus';
import { categoryService } from '@/service/categoryService';
import type { Category } from '@/service/categoryService';

const NavBar = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        // Fetch all categories for the dropdown
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Optionally set some fallback categories or show an error state
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Finda</span>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </Link>

            {/* AI-Enhanced Search Bar - Desktop Only */}
            {!isMobile && (
              <div className="flex-1 max-w-2xl mx-8">
                <SearchComponent
                  placeholder="Search with AI assistance..."
                  className="w-full"
                />
              </div>
            )}

            {/* Mobile Search Icon */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden flex items-center gap-1"
              >
                <Search className="h-5 w-5" />
                <Sparkles className="h-4 w-4 text-blue-600" />
              </Button>
            )}

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {/* Categories Dropdown - Hidden on mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex" disabled={isLoadingCategories}>
                    <Menu className="h-4 w-4 mr-2" />
                    {isLoadingCategories ? 'Loading...' : 'Categories'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <DropdownMenuItem key={category.id} asChild>
                        <Link to={`/listings?category=${category.id}`} className="flex items-center">
                          <span className="mr-1 text-lg">{category.icon || '📁'}</span>
                          <span>{category.name}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {(category.products_count !== undefined || category.services_count !== undefined) && (
                              (() => {
                                const productCount = category.products_count ?? 0;
                                const serviceCount = category.services_count ?? 0;

                                if (category.category_type === 'both') {
                                  return `(${productCount + serviceCount})`;
                                }

                                return `(${productCount || serviceCount})`; // show whichever is relevant
                              })()
                            )}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      {isLoadingCategories ? 'Loading categories...' : 'No categories available'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Show AuthStatus if authenticated, otherwise show Sign In/Sign Up buttons */}
              {isAuthenticated() ? (
                <AuthStatus />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link to="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      <MobileSearchModal 
        isOpen={isMobileSearchOpen} 
        onClose={() => setIsMobileSearchOpen(false)} 
      />
    </>
  );
};

export default NavBar;