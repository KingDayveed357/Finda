// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Import pages
import Landing from "./pages/Landing";
import ListingGrid from "./pages/ListingGrid2";
import ListingDetail from "./pages/ListingDetail";
import Login from "./pages/Login"
import Register from "./pages/Register"
// import CustomerDashboard from "./pages/CustomerDashboard";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationPage from "./pages/VerificationPage";
import ResetPassword from "./pages/ResetPassword";

// Import components
import RouteGuard from './components/auth/RouteGuard';
import MessagingSystem from "./components/MessagingSystem";
import WalletSystem from "./components/WalletSystem";
// import VendorAnalytics from "./components/VendorAnalytics";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import LoyaltyProgram from "./components/LoyaltyProgram";
import Layout from "./components/Layout";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorListings from "./pages/vendor/VendorListings";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorSettings from "./pages/vendor/VendorSettings";
import ComingSoon from "./components/ComingSoon";
// import VendorEditListing from "./pages/vendor/VendorEditListing";
import Chat from "./pages/Chat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000,   // 15 minutes  
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
const helmetContext = {};

const App = () => (
  <HelmetProvider context={helmetContext}>
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - accessible without authentication */}
              <Route 
                path="/" 
                element={
                  <RouteGuard requireAuth={false}>
                    <Landing />
                  </RouteGuard>
                } 
              />

               <Route 
                path="/coming-soon" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ComingSoon />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/listings" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ListingGrid />
                  </RouteGuard>
                } 
              />


              <Route 
                path="/chat" 
                element={
                  <RouteGuard requireAuth={false}>
                    <Chat />
                  </RouteGuard>
                } 
              />
              
                     {/* Updated routes to support both slug and ID-based URLs */}
              <Route 
                path="/listing/:slug" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ListingDetail />
                  </RouteGuard>
                } 
              />
              
              {/* Specific routes for products and services with slug */}
              <Route 
                path="/product/:slug" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ListingDetail />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/service/:slug" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ListingDetail />
                  </RouteGuard>
                } 
              />

              {/* Legacy support for ID-based URLs - redirect to slug-based */}
              <Route 
                path="/listing/id/:id" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ListingDetail />
                  </RouteGuard>
                } 
              />

              {/* Auth routes - accessible without authentication, redirect if already logged in */}
              <Route 
                path="/auth" 
                element={<Navigate to="/auth/login" replace />} 
              />
              
              <Route 
                path="/auth/login" 
                element={
                  <RouteGuard requireAuth={false} redirectAuthenticatedTo="/chat">
                    <Login />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/auth/signup" 
                element={
                  <RouteGuard requireAuth={false} redirectAuthenticatedTo="/chat">
                    <Register />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/auth/vendor-signup" 
                element={
                  <RouteGuard requireAuth={false} redirectAuthenticatedTo="/vendor/dashboard">
                    <Register />
                  </RouteGuard>
                } 
              />

              

              {/* Password reset routes - accessible without authentication */}
              <Route 
                path="/forgot-password" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ForgotPassword />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/verification" 
                element={
                  <RouteGuard requireAuth={false}>
                    <VerificationPage />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/reset-password" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ResetPassword />
                  </RouteGuard>
                } 
              />

              {/* Customer-specific routes - require customer authentication */}
              <Route 
                path="/chat" 
                element={
                  <RouteGuard requireAuth={true} requireCustomer={true}>
                    <Chat />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/chat" 
                element={
                  <RouteGuard requireAuth={true} requireCustomer={true}>
                    <Chat />
                  </RouteGuard>
                } 
              />

              {/* Vendor-specific routes - require vendor authentication */}

                <Route 
                path="/vendor/dashboard" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorDashboard />
                  </RouteGuard>
                } 
              />

              <Route 
                path="/vendor/listings" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorListings />
                  </RouteGuard>
                } 
              />

              {/* <Route 
                path="/vendor/listings/edit/:id" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorEditListing/>
                  </RouteGuard>
                } 
              /> */}

               <Route 
                path="/vendor/orders" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorOrders />
                  </RouteGuard>
                } 
              />

              <Route 
                path="/vendor/analytics" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorAnalytics />
                  </RouteGuard>
                } 
              />

              
              <Route 
                path="/vendor/profile" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorProfile />
                  </RouteGuard>
                } 
              />

               <Route 
                path="/vendor/settings" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <VendorSettings />
                  </RouteGuard>
                } 
              />
              
            

              <Route 
                path="/analytics" 
                element={
                  <RouteGuard requireAuth={true} requireVendor={true}>
                    <Layout>
                      <VendorAnalytics />
                    </Layout>
                  </RouteGuard>
                } 
              />

              {/* Protected routes for both user types */}
              <Route 
                path="/messages" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Layout>
                      <MessagingSystem />
                    </Layout>
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/wallet" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Layout>
                      <WalletSystem />
                    </Layout>
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/rewards" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Layout>
                      <LoyaltyProgram />
                    </Layout>
                  </RouteGuard>
                } 
              />

              {/* Error pages */}
              <Route 
                path="/unauthorized" 
                element={
                  <RouteGuard requireAuth={false}>
                    <Unauthorized />
                  </RouteGuard>
                } 
              />

              {/* Catch-all route - redirect to login for protected content */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </>
  </HelmetProvider>
);

export default App;