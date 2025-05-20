import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { MomentCardProps } from '../lib/types';

const PhotoCard: React.FC<MomentCardProps> = ({ 
  card, 
  onFavorite, 
  onClick,
  canDelete,
  onDelete 
}) => {
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
      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
    >
      {card.optimized_url && (
        <img 
          src={card.optimized_url} 
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Gradient overlay - always visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Bottom metadata - always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
        <span className="text-white text-sm font-medium">
          {card.uploader_display_name}
        </span>
        <button
          onClick={handleFavorite}
          className={`text-white hover:text-orange-500 transition-colors ${
            card.is_favorited ? 'text-orange-500' : ''
          }`}
        >
          <Heart 
            size={20} 
            className={card.is_favorited ? 'fill-current' : ''} 
          />
        </button>
      </div>

      {/* Delete button - always visible if canDelete is true */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default PhotoCard; 