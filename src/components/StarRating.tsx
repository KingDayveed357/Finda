// components/StarRating.tsx - Updated to support half-star ratings
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  label?: string;
  error?: string;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  label, 
  error,
  readonly = false,
  size = 'md',
  showValue = false
}) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [hoverPosition, setHoverPosition] = useState<'left' | 'right'>('right');

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const starSize = sizeClasses[size];
  const isInteractive = !readonly && onRatingChange;

  const handleStarClick = (starIndex: number, isHalf: boolean) => {
    if (!isInteractive) return;
    
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    onRatingChange(newRating);
  };

  const handleStarHover = (starIndex: number, isHalf: boolean) => {
    if (!isInteractive) return;
    
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    setHoveredRating(newRating);
    setHoverPosition(isHalf ? 'left' : 'right');
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setHoveredRating(0);
  };

  const getStarFill = (starIndex: number): 'empty' | 'half' | 'full' => {
    const currentRating = hoveredRating || rating;
    
    if (currentRating >= starIndex) {
      return 'full';
    } else if (currentRating >= starIndex - 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  const renderStar = (starIndex: number) => {
    const fill = getStarFill(starIndex);
    const isHovered = hoveredRating > 0 && starIndex <= Math.ceil(hoveredRating);
    
    return (
      <div
        key={starIndex}
        className={`relative ${isInteractive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left half of star (for 0.5 ratings) */}
        <div
          className="absolute inset-0 w-1/2 z-10"
          onClick={() => handleStarClick(starIndex, true)}
          onMouseEnter={() => handleStarHover(starIndex, true)}
        />
        
        {/* Right half of star (for full ratings) */}
        <div
          className="absolute inset-0 left-1/2 w-1/2 z-10"
          onClick={() => handleStarClick(starIndex, false)}
          onMouseEnter={() => handleStarHover(starIndex, false)}
        />
        
        {/* Star base */}
        <Star 
          className={`${starSize} transition-colors ${
            fill === 'empty' 
              ? 'text-gray-300' 
              : fill === 'full'
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-yellow-400'
          } ${isHovered && isInteractive ? 'scale-110' : ''}`}
        />
        
        {/* Half star overlay */}
        {fill === 'half' && (
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${starSize} text-yellow-400 fill-yellow-400`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {!readonly && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(starIndex => renderStar(starIndex))}
        </div>
        
        {showValue && (
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
        )}
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {isInteractive && hoveredRating > 0 && (
        <p className="text-xs text-gray-500">
          Click to rate: {hoveredRating.toFixed(1)} star{hoveredRating !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

// Display-only star rating component for showing existing ratings
export const DisplayStarRating: React.FC<{
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}> = ({ rating, size = 'sm', showValue = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const starSize = sizeClasses[size];

  const renderDisplayStar = (starIndex: number) => {
    const fill = rating >= starIndex ? 'full' : rating >= starIndex - 0.5 ? 'half' : 'empty';
    
    return (
      <div key={starIndex} className="relative">
        <Star 
          className={`${starSize} ${
            fill === 'empty' 
              ? 'text-gray-300' 
              : fill === 'full'
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-yellow-400'
          }`}
        />
        
        {/* Half star overlay */}
        {fill === 'half' && (
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${starSize} text-yellow-400 fill-yellow-400`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(starIndex => renderDisplayStar(starIndex))}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};