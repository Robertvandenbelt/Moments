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
      className={`group relative bg-surface w-full rounded-xl shadow-level1 hover:shadow-level2 active:shadow-level1 transition-all duration-300 cursor-pointer overflow-hidden ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* State layer for hover/press states */}
      <div className="absolute inset-0 rounded-xl bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-300" />

      <div className="aspect-[16/9] bg-primary-container p-8 flex items-center justify-center relative">
        <p className="text-headline-small font-roboto-flex text-on-primary-container line-clamp-6 text-center">
          {card.description}
        </p>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`absolute top-2 right-2 p-2 rounded-full bg-surface-container-highest hover:bg-surface-container-highest/90 transition-colors ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
            <Trash2 
              size={20} 
              className="relative text-on-surface-variant"
            />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 bg-surface border-t border-outline-variant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-title-medium font-roboto-flex text-on-surface">{card.uploader_display_name}</p>
            <p className="text-body-medium font-roboto-flex text-on-surface-variant">
              {format(parseISO(card.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={handleFavorite}
            className="relative p-2.5 rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
            <Heart 
              size={20} 
              className={`relative ${card.is_favorited ? 'text-primary-action fill-current' : 'text-on-surface-variant'}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
};

export default TextCard; 