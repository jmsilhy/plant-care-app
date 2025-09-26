import React, { useState } from 'react';
import PlantCardModal from './PlantCardModal';

function TabletPlantCard({ 
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
  const [is_modal_open, setIsModalOpen] = useState(false);

  const handleCardClick = (e) => {
    // Don't open modal if clicking on interactive elements
    if (e.target.closest('input') || e.target.closest('label')) {
      return;
    }
    
    // Don't open modal in bulk mode unless card is selected
    if (bulk_care_mode && !is_selected) {
      return;
    }

    setIsModalOpen(true);
  };

  // Get cover photo
  const getCoverPhoto = () => {
    if (!plant.photos || plant.photos.length === 0) return null;
    return plant.photos.find(p => p.id === plant.cover_photo_id) || plant.photos[0];
  };

  const cover_photo = getCoverPhoto();

  return (
    <>
      {/* Compact Card */}
      <div 
        className={`bg-white rounded-lg shadow-md border-l-4 transition-all cursor-pointer hover:shadow-lg ${
          bulk_care_mode 
            ? is_selected
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-300 bg-gray-50 opacity-70 cursor-default'
            : 'border-green-500'
        }`}
        onClick={handleCardClick}
      >
        <div className="p-4">
          {/* Bulk Selection Checkbox */}
          {bulk_care_mode && (
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id={`select-${plant.id}`}
                checked={is_selected}
                onChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                className="mr-2 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <label 
                htmlFor={`select-${plant.id}`}
                className={`text-sm font-medium cursor-pointer ${
                  is_selected ? 'text-purple-700 font-bold' : 'text-gray-600'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {is_selected ? 'Selected for bulk actions' : 'Click to select'}
              </label>
            </div>
          )}

          {/* Plant Name */}
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-bold truncate ${
              bulk_care_mode 
                ? is_selected ? 'text-purple-800' : 'text-gray-500'
                : 'text-gray-800'
            }`}>
              {plant.name}
            </h3>
            
            {/* Tap indicator */}
            {(!bulk_care_mode || is_selected) && (
              <div className="text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Cover Photo */}
          {cover_photo && (
            <div className="mb-3">
              <img
                src={cover_photo.url}
                alt={cover_photo.caption || plant.name}
                className={`w-full h-32 object-cover rounded transition-all ${
                  bulk_care_mode && !is_selected ? 'opacity-60' : ''
                }`}
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-1">
            <p className={`text-sm truncate ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-medium">Species:</span> {plant.species}
            </p>
            <p className={`text-sm truncate ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-medium">Source:</span> {plant.source}
            </p>
            
            {/* Recent activity indicator */}
            {recent_activities.length > 0 && (
              <p className={`text-xs ${
                bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-green-600'
              }`}>
                Last care: {recent_activities.length} recent activit{recent_activities.length === 1 ? 'y' : 'ies'}
              </p>
            )}
          </div>

          {/* Tap hint */}
          {(!bulk_care_mode || is_selected) && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-center text-green-600 font-medium">
                Tap to view details & actions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <PlantCardModal
        plant={plant}
        isOpen={is_modal_open}
        onClose={() => setIsModalOpen(false)}
        bulk_care_mode={bulk_care_mode}
        is_selected={is_selected}
        onToggleSelect={onToggleSelect}
        onViewPlant={onViewPlant}
        onStartEdit={onStartEdit}
        onDeletePlant={onDeletePlant}
        onLogCare={onLogCare}
        onOpenPhotoUpload={onOpenPhotoUpload}
        onOpenPhotoGallery={onOpenPhotoGallery}
        recent_activities={recent_activities}
      />
    </>
  );
}

export default TabletPlantCard;