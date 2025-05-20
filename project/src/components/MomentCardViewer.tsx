import React, { useState } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { MomentCardViewerProps } from '../lib/types';
import ConfirmDialog from './ConfirmDialog';
import { deleteMomentBoard } from '../services/momentBoard';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentCard = cards[currentCardIndex];
  const isFirst = currentCardIndex === 0;
  const isLast = currentCardIndex === cards.length - 1;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavorite(currentCard.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMomentBoard(currentCard.id);
      if (onDelete) {
        await onDelete(currentCard.id);
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete moment board:', error);
      // You might want to show an error toast here
    }
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
        <div className="relative">
          {currentCard.type === 'photo' ? (
            <img
              src={currentCard.media_url || ''}
              alt=""
              className="w-full rounded-xl"
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
            <div className="flex items-center gap-4">
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
              {canDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <MoreVertical size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Moment Board"
        message="Are you sure you want to delete this moment board? This action cannot be undone and will remove all associated cards and comments."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
};

export default MomentCardViewer; 