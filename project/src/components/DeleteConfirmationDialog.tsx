import React from 'react';
import { AlertTriangle } from 'lucide-react';

type DeleteConfirmationDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
};

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  onConfirm,
  onCancel,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6 animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-orange-100">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Delete Moment</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this moment? This action cannot be undone.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationDialog; 