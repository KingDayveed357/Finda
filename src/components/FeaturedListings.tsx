import { serviceService } from '../service/servicesService';
import type { Service } from '../service/servicesService';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CachedData {
  data: Service[];
  timestamp: number;
}

// In-memory cache (will persist during the session)
let featuredServicesCache: CachedData | null = null;

// Cache utility functions
const getCachedData = (): Service[] | null => {
  try {
    if (!featuredServicesCache) return null;
    
    const now = Date.now();
    
    // Check if cache is still valid (within 10 minutes)
    if (now - featuredServicesCache.timestamp < CACHE_DURATION) {
      return featuredServicesCache.data;
    }
    
    // Cache expired, remove it
    featuredServicesCache = null;
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    featuredServicesCache = null;
    return null;
  }
};

const setCachedData = (data: Service[]): void => {
  try {
    featuredServicesCache = {
      data,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

// Utility function to format price ranges
// const formatPriceRange = (service: Service): string => {
//   if (service.formatted_price_range) {
//     return service.formatted_price_range;
//   }
  
//   const symbol = service.country_details?.currency_symbol || '$';
//   const startingPrice = Math.round(service.starting_price);
//   const maxPrice = service.max_price ? Math.round(service.max_price) : null;
  
//   // Format numbers with commas for better readability
//   const formatNumber = (num: number): string => {
//     return num.toLocaleString();
//   };
  
//   if (maxPrice && maxPrice !== startingPrice) {
//     return `${symbol}${formatNumber(startingPrice)} - ${symbol}${formatNumber(maxPrice)}`;
//   }
  
//   return `${symbol}${formatNumber(startingPrice)}`;
// };

// Utility function to get display price (for the top-right corner)
const getDisplayPrice = (service: Service): string => {
  const symbol = service.country_details?.currency_symbol || '$';
  const startingPrice = Math.round(service.starting_price);
  
  // Format with commas and use "from" prefix if there's a range
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  if (service.max_price && service.max_price !== service.starting_price) {
    return `From ${symbol}${formatNumber(startingPrice)}`;
  }
  
  return `${symbol}${formatNumber(startingPrice)}`;
};

const FeaturedListings = () => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingCache, setUsingCache] = useState(false);

  const fetchFeaturedServices = async (attempt: number = 0, bypassCache: boolean = false) => {
    try {
      // Check cache first (unless bypassing)
      if (!bypassCache) {
        const cachedServices = getCachedData();
        if (cachedServices && cachedServices.length > 0) {
          setFeaturedServices(cachedServices);
          setUsingCache(true);
          setLoading(false);
          setError(null);
          return;
        }
      }
      
      setLoading(true);
      setError(null);
      setUsingCache(false);
      
      // Fetch featured services from API
      const services = await serviceService.getFeaturedServices({ 
        service_status: 'published',
        page_size: 4 // Limit to 4 services directly from API
      });
      
      if (services.length > 0) {
        setFeaturedServices(services);
        setCachedData(services); // Cache the successful response
        setRetryCount(0); // Reset retry count on success
      } else {
        setError('No featured services available');
      }
    } catch (err) {
      console.error('Error fetching featured services:', err);
      
      // Don't clear existing services if we have them and this is a retry
      if (featuredServices.length === 0) {
        setError('Failed to load featured services');
      }
      
      // Auto-retry logic with exponential backoff
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchFeaturedServices(attempt + 1, bypassCache);
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover top-rated services handpicked by our AI for quality and reliability
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && featuredServices.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Services
            </h2>
            <div className="text-center">
              <p className="text-xl text-red-600 mb-4">{error}</p>
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  Retrying... (Attempt {retryCount}/3)
                </p>
              )}
              <Button 
                onClick={() => fetchFeaturedServices(0, true)} // Bypass cache on manual retry
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredServices.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Services
            </h2>
            <p className="text-xl text-gray-600">No featured services available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

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
          {retryCount > 0 && !loading && (
            <p className="text-sm text-orange-600 mt-2">
              Some services may be loading slowly. Retrying...
            </p>
          )}
        </div>

        {/* Featured Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredServices.map((service) => (
            <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative">
                <img
                  src={service.featured_image_url || "/placeholder.svg"}
                  alt={service.service_name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                  {service.is_promoted && (
                    <Badge className="bg-red-500 text-white flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Promoted
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold">
                    {getDisplayPrice(service)}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {service.category_details?.name || 'Service'}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {service.service_name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {service.service_description}
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">
                      {service.average_rating > 0 ? service.average_rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    ({service.rating_count} {service.rating_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {service.city_details?.full_address || `${service.city_details?.name}, ${service.state_details?.name}`}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  by <span className="font-medium">{service.provider_name}</span>
                </div>
                
                <Button asChild className="w-full">
                  <Link to={`/service/${service.slug}`}>
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
          {usingCache && (
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => fetchFeaturedServices(0, true)}
                disabled={loading}
                className="text-xs text-gray-500"
              >
                Refresh Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;