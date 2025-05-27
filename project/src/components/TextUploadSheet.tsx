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
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 z-50 animate-slide-up">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add text memory</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, charLimit))}
            placeholder="What's the story behind this moment?"
            className="w-full h-40 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          
          <div className="flex justify-between items-center mt-2 mb-4">
            <span className="text-sm text-gray-500">
              {text.length} / {charLimit} characters
            </span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="w-full bg-teal-500 text-white py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create text card'}
          </button>
        </form>
      </div>
    </>
  );
};

export default TextUploadSheet; 