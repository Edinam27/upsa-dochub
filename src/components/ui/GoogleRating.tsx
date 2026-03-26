import React from 'react';
import { Star } from 'lucide-react';

interface GoogleRatingProps {
  rating?: number;
  reviewCount?: number;
  className?: string;
}

const GoogleRating: React.FC<GoogleRatingProps> = ({ 
  rating = 4.8, 
  reviewCount = 124,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 ${className}`}>
      <div className="flex items-center">
        <span className="text-yellow-400 font-bold mr-1">{rating}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-300">
        <span className="font-medium">Google Rating</span>
        <span className="mx-1">•</span>
        <span>{reviewCount} reviews</span>
      </div>
    </div>
  );
};

export default GoogleRating;
