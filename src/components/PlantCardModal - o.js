import React, { useEffect, useRef } from 'react';
import { getActivityDisplay, formatPrice } from '../utils/careUtils';

function PlantCardModal({ 
  plant, 
  isOpen,
  onClose,
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
  const modal_ref = useRef(null);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (modal_ref.current && !modal_ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get cover photo
  const getCoverPhoto = () => {
    if (!plant.photos || plant.photos.length === 0) return null;
    return plant.photos.find(p => p.id === plant.cover_photo_id) || plant.photos[0];
  };

  const cover_photo = getCoverPhoto();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modal_ref}
        className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-l-4 ${
          bulk_care_mode 
            ? is_selected
              ? 'border-purple-500' 
              : 'border-gray-300'
            : 'border-green-500'
        }`}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className={`text-2xl font-bold truncate ${
            bulk_care_mode 
              ? is_selected ? 'text-purple-800' : 'text-gray-500'
              : 'text-gray-800'
          }`}>
            {plant.name}
          </h2>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bulk Selection Checkbox */}
          {bulk_care_mode && (
            <div className="flex items-center mb-4 p-3 bg-purple-50 rounded-lg">
              <input
                type="checkbox"
                id={`modal-select-${plant.id}`}
                checked={is_selected}
                onChange={onToggleSelect}
                className="mr-3 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <label 
                htmlFor={`modal-select-${plant.id}`}
                className={`text-sm font-medium cursor-pointer ${
                  is_selected ? 'text-purple-700 font-bold' : 'text-gray-600'
                }`}
              >
                {is_selected ? 'Selected for bulk actions' : 'Click to select for bulk actions'}
              </label>
            </div>
          )}

          {/* Cover Photo */}
          {cover_photo && (
            <div className="mb-6">
              <img
                src={cover_photo.url}
                alt={cover_photo.caption || plant.name}
                className={`w-full h-64 object-cover rounded-lg ${
                  bulk_care_mode && !is_selected ? 'opacity-60' : ''
                }`}
              />
              <p className={`text-sm mt-2 text-center ${
                bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {plant.photos.length} photo{plant.photos.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Plant Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 bg-gray-50 rounded-lg ${
              bulk_care_mode && !is_selected ? 'opacity-70' : ''
            }`}>
              <h3 className="font-semibold text-gray-700 mb-2">Plant Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Species:</span> {plant.species}</p>
                <p><span className="font-medium">Acquired:</span> {plant.acquisition_date}</p>
                <p><span className="font-medium">Source:</span> {plant.source}</p>
                <p><span className="font-medium">Price:</span> {formatPrice(plant.price)}</p>
              </div>
            </div>

            {/* Recent Care History */}
            <div className={`p-4 bg-blue-50 rounded-lg ${
              bulk_care_mode && !is_selected ? 'opacity-70' : ''
            }`}>
              <h3 className="font-semibold text-gray-700 mb-2">Recent Care</h3>
              {recent_activities.length > 0 ? (
                <div className="space-y-2">
                  {recent_activities.slice(0, 4).map(activity => (
                    <div key={activity.id} className="flex items-center text-sm bg-white px-2 py-1 rounded">
                      <span className="font-medium">
                        {(() => {
                          const display = getActivityDisplay(activity.activity_type);
                          return `${display.emoji} ${display.name}`;
                        })()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No recent care activities</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {plant.notes && (
            <div className={`mb-6 p-4 bg-yellow-50 rounded-lg ${
              bulk_care_mode && !is_selected ? 'opacity-70' : ''
            }`}>
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 italic">{plant.notes}</p>
            </div>
          )}

          {/* Quick Care Actions - Hide in bulk mode */}
          {!bulk_care_mode && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Quick Care Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'watering');
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  💧 Water
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'fertilizing');
                  }}
                  className="bg-green-100 hover:bg-green-200 text-green-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  🌱 Fertilize
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'pest-control');
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  🐛 Pest Control
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'repotting');
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  🏺 Repot
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'structural-work');
                  }}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center md:col-span-2"
                >
                  ✂️ Structural Work
                </button>
              </div>
            </div>
          )}

          {/* Management Actions - Hide completely in bulk mode */}
          {!bulk_care_mode && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-700 mb-3">Plant Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onViewPlant(plant.id);
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  View Full Details
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onStartEdit(plant);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Edit Plant
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this plant?')) {
                      onClose();
                      onDeletePlant(plant.id);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Delete Plant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlantCardModal;