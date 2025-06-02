import React, { useEffect } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { MomentCardViewerProps } from '../lib/types';
import { MomentCard } from '../lib/types';
import { format, parseISO } from 'date-fns';

// Helper function to get image URL
const getImageUrl = (card: MomentCard) => {
  if (card.type !== 'photo' || !card.media_url) return null;
  const filename = card.media_url.split('/').pop();
  return `https://ekwpzlzdjbfzjdtdfafk.supabase.co/storage/v1/render/image/public/momentcards/PhotoCards/Originals/${filename}?width=1200&height=1200&resize=contain&quality=80`;
};

// Preload an image
const preloadImage = (url: string) => {
  const img = new Image();
  img.src = url;
};

const MomentCardViewer: React.FC<MomentCardViewerProps> = ({
  cards,
  currentCardIndex,
  onClose,
  onNext,
  onPrevious,
  onFavorite,
  canDelete,
  onDelete
}) => {
  const currentCard = cards[currentCardIndex];
  const isFirst = currentCardIndex === 0;
  const isLast = currentCardIndex === cards.length - 1;

  // Preload adjacent images
  useEffect(() => {
    if (!isFirst) {
      const prevUrl = getImageUrl(cards[currentCardIndex - 1]);
      if (prevUrl) preloadImage(prevUrl);
    }
    if (!isLast) {
      const nextUrl = getImageUrl(cards[currentCardIndex + 1]);
      if (nextUrl) preloadImage(nextUrl);
    }
  }, [currentCardIndex, cards, isFirst, isLast]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && !isFirst) onPrevious();
      if (e.key === 'ArrowRight' && !isLast) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, isFirst, isLast]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavorite(currentCard.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(currentCard.id);
    }
  };

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {!isLast && (
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Delete button */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-red-500 hover:bg-opacity-70 transition-colors"
              >
                <Trash2 size={24} />
              </button>
            )}

            {/* Main content */}
            <div className="bg-white">
              <div className="relative">
                {currentCard.type === 'photo' ? (
                  <div className="relative aspect-square bg-black">
                    {getImageUrl(currentCard) && (
                      <img
                        src={getImageUrl(currentCard)!}
                        alt=""
                        className="max-w-full max-h-full w-auto h-auto object-contain mx-auto"
                        loading="eager"
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-square bg-gradient-to-br from-teal-500 to-lime-300 p-12 flex items-center justify-center">
                    <p className="text-white text-2xl font-medium text-center">
                      {currentCard.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {currentCard.uploader_display_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(currentCard.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                      currentCard.is_favorited ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Heart 
                      size={24} 
                      className={currentCard.is_favorited ? 'fill-current' : ''} 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomentCardViewer; 