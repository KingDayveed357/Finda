
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';

// Import pages
import Landing from "./pages/Landing";
import ListingGrid from "./pages/ListingGrid";
import ListingDetail from "./pages/ListingDetail";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationPage from "./pages/VerificationPage";
import ResetPassword from "./pages/ResetPassword";

// Import new components for routes
import MessagingSystem from "./components/MessagingSystem";
import WalletSystem from "./components/WalletSystem";
import VendorAnalytics from "./components/VendorAnalytics";
import LoyaltyProgram from "./components/LoyaltyProgram";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const helmetContext = {};

const App = () => (
  <HelmetProvider context={helmetContext}>
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* <Toaster /> */}
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/listings" element={<ListingGrid />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/login" element={<Auth />} />
              <Route path="/auth/signup" element={<Auth />} />
              <Route path="/auth/vendor-signup" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/messages" element={<Layout><MessagingSystem /></Layout>} />
              <Route path="/wallet" element={<Layout><WalletSystem /></Layout>} />
              <Route path="/analytics" element={<Layout><VendorAnalytics /></Layout>} />
              <Route path="/rewards" element={<Layout><LoyaltyProgram /></Layout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  </HelmetProvider>
);

export default App;
