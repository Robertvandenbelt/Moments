import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { MomentCardProps } from '../lib/types';

// Helper function to get image URL with dimensions
const getImageUrl = (mediaUrl: string, width: number, height: number = width) => {
  if (!mediaUrl) return '';
  return `${mediaUrl}?width=${width}&height=${height}&resize=cover&quality=80`;
};

const PhotoCard: React.FC<MomentCardProps> = ({ 
  card, 
  onFavorite, 
  onClick,
  canDelete,
  onDelete 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavorite(card.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(card.id);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="relative h-full rounded-xl overflow-hidden bg-white group cursor-pointer transition duration-300 hover:shadow-xl ring-1 ring-black/5 shadow-sm flex flex-col"
    >
      {/* Photo container */}
      <div className="relative aspect-square">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}

        {card.media_url && (
          <picture>
            {/* Small screens */}
            <source
              media="(max-width: 640px)"
              srcSet={getImageUrl(card.media_url, 300)}
            />
            {/* Medium screens */}
            <source
              media="(max-width: 1024px)"
              srcSet={getImageUrl(card.media_url, 400)}
            />
            {/* Large screens */}
            <source
              media="(min-width: 1025px)"
              srcSet={getImageUrl(card.media_url, 500)}
            />
            {/* Fallback */}
            <img 
              src={getImageUrl(card.media_url, 400)}
              alt=""
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={() => setIsLoading(false)}
            />
          </picture>
        )}

        {/* Delete button - visible on hover */}
        {canDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 text-white hover:bg-red-500 hover:bg-opacity-70 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Metadata footer */}
      <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center bg-white/80">
        <span className="text-gray-600 text-sm font-medium truncate">
          {card.uploader_display_name}
        </span>
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
            card.is_favorited ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Heart 
            size={18} 
            className={card.is_favorited ? 'fill-current' : ''} 
          />
        </button>
      </div>
    </div>
  );
};

export default PhotoCard; 