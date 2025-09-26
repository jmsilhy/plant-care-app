import React, { useState } from 'react';
import { formatCareDate, getActivityDisplay, formatPrice } from '../utils/careUtils';
import PhotoLightbox from './PhotoLightbox';

function PlantDetailView({ 
  plant, 
  plant_activities, 
  onBackToCollection, 
  onStartEdit, 
  onLogCare,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!plant) {
    return (
      <div className="text-center">
        <p className="text-red-600">Plant not found!</p>
        <button 
          onClick={onBackToCollection} 
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  const handlePhotoClick = (photoIndex) => {
    setCurrentPhotoIndex(photoIndex);
    setLightboxOpen(true);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % plant.photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + plant.photos.length) % plant.photos.length);
  };

  return (
    <>
      <div>
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToCollection}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <span className="mr-1">←</span> Back to Collection
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => onStartEdit(plant)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Edit Plant
            </button>
          </div>
        </div>

        {/* Plant Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{plant.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Species:</span> {plant.species}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Acquired:</span> {plant.acquisition_date}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Source:</span> {plant.source}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Price:</span> {formatPrice(plant.price)}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Total Care Activities:</span> {plant_activities.length}
              </p>
            </div>
          </div>
          {plant.notes && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs font-semibold text-gray-600 mb-1">Notes:</p>
              <p className="text-sm text-gray-700">{plant.notes}</p>
            </div>
          )}
        </div>

        {/* Improved Photo Gallery Section */}
        {plant.photos && plant.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Plant Photos ({plant.photos.length})
            </h2>
            
            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {plant.photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-blue-400 ${
                    photo.id === plant.cover_photo_id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                  onClick={() => handlePhotoClick(index)}
                >
                  <div className="relative h-32 bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Plant photo'}
                      className="w-full h-full object-contain group-hover:object-cover transition-all duration-300"
                      style={{ backgroundColor: '#f8f9fa' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    
                    {/* Cover photo indicator */}
                    {photo.id === plant.cover_photo_id && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Cover
                      </div>
                    )}

                    {/* Hover overlay with zoom icon */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-3 transition-all">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>

                    {/* Photo number indicator */}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Photo info */}
                  <div className="p-2">
                    {photo.caption && (
                      <p className="text-sm text-gray-700 mb-1 truncate">{photo.caption}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                💡 Click any photo to view full size • Use arrow keys or buttons to navigate • To manage photos (add, delete, reorder, or set cover), click the "Edit Plant" button above.
              </p>
            </div>
          </div>
        )}

        {/* Quick Care Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Care Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => onLogCare(plant.id, 'watering')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              💧 Water
            </button>
            <button
              onClick={() => onLogCare(plant.id, 'fertilizing')}
              className="bg-green-100 hover:bg-green-200 text-green-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              🌱 Fertilize
            </button>
            <button
              onClick={() => onLogCare(plant.id, 'pest-control')}
              className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              🐛 Pest Control
            </button>
            <button
              onClick={() => onLogCare(plant.id, 'repotting')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              🏺 Repot
            </button>
            <button
              onClick={() => onLogCare(plant.id, 'structural-work')}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              ✂️ Structural
            </button>
          </div>
        </div>

        {/* Complete Care History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Care History</h2>
          {plant_activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No care activities logged yet.</p>
              <p className="text-sm text-gray-400">Use the Quick Care Actions above to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plant_activities.map(activity => {
                const display = getActivityDisplay(activity.activity_type);
                return (
                  <div key={activity.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{display.emoji}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">{display.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {formatCareDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {plant.photos && plant.photos.length > 0 && (
        <PhotoLightbox
          photo={plant.photos[currentPhotoIndex]}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={plant.photos.length > 1 ? handleNextPhoto : null}
          onPrevious={plant.photos.length > 1 ? handlePrevPhoto : null}
          currentIndex={currentPhotoIndex}
          totalPhotos={plant.photos.length}
        />
      )}
    </>
  );
}

export default PlantDetailView;