// components/ListingDetail/ImageGallery.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UnifiedListing, Service } from '@/types/listing';

interface ImageGalleryProps {
  listing: UnifiedListing;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  getImageWithFallback: (src: string | undefined) => string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  listing,
  currentImageIndex,
  setCurrentImageIndex,
  getImageWithFallback
}) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreenOpen(true);
  };

  const nextImage = () => {
    if (listing.images && listing.images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % listing.images.length;
      setCurrentImageIndex(nextIndex);
    }
  };

  const previousImage = () => {
    if (listing.images && listing.images.length > 1) {
      const prevIndex = (currentImageIndex - 1 + listing.images.length) % listing.images.length;
      setCurrentImageIndex(prevIndex);
    }
  };

  const nextFullscreenImage = () => {
    if (listing.images && listing.images.length > 1) {
      const nextIndex = (fullscreenIndex + 1) % listing.images.length;
      setFullscreenIndex(nextIndex);
    }
  };

  const previousFullscreenImage = () => {
    if (listing.images && listing.images.length > 1) {
      const prevIndex = (fullscreenIndex - 1 + listing.images.length) % listing.images.length;
      setFullscreenIndex(prevIndex);
    }
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreenOpen) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          previousFullscreenImage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextFullscreenImage();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, fullscreenIndex, listing.images]);

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="relative group">
            <img
              src={getImageWithFallback(listing.images?.[currentImageIndex])}
              alt={listing.title}
              className="w-full h-96 object-cover rounded-t-lg cursor-pointer"
              onClick={() => handleImageClick(currentImageIndex)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/placeholder.svg') {
                  target.src = '/placeholder.svg';
                }
              }}
            />
            
            {/* Zoom indicator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-t-lg">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <ZoomIn className="h-6 w-6 text-gray-700" />
              </div>
            </div>

            {/* Navigation arrows for multiple images */}
            {(listing.images?.length || 0) > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-80 hover:bg-opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-80 hover:bg-opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {listing.isService && (
                <Badge className="bg-blue-600 text-white">Service</Badge>
              )}
              {!listing.isService && (
                <Badge className="bg-green-600 text-white">Product</Badge>
              )}
              {listing.isPromoted && (
                <Badge className="bg-yellow-500 text-white">Promoted</Badge>
              )}
              {listing.isFeatured && (
                <Badge className="bg-purple-600 text-white">Featured</Badge>
              )}
              {listing.isVerified && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Remote service badge */}
            {listing.isService && (listing.originalData as Service).serves_remote && (
              <Badge className="absolute top-4 right-4 bg-indigo-600 text-white">
                Remote Available
              </Badge>
            )}

            {/* Image counter */}
            {(listing.images?.length || 0) > 1 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {listing.images?.length}
              </div>
            )}
          </div>

          {/* Thumbnail navigation */}
          {(listing.images?.length || 0) > 1 && (
            <div className="flex space-x-2 p-4 overflow-x-auto">
              {listing.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={getImageWithFallback(image)} 
                    alt={`View ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
              onClick={closeFullscreen}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation arrows */}
            {(listing.images?.length || 0) > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                  onClick={previousFullscreenImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                  onClick={nextFullscreenImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Main image */}
            <img
              src={getImageWithFallback(listing.images?.[fullscreenIndex])}
              alt={`${listing.title} - Image ${fullscreenIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/placeholder.svg') {
                  target.src = '/placeholder.svg';
                }
              }}
            />

            {/* Image counter */}
            {(listing.images?.length || 0) > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                {fullscreenIndex + 1} of {listing.images?.length}
              </div>
            )}

            {/* Thumbnail strip */}
            {(listing.images?.length || 0) > 1 && listing.images!.length <= 10 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-30 p-2 rounded-lg">
                {listing.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setFullscreenIndex(index)}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                      index === fullscreenIndex ? 'border-white' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={getImageWithFallback(image)} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder.svg') {
                          target.src = '/placeholder.svg';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};