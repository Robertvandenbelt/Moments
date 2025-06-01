import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { MomentCard } from '../lib/types';

interface PhotoUploadSheetProps {
  momentBoardId: string;
  onClose: () => void;
  onSuccess: (card: MomentCard) => void;
}

type UploadPreview = {
  id: string;
  file: File;
  preview: string;
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PhotoUploadSheet: React.FC<PhotoUploadSheetProps> = ({ momentBoardId, onClose, onSuccess }) => {
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (previews.length + acceptedFiles.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} photos at once`);
      return;
    }

    const newPreviews = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [previews.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading || previews.length >= MAX_FILES
  });

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const session = await supabase.auth.getSession();
      const accessToken = session.data?.session?.access_token;

      for (const preview of previews) {
        const fileExt = preview.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `PhotoCards/Originals/${fileName}`;

        // Upload to Supabase Storage (momentcards bucket)
        console.log('Attempting to upload to storage:', {
          bucket: 'momentcards',
          path: filePath,
          fileSize: preview.file.size,
          fileType: preview.file.type
        });

        const { error: uploadError } = await supabase.storage
          .from('momentcards')
          .upload(filePath, preview.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error details:', {
            error: uploadError,
            message: uploadError.message,
            statusCode: uploadError.statusCode,
            name: uploadError.name,
            details: uploadError.details
          });
          alert(`Failed to upload photo to storage: ${uploadError.message}`);
          continue;
        }

        console.log('Successfully uploaded to storage:', filePath);

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('momentcards')
          .getPublicUrl(filePath);

        // Call the Edge function to create the card, with auth token
        console.log('Invoking add-photo-card Edge function with:', {
          moment_board_id: momentBoardId,
          media_url: publicUrl
        });
        const { data, error } = await supabase.functions.invoke('add-photo-card', {
          body: {
            moment_board_id: momentBoardId,
            media_url: publicUrl
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        console.log('Edge function response:', { data, error });

        if (error) {
          console.error('Edge function error:', error);
          alert('Failed to create photo card.');
          continue;
        }
        if (!data || !data.id) {
          console.error('Edge function did not return a valid card:', data);
          alert('Photo card was not created.');
          continue;
        }

        onSuccess(data);
      }

      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.preview));
    };
  }, [previews]);

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
            <div className="grid grid-cols-3 gap-2 mb-4">
              {previews.map(preview => (
                <div key={preview.id} className="relative aspect-square">
                  <img
                    src={preview.preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(preview.preview);
                      setPreviews(prev => prev.filter(p => p.id !== preview.id));
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={previews.length === 0 || isUploading}
            className="w-full bg-teal-500 text-white py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload photos'}
          </button>
        </div>
      </div>
    </>
  );
};

export default PhotoUploadSheet; 