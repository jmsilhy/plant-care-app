import React, { useState } from 'react';

function PhotoUpload({ plantId, onPhotoUpload, onClose }) {
  const [previews, setPreviews] = useState([]);
  const [captions, setCaptions] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setPreviews(newPreviews);

    // Initialize captions
    const initialCaptions = {};
    newPreviews.forEach(preview => {
      initialCaptions[preview.id] = '';
    });
    setCaptions(initialCaptions);
  };

  const handleCaptionChange = (previewId, caption) => {
    setCaptions(prev => ({
      ...prev,
      [previewId]: caption
    }));
  };

  const removePreview = (previewId) => {
    setPreviews(prev => prev.filter(p => p.id !== previewId));
    setCaptions(prev => {
      const { [previewId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setIsUploading(true);

    try {
      // Process each file
      for (const preview of previews) {
        // Convert to base64 instead of using blob URL
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(preview.file);
        });
        const photoData = {
          url: base64, // Use base64 instead of blob URL
          fileName: preview.file.name,
          caption: captions[preview.id] || ''
        };

        onPhotoUpload(plantId, photoData);
      } 

      // Clean up blob URLs (we don't need them anymore)
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      onClose();
    } catch (error) {
      alert('Error uploading photos: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // 🎯 THE MAIN FIX: Added proper modal wrapper
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal content container with proper spacing and constraints */}
      <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Content wrapper with padding */}
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
              disabled={previews.length === 0 || isUploading}
              className={`${
                previews.length === 0 || isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              {isUploading ? 'Uploading...' : `Upload ${previews.length} Photo${previews.length !== 1 ? 's' : ''}`}
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