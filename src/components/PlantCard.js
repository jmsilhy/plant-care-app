import React, { useState } from 'react';
import { getActivityDisplay, formatPrice } from '../utils/careUtils';
import PhotoLightbox from './PhotoLightbox';

function PlantCard({ 
  plant, 
  bulk_care_mode, 
  is_selected, 
  onToggleSelect, 
  onViewPlant, 
  onStartEdit, 
  onDeletePlant, 
  onLogCare,
  onOpenPhotoUpload,
  onOpenPhotoGallery,  
  recent_activities 
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Get cover photo
  const getCoverPhoto = () => {
    if (!plant.photos || plant.photos.length === 0) return null;
    return plant.photos.find(p => p.id === plant.cover_photo_id) || plant.photos[0];
  };

  const handlePhotoClick = (photoIndex = 0) => {
    setCurrentPhotoIndex(photoIndex);
    setLightboxOpen(true);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % plant.photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + plant.photos.length) % plant.photos.length);
  };

  const cover_photo = getCoverPhoto();

  return (
    <>
      <div 
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all ${
          bulk_care_mode 
            ? is_selected
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-300 bg-gray-50 opacity-70'
            : 'border-green-500'
        }`}
      >
        {/* Bulk Selection Checkbox */}
        {bulk_care_mode && (
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id={`select-${plant.id}`}
              checked={is_selected}
              onChange={onToggleSelect}
              className="mr-2 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <label 
              htmlFor={`select-${plant.id}`}
              className={`text-sm font-medium cursor-pointer ${
                is_selected ? 'text-purple-700 font-bold' : 'text-gray-600'
              }`}
            >
              {is_selected ? 'Selected for bulk actions' : 'Click to select'}
            </label>
          </div>
        )}

        <h3 className={`text-xl font-bold mb-2 ${
          bulk_care_mode 
            ? is_selected ? 'text-purple-800' : 'text-gray-500'
            : 'text-gray-800'
        }`}>
          {plant.name}
        </h3>

        {/* Improved Cover Photo Display */}
        {cover_photo && (
          <div className="mb-3">
            <div 
              className={`relative h-40 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group ${
                bulk_care_mode && !is_selected ? 'opacity-60' : ''
              }`}
              onClick={() => handlePhotoClick(0)}
            >
              <img
                src={cover_photo.url}
                alt={cover_photo.caption || plant.name}
                className="w-full h-full object-contain hover:object-cover transition-all duration-300"
                style={{ backgroundColor: '#f8f9fa' }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-2 transition-all">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              {/* Photo count indicator */}
              {plant.photos.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  1 / {plant.photos.length}
                </div>
              )}
            </div>
            
            <p className={`text-xs mt-1 text-center ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {plant.photos.length} photo{plant.photos.length !== 1 ? 's' : ''} • Click to view full size
            </p>
          </div>
        )}

        {/* Plant Info */}
        <p className={`text-sm mb-1 ${
          bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span className="font-semibold">Species:</span> {plant.species}
        </p>
        <p className={`text-sm mb-1 ${
          bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span className="font-semibold">Acquired:</span> {plant.acquisition_date}
        </p>
        <p className={`text-sm mb-1 ${
          bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span className="font-semibold">Source:</span> {plant.source}
        </p>
        <p className={`text-sm mb-2 ${
          bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span className="font-semibold">Price:</span> {formatPrice(plant.price)}
        </p>
        <p className={`text-xs italic mb-3 ${
          bulk_care_mode && !is_selected ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {plant.notes}
        </p>

        {/* Care Activity Buttons - Hide in bulk mode */}
        {!bulk_care_mode && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Quick Care Actions:</p>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <button
                onClick={() => onLogCare(plant.id, 'watering')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                💧 Water
              </button>
              <button
                onClick={() => onLogCare(plant.id, 'fertilizing')}
                className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                🌱 Fertilize
              </button>
              <button
                onClick={() => onLogCare(plant.id, 'pest-control')}
                className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                🐛 Pest Control
              </button>
              <button
                onClick={() => onLogCare(plant.id, 'repotting')}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                🏺 Repot
              </button>
              <button
                onClick={() => onLogCare(plant.id, 'structural-work')}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                ✂️ Structural
              </button>
            </div>
          </div>
        )}

        {/* Recent Care History */}
        <div className="mb-4">
          {recent_activities.length > 0 && (
            <>
              <p className={`text-xs font-semibold mb-1 ${
                bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
              }`}>Recent Care:</p>
              <div className="space-y-1">
                {recent_activities.map(activity => (
                  <div key={activity.id} className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                    bulk_care_mode && !is_selected 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    <span className="font-medium">
                      {(() => {
                        const display = getActivityDisplay(activity.activity_type);
                        return `${display.emoji} ${display.name}`;
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Plant Management Buttons - Hide completely in bulk mode */}
        {!bulk_care_mode && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onViewPlant(plant.id)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
            >
              View
            </button>
            
            <button
              onClick={() => onStartEdit(plant)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this plant?')) {
                  onDeletePlant(plant.id);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
            >
              Delete
            </button>
          </div>
        )}
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

export default PlantCard;