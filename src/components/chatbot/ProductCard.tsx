import { Star, Clock, MapPin, ExternalLink, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  seller: {
    name: string;
    type: 'amazon' | 'jumia' | 'ebay' | 'finda' | 'upwork';
    rating: number;
    reviewCount: number;
  };
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  location: string;
  explanation: string;
  tags?: string[];
  discount?: string;
  onClick: () => void;
}

const getSellerBadgeStyles = (type: string) => {
  const styles = {
    amazon: "bg-marketplace-amazon text-white",
    jumia: "bg-marketplace-jumia text-white", 
    ebay: "bg-marketplace-ebay text-white",
    upwork: "bg-marketplace-upwork text-white",
    finda: "bg-primary text-primary-foreground"
  };
  return styles[type as keyof typeof styles] || "bg-secondary text-secondary-foreground";
};

export const ProductCard = ({
  id,
  title,
  price,
  originalPrice,
  seller,
  image,
  rating,
  reviewCount,
  deliveryTime,
  location,
  explanation,
  tags = [],
  discount,
  onClick
}: ProductCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-card hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Discount Badge */}
        {discount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            {discount}
          </Badge>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
            onClick={(e) => {
              e.stopPropagation();
              // Handle wishlist
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Seller Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={cn("text-xs font-medium", getSellerBadgeStyles(seller.type))}
          >
            {seller.name}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
            <span>({reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-foreground">{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{originalPrice}</span>
          )}
        </div>

        {/* Delivery & Location */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{deliveryTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* AI Explanation */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {explanation}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs p-0 mt-1 text-primary hover:text-primary-glow"
            onClick={(e) => {
              e.stopPropagation();
              // Show full explanation
            }}
          >
            Why this match? <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle buy now
            }}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Buy Now
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle contact
            }}
          >
            Contact
          </Button>
        </div>
      </div>
    </Card>
  );
};