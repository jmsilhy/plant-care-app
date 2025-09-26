import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function PhotoUpload({ plant_id, onPhotoUpload, onClose }) {
  const [previews, setPreviews] = useState([]);
  const [captions, setCaptions] = useState({});
  const [is_uploading, setIsUploading] = useState(false);
  const { supabase } = useAuth(); // Get supabase instance

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs
    const new_previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setPreviews(new_previews);

    // Initialize captions
    const initial_captions = {};
    new_previews.forEach(preview => {
      initial_captions[preview.id] = '';
    });
    setCaptions(initial_captions);
  };

  const handleCaptionChange = (preview_id, caption) => {
    setCaptions(prev => ({
      ...prev,
      [preview_id]: caption
    }));
  };

  const removePreview = (preview_id) => {
    setPreviews(prev => prev.filter(p => p.id !== preview_id));
    setCaptions(prev => {
      const { [preview_id]: removed, ...rest } = prev;
      return rest;
    });
  };

  const uploadFileToStorage = async (file, plant_id) => {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `plant-${plant_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);
      
    return {
      storage_path: fileName,
      public_url: urlData.publicUrl
    };
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setIsUploading(true);

    try {
      // Process each file
      for (const preview of previews) {
        // Upload to Supabase Storage instead of converting to base64
        const { storage_path, public_url } = await uploadFileToStorage(preview.file, plant_id);
        
        const photo_data = {
          url: public_url,  // Store the public URL, not base64!
          file_name: preview.file.name,
          caption: captions[preview.id] || '',
          storage_path: storage_path  // Keep track of storage path for potential deletion
        };

        await onPhotoUpload(plant_id, photo_data);
      } 

      // Clean up blob URLs
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading photos: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Upload Plant Photos</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* File Input */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Select one or more images (JPG, PNG, etc.)
            </p>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Preview & Add Captions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previews.map(preview => (
                  <div key={preview.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="relative">
                      <img
                        src={preview.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <button
                        onClick={() => removePreview(preview.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Add caption (optional)"
                      value={captions[preview.id] || ''}
                      onChange={(e) => handleCaptionChange(preview.id, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{preview.file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={previews.length === 0 || is_uploading}
              className={`${
                previews.length === 0 || is_uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              {is_uploading ? 'Uploading...' : `Upload ${previews.length} Photo${previews.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoUpload;