import { useState, useEffect } from 'react';
import { Package, Eye, DollarSign, ShoppingCart, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard  from '@/components/vendor/DashboardCard';
import  ListingTable  from '@/components/vendor/ListingTable';
import { mockStats } from '@/lib/mockData';
import { toast } from 'sonner';
import  VendorLayout  from '@/components/vendor/VendorLayout';
import ListingFormModal from '@/components/ListingFormModal';
import { useNavigate } from 'react-router-dom';
import { listingService, type UnifiedListing } from '@/service/listingService';

const VendorDashboard = () => {  
  const navigate = useNavigate();
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Load vendor listings on component mount
  useEffect(() => {
    const loadVendorListings = async () => {
      try {
        setLoading(true);
        const vendorListings = await listingService.getVendorListings();
        setListings(vendorListings);
      } catch (error) {
        console.error('Error loading vendor listings:', error);
        toast.error('Failed to load listings');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadVendorListings();
  }, []);

  const handleEditListing = (id: string) => {
    toast.info(`Editing listing ${id}`);
    // Navigate to edit page or open edit modal
    // navigate(`/vendor/listings/${id}/edit`);
  };

  const handleToggleListingStatus = async (id: string) => {
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) return;

      // Determine new status based on current status
      const currentStatus = (listing.originalData as any).product_status || 
                          (listing.originalData as any).service_status || 
                          'published';
      const newStatus = currentStatus === 'published' ? 'paused' : 'published';

      const success = await listingService.updateListingStatus(id, newStatus);
      
      if (success) {
        // Update local state
        setListings(prevListings => 
          prevListings.map(listing => {
            if (listing.id === id) {
              // Update the originalData status
              const updatedOriginalData = { ...listing.originalData };
              if (listing.isService) {
                (updatedOriginalData as any).service_status = newStatus;
              } else {
                (updatedOriginalData as any).product_status = newStatus;
              }
              
              return {
                ...listing,
                originalData: updatedOriginalData
              };
            }
            return listing;
          })
        );
        
        toast.success(`Listing ${newStatus === 'published' ? 'activated' : 'paused'} successfully`);
      } else {
        toast.error('Failed to update listing status');
      }
    } catch (error) {
      console.error('Error toggling listing status:', error);
      toast.error('Failed to update listing status');
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const success = await listingService.deleteListing(id);
      
      if (success) {
        // Remove from local state
        setListings(prevListings => prevListings.filter(listing => listing.id !== id));
        toast.success('Listing deleted successfully');
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleViewListing = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing && listing.slug) {
      const listingType = listing.isService ? 'service' : 'product';
      navigate(`/${listingType}/${listing.slug}`);
    } else {
      toast.error('Unable to view listing');
    }
  };

  const handleAddNewListing = () => {
    setIsListingModalOpen(true);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleListingCreated = () => {
    // Refresh listings after creating a new one
    const loadVendorListings = async () => {
      try {
        const vendorListings = await listingService.getVendorListings();
        setListings(vendorListings);
        toast.success('Listing created successfully');
      } catch (error) {
        console.error('Error refreshing listings:', error);
      }
    };

    loadVendorListings();
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Button variant="outline" onClick={handleGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button onClick={handleAddNewListing}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Listings"
            value={loading ? '...' : listings.length.toString()}
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Total Views"
            value={loading ? '...' : listings.reduce((sum, listing) => sum + listing.viewsCount, 0).toLocaleString()}
            icon={Eye}
            trend={{ value: 8, isPositive: true }}
          />
          <DashboardCard
            title="Total Sales"
            value={mockStats.totalSales}
            icon={ShoppingCart}
            trend={{ value: 23, isPositive: true }}
          />
          <DashboardCard
            title="Revenue"
            value={mockStats.revenue}
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Listings Table */}
        <ListingTable
          listings={listings}
          onEdit={handleEditListing}
          onToggleStatus={handleToggleListingStatus}
          onDelete={handleDeleteListing}
          onView={handleViewListing}
          loading={loading}
          title="My Listings"
        />
      </div>

      <ListingFormModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSuccess={handleListingCreated}
      />
    </VendorLayout>
  );
};

export default VendorDashboard;