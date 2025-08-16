// import { Star, Clock, MapPin, ExternalLink, Heart, ShoppingCart } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { cn } from "@/lib/utils";

// interface ProductCardProps {
//   id: string;
//   title: string;
//   price: string;
//   originalPrice?: string;
//   seller: {
//     name: string;
//     type: 'amazon' | 'jumia' | 'ebay' | 'finda' | 'upwork';
//     rating: number;
//     reviewCount: number;
//   };
//   image: string;
//   rating: number;
//   reviewCount: number;
//   deliveryTime: string;
//   location: string;
//   explanation: string;
//   tags?: string[];
//   discount?: string;
//   onClick: () => void;
// }

// const getSellerBadgeStyles = (type: string) => {
//   const styles = {
//     amazon: "bg-marketplace-amazon text-white",
//     jumia: "bg-marketplace-jumia text-white", 
//     ebay: "bg-marketplace-ebay text-white",
//     upwork: "bg-marketplace-upwork text-white",
//     finda: "bg-primary text-primary-foreground"
//   };
//   return styles[type as keyof typeof styles] || "bg-secondary text-secondary-foreground";
// };

// export const ProductCard = ({
//   // id,
//   title,
//   price,
//   originalPrice,
//   seller,
//   image,
//   rating,
//   reviewCount,
//   deliveryTime,
//   location,
//   explanation,
//   tags = [],
//   discount,
//   onClick
// }: ProductCardProps) => {
//   return (
//     <Card 
//       className="group cursor-pointer transition-all duration-200 hover:shadow-card hover:-translate-y-1 overflow-hidden"
//       onClick={onClick}
//     >
//       {/* Image Container */}
//       <div className="relative aspect-square overflow-hidden bg-muted">
//         <img 
//           src={image} 
//           alt={title}
//           className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
//         />
        
//         {/* Discount Badge */}
//         {discount && (
//           <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
//             {discount}
//           </Badge>
//         )}
        
//         {/* Quick Actions */}
//         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <Button
//             variant="secondary"
//             size="icon"
//             className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
//             onClick={(e) => {
//               e.stopPropagation();
//               // Handle wishlist
//             }}
//           >
//             <Heart className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 space-y-3">
//         {/* Seller Badge */}
//         <div className="flex items-center justify-between">
//           <Badge 
//             variant="secondary" 
//             className={cn("text-xs font-medium", getSellerBadgeStyles(seller.type))}
//           >
//             {seller.name}
//           </Badge>
//           <div className="flex items-center space-x-1 text-xs text-muted-foreground">
//             <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//             <span>{rating}</span>
//             <span>({reviewCount})</span>
//           </div>
//         </div>

//         {/* Title */}
//         <h3 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
//           {title}
//         </h3>

//         {/* Price */}
//         <div className="flex items-center space-x-2">
//           <span className="font-bold text-lg text-foreground">{price}</span>
//           {originalPrice && (
//             <span className="text-sm text-muted-foreground line-through">{originalPrice}</span>
//           )}
//         </div>

//         {/* Delivery & Location */}
//         <div className="flex items-center justify-between text-xs text-muted-foreground">
//           <div className="flex items-center space-x-1">
//             <Clock className="h-3 w-3" />
//             <span>{deliveryTime}</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <MapPin className="h-3 w-3" />
//             <span>{location}</span>
//           </div>
//         </div>

//         {/* Tags */}
//         {tags.length > 0 && (
//           <div className="flex flex-wrap gap-1">
//             {tags.slice(0, 2).map((tag, index) => (
//               <Badge key={index} variant="outline" className="text-xs">
//                 {tag}
//               </Badge>
//             ))}
//             {tags.length > 2 && (
//               <Badge variant="outline" className="text-xs">
//                 +{tags.length - 2}
//               </Badge>
//             )}
//           </div>
//         )}

