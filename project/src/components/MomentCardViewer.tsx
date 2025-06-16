import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MomentCard } from '../lib/types';
import 'material-symbols/outlined.css';

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
    <div 
      className="fixed inset-0 z-50" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Scrim - M3 uses 50% opacity for dialog scrim */}
      <div 
        className="fixed inset-0 bg-scrim transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Dialog container with M3 elevation and shape */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
          <div className="relative w-full max-w-4xl transform rounded-xl bg-surface shadow-level3 transition-all duration-300 sm:my-8">
            {/* Top action bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-2">
              {/* Close button */}
              <button
                onClick={onClose}
                className="relative p-2.5 rounded-full hover:bg-surface-container-highest transition-colors"
              >
                <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                <span 
                  className="material-symbols-outlined relative text-on-surface-variant"
                  style={{ 
                    fontSize: '24px',
                    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  close
                </span>
              </button>
            </div>

            {/* Navigation buttons (fixed left/right) */}
            <div className="absolute top-1/2 left-0 right-0 z-10 flex justify-between px-4 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">
                {hasPrevious && onPrevious && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrevious();
                    }}
                    className="relative p-3 rounded-full bg-surface-container-highest transition-colors"
                  >
                    <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                    <span 
                      className="material-symbols-outlined relative text-on-surface"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      arrow_back
                    </span>
                  </button>
                )}
              </div>
              <div className="pointer-events-auto">
                {hasNext && onNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="relative p-3 rounded-full bg-surface-container-highest transition-colors"
                  >
                    <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                    <span 
                      className="material-symbols-outlined relative text-on-surface"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      arrow_forward
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="bg-surface">
              <div className="relative">
                {card.type === 'photo' ? (
                  <div className="relative aspect-[4/3] bg-surface-container-lowest">
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
                  <div className="relative aspect-[4/3] bg-primary-container p-12 flex items-center justify-center">
                    <p className="text-headline-medium font-roboto-flex text-on-primary-container text-center">
                      {card.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Supporting text */}
              <div className="px-6 py-4 bg-surface border-t border-outline-variant">
                <div>
                  <p className="text-title-medium font-roboto-flex text-on-surface">
                    {card.uploader_display_name}
                  </p>
                  <p className="text-body-medium font-roboto-flex text-on-surface-variant">
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