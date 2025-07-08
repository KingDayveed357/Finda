import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FeaturedListings = () => {
  // Mock featured listings data
  const featuredListings = [
    {
      id: 1,
      title: "Professional Photography Services",
      description: "Capture your special moments with our award-winning photography team.",
      price: 299,
      rating: 4.9,
      reviews: 127,
      location: "New York, NY",
      category: "Photography",
      image: "/placeholder.svg",
      vendor: "PhotoPro Studio",
      featured: true,
      urgent: false
    },
    {
      id: 2,
      title: "Custom Web Development",
      description: "Build modern, responsive websites tailored to your business needs.",
      price: 1299,
      rating: 4.8,
      reviews: 89,
      location: "San Francisco, CA",
      category: "Technology",
      image: "/placeholder.svg",
      vendor: "WebCraft Solutions",
      featured: true,
      urgent: true
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      description: "Boost your online presence with our comprehensive marketing approach.",
      price: 799,
      rating: 4.7,
      reviews: 156,
      location: "Los Angeles, CA",
      category: "Marketing",
      image: "/placeholder.svg",
      vendor: "GrowthHack Agency",
      featured: true,
      urgent: false
    },
    {
      id: 4,
      title: "Interior Design Consultation",
      description: "Transform your space with expert interior design guidance.",
      price: 199,
      rating: 4.9,
      reviews: 234,
      location: "Chicago, IL",
      category: "Design",
      image: "/placeholder.svg",
      vendor: "SpaceDesign Co",
      featured: true,
      urgent: false
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top-rated services handpicked by our AI for quality and reliability
          </p>
        </div>

        {/* Featured Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredListings.map((listing) => (
            <Card key={listing.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                  {listing.urgent && (
                    <Badge className="bg-red-500 text-white flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold">
                    ${listing.price}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {listing.category}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {listing.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{listing.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">({listing.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  by <span className="font-medium">{listing.vendor}</span>
                </div>
                
                <Button asChild className="w-full">
                  <Link to={`/listing/${listing.id}`}>
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/listings">
              View All Services
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