//         {/* AI Explanation */}
//         <div className="pt-2 border-t border-border/50">
//           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
//             {explanation}
//           </p>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-6 text-xs p-0 mt-1 text-primary hover:text-primary-glow"
//             onClick={(e) => {
//               e.stopPropagation();
//               // Show full explanation
//             }}
//           >
//             Why this match? <ExternalLink className="h-3 w-3 ml-1" />
//           </Button>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex space-x-2 pt-2">
//           <Button 
//             size="sm" 
//             className="flex-1 h-8 text-xs"
//             onClick={(e) => {
//               e.stopPropagation();
//               // Handle buy now
//             }}
//           >
//             <ShoppingCart className="h-3 w-3 mr-1" />
//             Buy Now
//           </Button>
//           <Button 
//             variant="outline" 
//             size="sm" 
//             className="h-8 text-xs"
//             onClick={(e) => {
//               e.stopPropagation();
//               // Handle contact
//             }}
//           >
//             Contact
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );
// };




import { Heart, Star, MapPin, Clock, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Seller {
  name: string;
  type: 'amazon' | 'jumia' | 'ebay' | 'finda' | 'upwork';
  rating: number;
  reviewCount: number;
  responseTime: string;
  verificationLevel: string;
}

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  seller: Seller;
  // featured_image_url: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  location: string;
  explanation: string;
  tags: string[];
  discount?: string;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}

const sellerColors = {
  amazon: 'bg-orange-100 text-orange-800 border-orange-200',
  jumia: 'bg-green-100 text-green-800 border-green-200',
  ebay: 'bg-blue-100 text-blue-800 border-blue-200',
  finda: 'bg-purple-100 text-purple-800 border-purple-200',
  upwork: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const sellerIcons = {
  amazon: '🛒',
  jumia: '🛍️',
  ebay: '🏪',
  finda: '🏬',
  upwork: '💼',
};

export const ProductCard = ({ 
  // id,
  title, 
  price, 
  originalPrice,
  seller,
  // featured_image_url,
  image,
  rating,
  reviewCount,
  deliveryTime,
  location,
  explanation,
  tags,
  discount,
  onClick,
  viewMode = 'grid'
}: ProductCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getDiscountPercentage = () => {
    if (!originalPrice || !discount) return null;
    const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
    const current = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    if (!original || !current) return null;
    return Math.round(((original - current) / original) * 100);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              {!imageError ? (
                <img
                  src={`https:${image}`}
                  alt={title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{sellerIcons[seller.type]}</span>
                </div>
              )}
              {discount && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                  {discount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 bg-white/80 hover:bg-white"
                onClick={handleFavoriteToggle}
              >
                <Heart className={cn("h-4 w-4", isFavorited ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", sellerColors[seller.type])}>
                      {sellerIcons[seller.type]} {seller.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {seller.verificationLevel}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-primary">{price}</div>
                    {originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">{originalPrice}</div>
                    )}
                  </div>
                  {getDiscountPercentage() && (
                    <div className="text-xs text-green-600 font-medium">
                      Save {getDiscountPercentage()}%
                    </div>
                  )}
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              </div>

              {/* Explanation */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {explanation}
              </p>

              {/* Tags and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="h-8">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onClick}>
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {!imageError ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-4xl">{sellerIcons[seller.type]}</span>
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && (
              <Badge className="bg-red-500 text-white text-xs">
                {discount}
              </Badge>
            )}
            <Badge className={cn("text-xs", sellerColors[seller.type])}>
              {sellerIcons[seller.type]} {seller.name}
            </Badge>
          </div>
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleFavoriteToggle}
          >
            <Heart className={cn("h-4 w-4", isFavorited ? "fill-red-500 text-red-500" : "text-gray-600")} />
          </Button>

          {/* Quick action overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Price */}
          <div className="mb-2">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">{price}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">{originalPrice}</span>
                )}
              </div>
              {getDiscountPercentage() && (
                <Badge variant="outline" className="text-xs text-green-600">
                  -{getDiscountPercentage()}%
                </Badge>
              )}
            </div>
          </div>

          {/* Rating and Location */}
          <div className="flex items-center justify-between mb-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-20">{location.split(',')[0]}</span>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            <span>{deliveryTime}</span>
          </div>

          {/* Explanation */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {explanation}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              Compare
            </Button>
            <Button size="sm" className="flex-1 text-xs">
              <ShoppingCart className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};