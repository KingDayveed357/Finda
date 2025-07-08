import { useState, useEffect } from 'react';
import { Plus, Package, DollarSign, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import ListingForm from '@/components/ListingForm';
import { mockListings } from '@/lib/mock-ai';
import type { Listing } from '@/lib/mock-ai';



const VendorDashboard = () => {
  const [vendorListings, setVendorListings] = useState<Listing[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Mock vendor's listings (filter by vendor ID in real app)
    setVendorListings(mockListings.slice(0, 4));
  }, []);

  const vendorStats = {
    totalListings: vendorListings.length,
    totalViews: 1250,
    totalSales: 8,
    revenue: 3200
  };

  const handleCreateListing = (data: any) => {
    console.log('Creating listing:', data);
    setIsCreateDialogOpen(false);
    // In real app, would make API call to create listing
  };

  const handleEditListing = (listing: Listing) => {
    console.log('Editing listing:', listing);
    // In real app, would open edit form
  };

  const handleDeleteListing = (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      setVendorListings(prev => prev.filter(l => l.id !== listingId));
    }
  };

  const formatPrice = (price: number | { min: number; max: number }) => {
    if (typeof price === 'number') {
      return `$${price}`;
    }
    return `$${price.min} - $${price.max}`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center mb-8">
          <div className='mb-4 md:mb-0'>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
            <p className="text-gray-600">Manage your listings and track your performance</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <ListingForm onSubmit={handleCreateListing} onCancel={} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold">{vendorStats.totalListings}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{vendorStats.totalViews}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Package className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{vendorStats.totalSales}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${vendorStats.revenue}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <p className="text-gray-600">Manage your products and services</p>
              </CardHeader>
              <CardContent>
                {vendorListings.length > 0 ? (
                  <div className="space-y-4">
                    {vendorListings.map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{listing.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="font-medium text-blue-600">{formatPrice(listing.price)}</span>
                              {listing.isService && (
                                <Badge variant="secondary">Service</Badge>
                              )}
                              <span className="text-sm text-gray-500">{listing.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditListing(listing)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No listings yet</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Listing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <p className="text-gray-600">Orders and service requests</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Order #{1000 + i}</h4>
                          <p className="text-sm text-gray-600">Customer: John Doe</p>
                          <p className="text-sm text-gray-600">Dec {i + 15}, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(i * 100 + 200)}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          i === 1 ? 'bg-green-100 text-green-800' : 
                          i === 2 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {i === 1 ? 'Completed' : i === 2 ? 'In Progress' : 'New'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Profile Views</span>
                      <span className="font-medium">342 this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Contact Requests</span>
                      <span className="font-medium">28 this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-medium">8.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <span className="font-medium">2.5 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendorListings.slice(0, 3).map((listing, index) => (
                      <div key={listing.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{listing.title}</span>
                        </div>
                        <span className="text-sm text-gray-600">{Math.floor(Math.random() * 100) + 50} views</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Profile</CardTitle>
                <p className="text-gray-600">Manage your public vendor information</p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      defaultValue="Creative Studios Inc"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                    <textarea 
                      rows={3}
                      defaultValue="Professional design services for businesses of all sizes"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      defaultValue="hello@creativestudios.com"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;