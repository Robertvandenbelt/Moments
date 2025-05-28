import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { MomentCardProps } from '../lib/types';

const TextCard: React.FC<MomentCardProps> = ({ 
  card, 
  onFavorite, 
  onClick,
  canDelete,
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavorite(card.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(card.id);
    } catch (error) {
      console.error('Failed to delete card:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative h-full rounded-xl overflow-hidden group cursor-pointer transition duration-300 hover:shadow-xl ring-1 ring-black/5 shadow-sm flex flex-col ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Text content */}
      <div className="relative flex-1 bg-gradient-to-br from-teal-500 to-lime-300 p-6 flex items-center justify-center">
        <p className="text-white text-lg font-medium line-clamp-6 text-center">
          {card.description}
        </p>

        {/* Delete button - visible on hover */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/30 text-white 
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 hover:bg-opacity-70'} 
              transition-colors opacity-0 group-hover:opacity-100`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Metadata footer */}
      <div className="px-3 py-2 border-t border-black/10 flex justify-between items-center bg-white/80">
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

export default TextCard; 