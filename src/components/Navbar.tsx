
import { useState } from 'react';
import { Search, Menu, User, Heart, ShoppingCart, MessageCircle, Wallet, BarChart3, Gift, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockCategories } from '@/lib/mock-ai';
import MobileSearchModal from './MobileSearchModal';
import { useIsMobile } from '@/hooks/use-Mobile';
import { useSearchHistory } from '@/hooks/useSearchHistory';

const NavBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadMessages] = useState(3);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { addToHistory } = useSearchHistory();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

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
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search with AI assistance..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-20 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <Button variant="ghost" className="hidden md:flex">
                    <Menu className="h-4 w-4 mr-2" />
                    Categories
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {mockCategories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link to={`/listings?category=${category.id}`} className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span>{category.name}</span>
                        <span className="ml-auto text-xs text-gray-500">({category.count})</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Actions */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link to="/rewards">
                      <Gift className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link to="/wallet">
                      <Wallet className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/messages" className="relative">
                      <MessageCircle className="h-4 w-4" />
                      {unreadMessages > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                          {unreadMessages}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/customer-dashboard">Customer Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor-dashboard">Vendor Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/analytics">Analytics</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
