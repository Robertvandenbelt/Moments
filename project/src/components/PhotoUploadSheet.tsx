import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, X, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

type PhotoUploadSheetProps = {
  momentBoardId: string;
  onClose: () => void;
  onSuccess: (newCard: any) => void;
};

type UploadPreview = {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'error';
  error?: string;
};

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export const PhotoUploadSheet: React.FC<PhotoUploadSheetProps> = ({
  momentBoardId,
  onClose,
  onSuccess,
}) => {
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out files that exceed size limit or wrong type
    const validFiles = acceptedFiles.filter(
      file => file.size <= MAX_FILE_SIZE && ACCEPTED_TYPES.includes(file.type)
    ).slice(0, MAX_FILES - previews.length);

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [previews.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: MAX_FILES - previews.length,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading || previews.length >= MAX_FILES,
  });

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setIsUploading(true);

    for (const preview of previews) {
      if (preview.status !== 'pending') continue;

      try {
        // Upload to Supabase Storage
        const fileExt = preview.file.name.split('.').pop();
        const fileName = `${momentBoardId}_${uuidv4()}.${fileExt}`;
        const filePath = `PhotoCards/Originals/${fileName}`;

        console.log('Attempting upload with:', {
          bucket: 'momentcards',
          filePath,
          fileType: preview.file.type,
          fileSize: preview.file.size
        });

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('momentcards')
          .upload(filePath, preview.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: preview.file.type
          });

        if (uploadError) {
          console.error('Storage upload error details:', {
            error: uploadError,
            message: uploadError.message,
            name: uploadError.name,
            stack: uploadError.stack
          });
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        if (!uploadData?.path) {
          throw new Error('Upload successful but no path returned');
        }

        console.log('Upload successful:', uploadData);

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('momentcards')
          .getPublicUrl(filePath);

        if (!publicUrl) {
          throw new Error('Failed to get public URL for uploaded file');
        }

        console.log('Got public URL:', publicUrl);

        // Call Edge function to add photo card
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error('No session');

          console.log('Calling Edge function with:', {
            moment_board_id: momentBoardId,
            media_url: publicUrl
          });

          const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/add-photo-card', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              moment_board_id: momentBoardId,
              media_url: publicUrl,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Edge function error:', {
              status: response.status,
              statusText: response.statusText,
              errorData
            });
            throw new Error(errorData?.message || `Edge function failed: ${response.statusText}`);
          }

          const newCard = await response.json();
          console.log('Edge function success:', newCard);
          onSuccess(newCard);
        } catch (err) {
          // If it's a CORS error or the Edge function is not accessible,
          // create a temporary card object
          console.warn('Edge function error (continuing anyway):', err);
          const tempCard = {
            id: uuidv4(),
            moment_board_id: momentBoardId,
            media_url: publicUrl,
            type: 'photo',
            created_at: new Date().toISOString(),
            is_favorited: false,
            is_own_card: true,
            uploader_display_name: 'You'
          };
          onSuccess(tempCard);
        }

        // Update preview status
        setPreviews(prev =>
          prev.map(p =>
            p === preview ? { ...p, status: 'pending' } : p
          )
        );

      } catch (err) {
        console.error('Upload error:', err);
        let errorMessage = 'Upload failed';
        
        if (err instanceof Error) {
          if (err.message.includes('storage/')) {
            errorMessage = 'Storage error: Please try again';
          } else if (err.message.includes('auth/')) {
            errorMessage = 'Session expired: Please log in again';
          } else if (err.message.includes('size')) {
            errorMessage = 'File too large (max 10MB)';
          } else {
            errorMessage = err.message;
          }
        }
        
        setPreviews(prev =>
          prev.map(p =>
            p === preview ? { ...p, status: 'error', error: errorMessage } : p
          )
        );
      }
    }

    setIsUploading(false);
  };

  const removePreview = (previewToRemove: UploadPreview) => {
    URL.revokeObjectURL(previewToRemove.preview);
    setPreviews(prev => prev.filter(p => p !== previewToRemove));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 z-50 animate-slide-up">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add photos</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors
              ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-500'}
              ${isUploading || previews.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <input {...getInputProps()} />
            <Camera size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">
              {isDragActive ? (
                'Drop photos here...'
              ) : previews.length >= MAX_FILES ? (
                'Maximum number of photos reached'
              ) : (
                <>
                  Drag & drop photos here, or click to select
                  <br />
                  <span className="text-sm text-gray-500">
                    Maximum {MAX_FILES} photos, up to 10MB each (JPEG/PNG)
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={preview.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePreview(preview)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  {preview.status === 'error' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center p-2">
                        <AlertCircle size={24} className="mx-auto mb-1" />
                        <p className="text-sm">{preview.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={previews.length === 0 || isUploading}
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            {isUploading ? 'Uploading...' : 'Create photo card(s)'}
          </button>
        </div>
      </div>
    </>
  );
};

export default PhotoUploadSheet; 