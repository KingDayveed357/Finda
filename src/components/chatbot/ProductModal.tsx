import { useState } from "react";
import { X, Star, Clock, MapPin, Heart, Share2, ShoppingCart, MessageCircle, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: string;
    originalPrice?: string;
    seller: {
      name: string;
      type: string;
      rating: number;
      reviewCount: number;
      responseTime: string;
      verificationLevel: string;
    };
    images: string[];
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    location: string;
    description: string;
    specifications: { [key: string]: string };
    reviews: Array<{
      id: string;
      author: string;
      rating: number;
      comment: string;
      date: string;
      verified: boolean;
    }>;
    explanation: string;
    tags: string[];
    discount?: string;
  };
}

export const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Gallery */}
          <div className="lg:w-1/2 relative">
            <div className="aspect-square bg-muted relative overflow-hidden">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.title}
                className="object-cover w-full h-full"
              />
              
              {/* Discount Badge */}
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  {product.discount}
                </Badge>
              )}

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 p-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden",
                      index === currentImageIndex ? "border-primary" : "border-border"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      className={cn("text-xs", getSellerBadgeStyles(product.seller.type))}
                    >
                      {product.seller.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.seller.verificationLevel}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold leading-tight">{product.title}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{product.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{product.location}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl font-bold text-foreground">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{product.originalPrice}</span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="details" className="h-full">
                <TabsList className="grid w-full grid-cols-4 m-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="seller">Seller</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="ai">AI Match</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-4 space-y-4 m-0">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Specifications</h4>
                    <div className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seller" className="p-4 space-y-4 m-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {product.seller.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{product.seller.name}</h4>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.seller.rating}</span>
                        <span className="text-muted-foreground">
                          ({product.seller.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response time:</span>
                      <p className="font-medium">{product.seller.responseTime}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verification:</span>
                      <p className="font-medium">{product.seller.verificationLevel}</p>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </TabsContent>

                <TabsContent value="reviews" className="p-4 space-y-4 m-0">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{review.author}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3 w-3",
                              i < review.rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted-foreground"
                            )} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="ai" className="p-4 space-y-4 m-0">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-2"></span>
                      Why this match?
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.explanation}
                    </p>
                  </div>

                  <Separator />

                  <div className="text-xs text-muted-foreground">
                    <p>This recommendation is based on:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your search query and preferences</li>
                      <li>Product specifications and reviews</li>
                      <li>Price comparison across marketplaces</li>
                      <li>Delivery options to your location</li>
                      <li>Seller reliability and ratings</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};