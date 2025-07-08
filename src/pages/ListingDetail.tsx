import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Share2, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import { mockListings, mockAI } from '@/lib/mock-ai';
import type { Listing } from '@/lib/mock-ai';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [isLoggedIn] = useState(false); // Mock authentication state

  useEffect(() => {
    if (id) {
      const foundListing = mockListings.find(l => l.id === id);
      setListing(foundListing || null);

      // Load AI recommendations
      if (foundListing) {
        mockAI.generateRecommendations([], foundListing.category).then(setRecommendations);
      }
    }
  }, [id]);

  if (!listing) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
            <Link to="/listings">
              <Button>Back to Listings</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number | { min: number; max: number }) => {
    if (typeof price === 'number') {
      return `$${price}`;
    }
    return `$${price.min} - $${price.max}`;
  };

  const handleContactVendor = () => {
    if (!isLoggedIn) {
      // In a real app, redirect to login
      alert('Please sign up or log in to contact vendors');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/listings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  {listing.isService && (
                    <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                      Service
                    </Badge>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </div>
                {listing.images.length > 1 && (
                  <div className="flex space-x-2 p-4">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Title and Price */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{listing.rating}</span>
                      <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 10} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.location}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(listing.price)}
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={listing.vendor.image} alt={listing.vendor.name} />
                    <AvatarFallback>{listing.vendor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{listing.vendor.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm">{listing.vendor.rating} rating</span>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Member since: 2020</div>
                  <div>Response time: Within 2 hours</div>
                  <div>Total listings: {Math.floor(Math.random() * 50) + 10}</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardContent className="pt-6">
                {!isLoggedIn && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      <Link to="/auth/signup" className="text-blue-600 hover:underline">
                        Sign up
                      </Link> to contact vendors and make purchases
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleContactVendor}
                    disabled={!isLoggedIn}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Vendor
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!isLoggedIn}
                  >
                    {listing.isService ? 'Request Quote' : 'Add to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Always verify vendor credentials</li>
                  <li>• Meet in public places for local transactions</li>
                  <li>• Use Finda's secure payment system</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((recommendedListing) => (
                <ListingCard key={recommendedListing.id} listing={recommendedListing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListingDetail;