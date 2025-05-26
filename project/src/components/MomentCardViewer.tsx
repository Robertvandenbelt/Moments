import React from 'react';
import { X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { MomentCardViewerProps } from '../lib/types';

const MomentCardViewer: React.FC<MomentCardViewerProps> = ({
  cards,
  currentCardIndex,
  onClose,
  onNext,
  onPrevious,
  onFavorite
}) => {
  const currentCard = cards[currentCardIndex];
  const isFirst = currentCardIndex === 0;
  const isLast = currentCardIndex === cards.length - 1;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavorite(currentCard.id);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>

      {/* Navigation buttons */}
      {!isFirst && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={48} />
        </button>
      )}

      {!isLast && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Main content */}
      <div className="max-w-4xl w-full mx-auto px-12">
        <div className="relative flex justify-center items-center" style={{ minHeight: '80vh' }}>
          {currentCard.type === 'photo' ? (
            <img
              src={`https://ekwpzlzdjbfzjdtdfafk.supabase.co/storage/v1/render/image/public/momentcards/PhotoCards/Originals/${currentCard.media_url?.split('/').pop()}?width=800&height=800&resize=contain&quality=80`}
              alt=""
              className="max-h-[80vh] max-w-full object-contain mx-auto block h-auto w-auto"
            />
          ) : (
            <div className="aspect-video bg-gradient-to-br from-teal-500 to-lime-300 rounded-xl p-12 flex items-center justify-center">
              <p className="text-white text-2xl font-medium text-center">
                {currentCard.media_url}
              </p>
            </div>
          )}

          {/* Bottom metadata */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/50 to-transparent">
            <span className="text-white text-lg font-medium">
              {currentCard.uploader_display_name}
            </span>
            <button
              onClick={handleFavorite}
              className={`text-white hover:text-orange-500 transition-colors ${
                currentCard.is_favorited ? 'text-orange-500' : ''
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