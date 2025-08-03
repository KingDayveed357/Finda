import { useState, useEffect } from 'react';
import { Heart, Clock, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
// import ListingCard from '@/components/ListingCard';
import { mockAI, mockListings } from '@/lib/mock-ai';
import type { Listing } from '@/lib/mock-ai';

const CustomerDashboard = () => {
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);

  useEffect(() => {
    // Load AI recommendations based on user's mock preferences
    mockAI.generateRecommendations(['electronics', 'services']).then(setRecommendations);
    
    // Mock recently viewed (would come from user's browsing history)
    setRecentlyViewed(mockListings.slice(0, 4));
    
    // Mock favorites
    setFavorites(mockListings.slice(2, 5));
  }, []);

  const userStats = {
    totalPurchases: 12,
    activeBids: 3,
    savedItems: favorites.length,
    totalSpent: 2450
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your account.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold">{userStats.totalPurchases}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Bids</p>
                <p className="text-2xl font-bold">{userStats.activeBids}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Heart className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Saved Items</p>
                <p className="text-2xl font-bold">{userStats.savedItems}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Star className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${userStats.totalSpent}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Recommended for You
            </CardTitle>
            <p className="text-gray-600">AI-powered recommendations based on your preferences</p>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* {recommendations.slice(0, 6).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))} */}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading personalized recommendations...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="bids">Active Bids</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recently Viewed</CardTitle>
                <p className="text-gray-600">Items you've looked at recently</p>
              </CardHeader>
              <CardContent>
                {recentlyViewed.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* {recentlyViewed.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))} */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recently viewed items</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorites</CardTitle>
                <p className="text-gray-600">Items you've saved for later</p>
              </CardHeader>
              <CardContent>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* {favorites.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))} */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No saved items yet</p>
                    <Button className="mt-4">Browse Listings</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <p className="text-gray-600">Your past purchases and orders</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={`https://images.unsplash.com/photo-150000000${i}?w=60&h=60&fit=crop`}
                          alt="Order item"
                          className="w-15 h-15 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-medium">Order #{1000 + i}</h4>
                          <p className="text-sm text-gray-600">Delivered on Dec {i + 15}, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(i * 50 + 99)}</p>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <CardTitle>Active Bids</CardTitle>
                <p className="text-gray-600">Services you've requested quotes for</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Website Design Service</h4>
                        <p className="text-sm text-gray-600">Bid placed {i} days ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Budget: $500 - $1000</p>
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;