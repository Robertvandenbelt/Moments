import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MomentCard } from '../lib/types';

type MomentCardViewerProps = {
  card: MomentCard;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
};

// Helper function to get image URL
const getImageUrl = (card: MomentCard) => {
  if (card.type !== 'photo' || !card.media_url) return null;
  const filename = card.media_url.split('/').pop();
  return `https://ekwpzlzdjbfzjdtdfafk.supabase.co/storage/v1/render/image/public/momentcards/PhotoCards/Originals/${filename}?width=1200&height=1200&resize=contain&quality=80`;
};

const MomentCardViewer: React.FC<MomentCardViewerProps> = ({
  card,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrevious && hasPrevious) onPrevious();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

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
            {hasPrevious && onPrevious && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {hasNext && onNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Main content */}
            <div className="bg-white">
              <div className="relative">
                {card.type === 'photo' ? (
                  <div className="relative aspect-square bg-black">
                    {getImageUrl(card) && (
                      <img
                        src={getImageUrl(card)!}
                        alt=""
                        className="max-w-full max-h-full w-auto h-auto object-contain mx-auto"
                        loading="eager"
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-square bg-gradient-to-br from-teal-500 to-lime-300 p-12 flex items-center justify-center">
                    <p className="text-white text-2xl font-medium text-center">
                      {card.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {card.uploader_display_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(card.created_at), 'MMMM d, yyyy')}
                  </p>
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