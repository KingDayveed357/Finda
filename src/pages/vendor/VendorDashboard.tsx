import { useState } from 'react';
import { Package, Eye, DollarSign, ShoppingCart, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard  from '@/components/vendor/DashboardCard';
import  ListingTable  from '@/components/vendor/ListingTable';
import { mockStats, mockListings } from '@/lib/mockData';
import { toast } from 'sonner';
import  VendorLayout  from '@/components/vendor/VendorLayout';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import type { Listing } from '@/lib/mock-ai';
// import ListingForm from '@/components/ListingForm';
import ListingFormModal from '@/components/ListingFormModal';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {  
  const navigate = useNavigate();
  // const [vendorListings, setVendorListings] = useState<Listing[]>([]);
  // const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
   const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  //   const handleCreateListing = (data: any) => {
  //   console.log('Creating listing:', data);
  //   setIsCreateDialogOpen(false);
  //   // In real app, would make API call to create listing
  // };

  const handleEditListing = (id: string) => {
    toast.info(`Editing listing ${id}`);
  };

  const handleToggleListingStatus = (id: string) => {
    toast.success(`Listing ${id} status toggled`);
  };

  const handleDeleteListing = (id: string) => {
    toast.error(`Listing ${id} has been deleted`);
  };

  // const handleAddNewListing = () => {
  //   toast.info("Opening listing creation form...");
  // };

  const handleAddNewListing = () => {
    // setEditingListing(null);
    setIsListingModalOpen(true);
  };

  const handleGoHome = () => {
    navigate('/');
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
        {/* </div> */}
       {/* <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[98vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <ListingForm onSubmit={handleCreateListing}  onCancel={() => console.log('Cancelled')}  />
            </DialogContent>
          </Dialog> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Listings"
            value={mockStats.totalListings}
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Total Views"
            value={mockStats.totalViews}
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
          listings={mockListings}
          onEdit={handleEditListing}
          onToggleStatus={handleToggleListingStatus}
          onDelete={handleDeleteListing}
        />
      </div>


        <ListingFormModal
          isOpen={isListingModalOpen}
          onClose={() => setIsListingModalOpen(false)}
          // initialData={editingListing}
          // isEdit={!!editingListing}
        />
    </VendorLayout>
  );
};

export default VendorDashboard;
