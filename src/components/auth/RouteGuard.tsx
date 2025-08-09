// components/auth/RouteGuard.tsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
// import Loader from "@/assets/react.svg"

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVendor?: boolean;
  requireCustomer?: boolean;
  redirectTo?: string;
  redirectAuthenticatedTo?: string; // Where to redirect authenticated users on auth pages
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  requireVendor = false,
  requireCustomer = false,
  redirectTo = '/auth/login',
  redirectAuthenticatedTo
}) => {
  const { isAuthenticated, getStoredUser, isVendor, isCustomer } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userIsAuthenticated = isAuthenticated();
        
        // If this is a public route (requireAuth = false)
        if (!requireAuth) {
          // If user is authenticated and we're on an auth page, redirect them
          if (userIsAuthenticated && redirectAuthenticatedTo) {
            const user = getStoredUser();
            if (user) {
              // Redirect based on user type
              if (user.user_type === 'vendor') {
                setRedirectPath('/vendor/dashboard');
              } else {
                setRedirectPath('/dashboard');
              }
              setIsValid(false);
              setIsLoading(false);
              return;
            }
            setRedirectPath(redirectAuthenticatedTo);
            setIsValid(false);
            setIsLoading(false);
            return;
          }
          
          setIsValid(true);
          setIsLoading(false);
          return;
        }

        // For protected routes, check authentication
        if (!userIsAuthenticated) {
          setIsValid(false);
          setRedirectPath(redirectTo);
          setIsLoading(false);
          toast.error("Authentication required", {
            description: "Please sign in to access this page.",
          });
          return;
        }

        // Check user type requirements
        const user = getStoredUser();
        if (!user) {
          setIsValid(false);
          setRedirectPath(redirectTo);
          setIsLoading(false);
          toast.error("Session expired", {
            description: "Please sign in again.",
          });
          return;
        }

        if (requireVendor && !isVendor()) {
          setIsValid(false);
          setRedirectPath('/unauthorized');
          setIsLoading(false);
          toast.error("Access denied", {
            description: "This page is only accessible to vendors.",
          });
          return;
        }

        if (requireCustomer && !isCustomer()) {
          setIsValid(false);
          setRedirectPath('/unauthorized');
          setIsLoading(false);
          toast.error("Access denied", {
            description: "This page is only accessible to customers.",
          });
          return;
        }

        setIsValid(true);
      } catch (error) {
        console.error('Route guard error:', error);
        setIsValid(false);
        setRedirectPath(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [
    isAuthenticated, 
    getStoredUser, 
    isVendor, 
    isCustomer,
    requireAuth, 
    requireVendor, 
    requireCustomer, 
    redirectTo,
    redirectAuthenticatedTo
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
         <DotLottieReact
      src="https://lottie.host/514c0a83-f05c-4af2-8458-a7ca2ef96cab/DDYXPaALxb.lottie"
      loop
      autoplay
    />
    {/* Loading */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
      
        </div>
      </div>
    );
  }

  if (!isValid && redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;