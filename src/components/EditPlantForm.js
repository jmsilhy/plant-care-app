import React, { useState } from 'react';

function EditPlantForm({ 
  edit_plant_data, 
  onInputChange, 
  onSubmit, 
  onCancel,
  onOpenPhotoUpload,
  onUpdatePhotoOrder,
  onDeletePhoto,
  onSetCoverPhoto
}) {
  const [dragged_index, setDraggedIndex] = useState(null);
  const [drag_over_index, setDragOverIndex] = useState(null);

  // Handle drag and drop for photo reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add some visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e, drop_index) => {
    e.preventDefault();
    
    if (dragged_index === null || dragged_index === drop_index) return;

    // Create new photos array with reordered items
    const photos = [...edit_plant_data.photos];
    const dragged_photo = photos[dragged_index];
    
    // Remove dragged item and insert at new position
    photos.splice(dragged_index, 1);
    photos.splice(drop_index, 0, dragged_photo);

    // Update local state immediately for UI feedback
    onInputChange({
      target: {
        name: 'photos',
        value: photos
      }
    });

    // Save the new order to database
    const photo_ids = photos.map(photo => photo.id);
    try {
      await onUpdatePhotoOrder(edit_plant_data.id, photo_ids);
    } catch (error) {
      console.error('Failed to save photo order:', error);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeletePhoto = (photo_id) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      onDeletePhoto(edit_plant_data.id, photo_id);
    }
  };

  const handleSetCover = (photo_id) => {
    // Check if this is a temporary photo (not saved yet)
    if (typeof photo_id === 'number' || photo_id.toString().includes('.')) {
      alert('Please save the plant first before setting a cover photo. New photos need to be saved before they can be set as cover photos.');
      return;
    }
    onSetCoverPhoto(edit_plant_data.id, photo_id);
  };

  return (
    // Modal wrapper - Fixed the background visibility issue
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-md border-l-4 border-yellow-500 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit Plant</h2>
            <button
              type="button"
              onClick={() => onOpenPhotoUpload && onOpenPhotoUpload()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg transition-colors"
            >
              Add Photos
            </button>
          </div>

          {/* Photo management section */}
          {edit_plant_data.photos && edit_plant_data.photos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Manage Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {edit_plant_data.photos.map((photo, index) => {
                  const isTemporaryPhoto = typeof photo.id === 'number' || photo.id.toString().includes('.');
                  return (
                    <div
                      key={photo.id}
                      className={`relative group cursor-move border-2 rounded-lg overflow-hidden ${
                        photo.id === edit_plant_data.cover_photo_id 
                          ? 'border-green-500 border-4' 
                          : isTemporaryPhoto
                          ? 'border-yellow-400 border-dashed'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${drag_over_index === index ? 'border-blue-400 bg-blue-50' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {/* Photo thumbnail */}
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Plant photo'}
                        className="w-full h-24 object-cover"
                      />
                      
                      {/* Status indicators */}
                      {photo.id === edit_plant_data.cover_photo_id && (
                        <div className="absolute top-1 left-1">
                          <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                            Cover
                          </span>
                        </div>
                      )}
                      
                      {isTemporaryPhoto && (
                        <div className="absolute top-1 right-1">
                          <span className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                            Unsaved
                          </span>
                        </div>
                      )}

                      {/* Action buttons (visible on hover) */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          {/* Set as cover button - disabled for unsaved photos */}
                          {photo.id !== edit_plant_data.cover_photo_id && (
                            <button
                              onClick={() => handleSetCover(photo.id)}
                              className={`text-white p-1 rounded text-xs ${
                                isTemporaryPhoto 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}
                              title={isTemporaryPhoto ? "Save plant first to set as cover" : "Set as cover photo"}
                              disabled={isTemporaryPhoto}
                            >
                              📷
                            </button>
                          )}
                          
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                            title="Delete photo"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Drag handle indicator */}
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-70">
                        <span className="text-white text-xs">⋮⋮</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                💡 Drag photos to reorder • Hover for options • Green border = cover photo • Yellow dashed border = unsaved photo
              </p>
            </div>
          )}

          {/* Form fields */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant Name *
              </label>
              <input
                type="text"
                name="name"
                value={edit_plant_data.name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species
              </label>
              <select
                name="species"
                value={edit_plant_data.species}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="Portulacaria Afra">Portulacaria Afra (Elephant Bush)</option>
                <option value="Portulacaria Afra Variegata">Portulacaria Afra Variegata</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acquisition Date
              </label>
              <input
                type="date"
                name="acquisition_date"
                value={edit_plant_data.acquisition_date}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                name="source"
                value={edit_plant_data.source}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={edit_plant_data.price}
                onChange={onInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={edit_plant_data.notes}
                onChange={onInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Update Plant
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPlantForm;