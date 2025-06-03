import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { MomentCardProps } from '../lib/types';
import { format, parseISO } from 'date-fns';

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
    <article 
      onClick={onClick}
      className={`bg-white rounded-xl w-full shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer group ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="aspect-square bg-gradient-to-br from-teal-500 to-lime-300 p-6 flex items-center justify-center">
        <p className="text-white text-lg font-medium line-clamp-6 text-center">
          {card.description}
        </p>

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

export default TextCard; 