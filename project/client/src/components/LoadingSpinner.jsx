import React from 'react';
import { Heart } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <Heart 
          className={`${sizeClasses[size]} text-red-600 animate-pulse`} 
          fill="currentColor"
        />
        <div className="absolute inset-0 animate-ping">
          <Heart 
            className={`${sizeClasses[size]} text-red-300`} 
            fill="currentColor"
          />
        </div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;