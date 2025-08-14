import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, Wrench, Star, Eye, TrendingUp, Filter } from "lucide-react";
import VendorLayout from "@/components/vendor/VendorLayout";
import ListingTable from "@/components/vendor/ListingTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  listingService, 
  type UnifiedListing, 
  type VendorStats,
  // type ListingFilters 
} from "@/service/listingService";

const VendorListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Helper function to extract status from listing
  const getListingStatus = (listing: UnifiedListing): string => {
    const originalData = listing.originalData as any;
    
    if (listing.isService) {
      return originalData.service_status || 'published';
    } else {
      return originalData.product_status || 'published';
    }
  };

  // Load listings and stats
  const loadData = async () => {
    setLoading(true);
    try {
      const [vendorListings, vendorStats] = await Promise.all([
        listingService.getVendorListings(),
        listingService.getVendorStats()
      ]);
      
      setListings(vendorListings);
      setStats(vendorStats);
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter listings based on active tab and filters
  const filteredListings = listings.filter(listing => {
    // Tab filtering
    if (activeTab === "products" && listing.isService) return false;
    if (activeTab === "services" && !listing.isService) return false;
    if (activeTab === "featured" && !listing.isFeatured) return false;
    if (activeTab === "promoted" && !listing.isPromoted) return false;
    
    // Status filtering
    if (statusFilter !== "all") {
      const listingStatus = getListingStatus(listing);
      // Map status values for filtering
      if (statusFilter === "active" && listingStatus !== "published") return false;
      if (statusFilter === "paused" && listingStatus !== "paused") return false;
      if (statusFilter === "draft" && listingStatus !== "draft") return false;
      if (statusFilter === "expired" && listingStatus !== "expired") return false;
    }
    
    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'views':
        return b.viewsCount - a.viewsCount;
      case 'rating':
        return b.rating - a.rating;
      case 'price-high':
        const priceA = typeof a.price === 'number' ? a.price : (a.price?.max || 0);
        const priceB = typeof b.price === 'number' ? b.price : (b.price?.max || 0);
        return priceB - priceA;
      case 'price-low':
        const priceALow = typeof a.price === 'number' ? a.price : (a.price?.min || 0);
        const priceBLow = typeof b.price === 'number' ? b.price : (b.price?.min || 0);
        return priceALow - priceBLow;
      default:
        return 0;
    }
  });

  // Event handlers
  const handleEdit = (id: string) => {
    navigate(`/vendor/listings/edit/${id}`);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) return;

      // Get current status and determine new status
      const currentStatus = getListingStatus(listing);
      const newStatus = currentStatus === 'published' ? 'paused' : 'published';

      const success = await listingService.updateListingStatus(id, newStatus);
      
      if (success) {
        // Update local state
        setListings(prev => 
          prev.map(listing => {
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
        
        // Reload stats to update counts
        const newStats = await listingService.getVendorStats();
        setStats(newStats);
      } else {
        toast.error('Failed to update listing status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update listing status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await listingService.deleteListing(id);
      if (success) {
        setListings(prev => prev.filter(listing => listing.id !== id));
        toast.success('Listing deleted successfully');
        // Reload stats to update counts
        const newStats = await listingService.getVendorStats();
        setStats(newStats);
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleView = (id: string) => {
    // Find the listing to get its slug
    const listing = listings.find(l => l.id === id);
    if (listing && listing.slug) {
      const listingType = listing.isService ? 'service' : 'product';
      navigate(`/${listingType}/${listing.slug}`);
    } else {
      // Fallback to ID-based navigation
      const [type, numId] = id.split('-');
      if (type === 'product') {
        navigate(`/products/${numId}`);
      } else if (type === 'service') {
        navigate(`/services/${numId}`);
      } else {
        toast.error('Unable to view listing');
      }
    }
  };

  const getTabCount = (tab: string) => {
    if (!stats) return 0;
    
    switch (tab) {
      case 'products':
        return stats.productsCount || 0;
      case 'services':
        return stats.servicesCount || 0;
      case 'featured':
        return stats.featuredCount || 0;
      case 'promoted':
        return stats.promotedCount || 0;
      default:
        return stats.totalListings || 0;
    }
  };

  // Calculate status-based counts from current listings
  // const getActiveCount = () => {
  //   return filteredListings.filter(listing => getListingStatus(listing) === 'published').length;
  // };

  // const getPausedCount = () => {
  //   return filteredListings.filter(listing => getListingStatus(listing) === 'paused').length;
  // };

  // const getDraftCount = () => {
  //   return filteredListings.filter(listing => getListingStatus(listing) === 'draft').length;
  // };

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your products and services
            </p>
          </div>
          <Button onClick={() => navigate("/vendor/create-listing")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.productsCount} products, {stats.servicesCount} services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across all listings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Overall performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.featuredCount} featured, {stats.promotedCount} promoted
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Listings</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All
                  <Badge variant="secondary">{getTabCount('all')}</Badge>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  Products
                  <Badge variant="secondary">{getTabCount('products')}</Badge>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Wrench className="h-3 w-3" />
                  Services
                  <Badge variant="secondary">{getTabCount('services')}</Badge>
                </TabsTrigger>
                <TabsTrigger value="featured" className="flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  Featured
                  <Badge variant="secondary">{getTabCount('featured')}</Badge>
                </TabsTrigger>
                <TabsTrigger value="promoted" className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Promoted
                  <Badge variant="secondary">{getTabCount('promoted')}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <ListingTable
                  listings={sortedListings}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  onView={handleView}
                  loading={loading}
                  title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Listings`}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
};

export default VendorListings;