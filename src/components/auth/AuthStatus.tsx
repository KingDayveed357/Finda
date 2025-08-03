// components/auth/AuthStatus.tsx
import { useState, useEffect } from 'react';
import { useAuth, authEvents } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthStatus = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [user, setUser] = useState(() => {
    //  user state only once
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  });

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authEvents.subscribe(() => {
      try {
        const userData = localStorage.getItem('user');
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        setUser(null);
      }
    });

    return unsubscribe;
  }, []); 

  if (!isAuthenticated() || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = () => {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  const getUserTypeLabel = () => {
    return user.user_type === 'vendor' ? 'Vendor' : 'Customer';
  };

  const getUserTypeBadgeColor = () => {
    return user.user_type === 'vendor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile} alt={`${user.first_name} ${user.last_name}`} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="h-3 w-3" />
              <span className={`text-xs px-2 py-1 rounded-full ${getUserTypeBadgeColor()}`}>
                {getUserTypeLabel()}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem >
          <Link to="/vendor/profile" className="flex items-center">
             <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
          </Link>
        </DropdownMenuItem>


        <DropdownMenuItem>
         <Link to="/vendor/settings" className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
         </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600"
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthStatus;