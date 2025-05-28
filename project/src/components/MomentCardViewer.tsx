import React, { useEffect } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { MomentCardViewerProps } from '../lib/types';
import { MomentCard } from '../lib/types';

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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
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
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="relative flex-1 min-h-0">
            <div className="bg-black w-full h-full flex items-center justify-center" style={{ height: 'calc(85vh - 64px)' }}>
              {currentCard.type === 'photo' ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={`https://ekwpzlzdjbfzjdtdfafk.supabase.co/storage/v1/render/image/public/momentcards/PhotoCards/Originals/${currentCard.media_url?.split('/').pop()}?width=1200&height=1200&resize=contain&quality=80`}
                    alt=""
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    loading="eager"
                    style={{ maxHeight: '100%' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-lime-300 p-12 flex items-center justify-center">
                  <p className="text-white text-2xl font-medium text-center">
                    {currentCard.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata footer */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-white">
            <span className="text-gray-900 text-lg font-medium">
              {currentCard.uploader_display_name}
            </span>
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
  );
};

export default MomentCardViewer; 