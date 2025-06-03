import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { MomentCardProps } from '../lib/types';
import { format, parseISO } from 'date-fns';

// Helper function to get image URL with dimensions
const getImageUrl = (mediaUrl: string, width: number, height: number = width) => {
  if (!mediaUrl) return '';
  // The mediaUrl is already a complete Supabase storage URL, just add the transform parameters
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
    <article 
      onClick={onClick}
      className="bg-white rounded-xl w-full shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer group"
    >
      <div className="aspect-square bg-gray-100">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}

        {card.media_url && (
          <img
            src={`${card.media_url}?width=500&height=500&resize=cover&quality=80`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 text-white hover:bg-red-500 hover:bg-opacity-70 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">{card.uploader_display_name}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              {format(parseISO(card.created_at), 'MMM d, yyyy')}
            </p>
          </div>
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
    </article>
  );
};

export default PhotoCard; 