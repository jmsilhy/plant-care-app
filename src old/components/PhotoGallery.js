import React from 'react';

function PhotoGallery({ 
  plant, 
  onSetCoverPhoto, 
  onDeletePhoto, 
  onClose 
}) {
  const { photos, coverPhotoId } = plant;

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Photo Gallery - {plant.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No photos uploaded yet</p>
          <p className="text-sm text-gray-400">Use the "Photos" button to upload images</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Photo Gallery - {plant.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} • 
        Click "Set as Cover" to choose the main photo for this plant
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
        {photos.map(photo => (
          <div 
            key={photo.id} 
            className={`border-2 rounded-lg p-3 ${
              photo.id === coverPhotoId 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="relative">
              <img
                src={photo.url}
                alt={photo.caption || 'Plant photo'}
                className="w-full h-32 object-cover rounded mb-2"
              />
              {photo.id === coverPhotoId && (
                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}
            </div>
            
            {photo.caption && (
              <p className="text-sm text-gray-700 mb-2">{photo.caption}</p>
            )}
            
            <p className="text-xs text-gray-500 mb-2">
              {new Date(photo.uploadDate).toLocaleDateString()}
            </p>
            
            <div className="flex space-x-1">
              {photo.id !== coverPhotoId && (
                <button
                  onClick={() => onSetCoverPhoto(plant.id, photo.id)}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
                >
                  Set as Cover
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this photo?')) {
                    onDeletePhoto(plant.id, photo.id);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoGallery;