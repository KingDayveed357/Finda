import { Sparkles, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import AuthStatus from '@/components/auth/AuthStatus';
import { Link } from 'react-router-dom';

interface FindaHeaderProps {
  onToggleSidebar?: () => void;
}

export const FindaHeader = ({ onToggleSidebar }: FindaHeaderProps) => {
  const navigate = useNavigate();
   const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
    <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
         <span className="text-xl font-bold text-gray-900">Finda</span>
              <Sparkles className="h-4 w-4 text-blue-600" />
          {/* <Badge variant="secondary" className="text-xs">AI</Badge> */}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
         
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="h-4 w-4" />
            </Button>
        
          {/* <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-4 w-4" />
          </Button> */}
          {/* <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="h-4 w-4" />
          </Button> */}
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
