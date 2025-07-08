import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import  type { Listing } from '@/lib/mock-ai';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const formatPrice = (price: number | { min: number; max: number }) => {
    if (typeof price === 'number') {
      return `$${price}`;
    }
    return `$${price.min} - $${price.max}`;
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing.isService && (
            <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
              Service
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          
          <div className="flex items-center space-x-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{listing.rating}</span>
            <span className="text-sm text-gray-500">({Math.floor(Math.random() * 100) + 10} reviews)</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {listing.location}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm text-gray-500">
                by {listing.vendor.name}
              </div>
            </div>
            <div className="flex items-center">
              <img
                src={listing.vendor.image}
                alt={listing.vendor.name}
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {listing.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;
