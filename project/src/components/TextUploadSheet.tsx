import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TextUploadSheetProps {
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
  isSubmitting?: boolean;
}

const TextUploadSheet: React.FC<TextUploadSheetProps> = ({ onClose, onSubmit, isSubmitting = false }) => {
  const [text, setText] = useState('');
  const charLimit = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSubmitting) {
      await onSubmit(text.trim());
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/25 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-0 z-50 shadow-xl animate-slide-up border-t border-outline-variant">
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-outline-variant bg-surface rounded-t-2xl">
          <h2 className="text-title-large font-roboto-flex text-on-surface">Add text memory</h2>
          <button 
            onClick={onClose}
            className="relative p-3 rounded-full hover:bg-surface-container-highest transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 24 }}>
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6">
          <div className="mb-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, charLimit))}
              placeholder="What's the story behind this moment?"
              className="w-full h-40 px-4 py-3 border border-outline-variant rounded-xl bg-surface text-on-surface text-body-large font-roboto-flex resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              disabled={isSubmitting}
              maxLength={charLimit}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-label-medium text-on-surface-variant">
                {text.length} / {charLimit} characters
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="w-full h-12 rounded-full bg-primary text-on-primary text-label-large font-roboto-flex font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:bg-primary/80"
          >
            {isSubmitting ? 'Creating...' : 'Create text card'}
          </button>
        </form>
      </div>
    </>
  );
};

export default TextUploadSheet; 