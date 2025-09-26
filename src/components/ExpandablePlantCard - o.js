import React, { useState, useRef, useEffect } from 'react';
import { getActivityDisplay, formatPrice } from '../utils/careUtils';

function ExpandablePlantCard({ 
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
  const [is_expanded, setIsExpanded] = useState(false);
  const [is_animating, setIsAnimating] = useState(false);
  const card_ref = useRef(null);
  const expanded_content_ref = useRef(null);
  const timeout_ref = useRef(null);
  const scroll_start_ref = useRef(null);

  // Remove auto-collapse on scroll - it's too problematic with multiple cards
  // Only use click-outside to collapse for better UX

  // Handle click outside to collapse
  useEffect(() => {
    if (!is_expanded) return;

    const handleClickOutside = (event) => {
      if (card_ref.current && !card_ref.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    // Small delay to prevent immediate closing when expanding
    timeout_ref.current = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      if (timeout_ref.current) clearTimeout(timeout_ref.current);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [is_expanded]);

  const handleCardClick = (e) => {
    // Don't expand if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('label')) {
      return;
    }
    
    // Don't expand in bulk mode unless card is selected
    if (bulk_care_mode && !is_selected) {
      return;
    }

    setIsAnimating(true);
    setIsExpanded(!is_expanded);
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Get cover photo
  const getCoverPhoto = () => {
    if (!plant.photos || plant.photos.length === 0) return null;
    return plant.photos.find(p => p.id === plant.cover_photo_id) || plant.photos[0];
  };

  const cover_photo = getCoverPhoto();

  return (
    <div 
      ref={card_ref}
      className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-300 cursor-pointer overflow-hidden ${
        bulk_care_mode 
          ? is_selected
            ? 'border-purple-500 bg-purple-50 shadow-lg' 
            : 'border-gray-300 bg-gray-50 opacity-70 cursor-default'
          : 'border-green-500 hover:shadow-lg'
      } ${is_expanded ? 'shadow-xl scale-[1.02] z-10 relative' : ''} ${
        is_animating ? 'transition-transform' : ''
      }`}
      onClick={handleCardClick}
      style={{ 
        transformOrigin: 'center',
        minHeight: is_expanded ? 'auto' : '200px' 
      }}
    >
      {/* COMPACT VIEW - Always Visible */}
      <div className="p-4">
        {/* Bulk Selection Checkbox - Always at top if in bulk mode */}
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

        {/* Plant Name - Always visible */}
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-bold truncate ${
            bulk_care_mode 
              ? is_selected ? 'text-purple-800' : 'text-gray-500'
              : 'text-gray-800'
          }`}>
            {plant.name}
          </h3>
          
          {/* Expand/Collapse indicator */}
          {(!bulk_care_mode || is_selected) && (
            <div className={`transition-transform duration-200 text-gray-400 ${
              is_expanded ? 'rotate-180' : ''
            }`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Cover Photo - Always visible but smaller in compact view */}
        {cover_photo && (
          <div className={`mb-3 transition-all duration-300 ${
            is_expanded ? 'h-40' : 'h-24'
          }`}>
            <img
              src={cover_photo.url}
              alt={cover_photo.caption || plant.name}
              className={`w-full h-full object-cover rounded transition-all ${
                bulk_care_mode && !is_selected ? 'opacity-60' : ''
              }`}
            />
          </div>
        )}

        {/* Compact info hint - only visible when collapsed */}
        {!is_expanded && (
          <p className={`text-xs truncate ${
            bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {plant.species} • {plant.source}
            {(!bulk_care_mode || is_selected) && (
              <span className="float-right text-green-600 font-medium">
                Tap to expand
              </span>
            )}
          </p>
        )}
      </div>

      {/* EXPANDED CONTENT - Slides down when expanded */}
      <div 
        ref={expanded_content_ref}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          is_expanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          transitionProperty: 'max-height, opacity, padding',
        }}
      >
        <div className="px-4 pb-4 pt-0">
          {/* Detailed Plant Info */}
          <div className="space-y-2 mb-4">
            <p className={`text-sm ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-semibold">Species:</span> {plant.species}
            </p>
            <p className={`text-sm ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-semibold">Acquired:</span> {plant.acquisition_date}
            </p>
            <p className={`text-sm ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-semibold">Source:</span> {plant.source}
            </p>
            <p className={`text-sm ${
              bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-semibold">Price:</span> {formatPrice(plant.price)}
            </p>
            
            {/* Photo count */}
            {plant.photos && plant.photos.length > 0 && (
              <p className={`text-xs ${
                bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {plant.photos.length} photo{plant.photos.length !== 1 ? 's' : ''}
              </p>
            )}
            
            {/* Notes */}
            {plant.notes && (
              <p className={`text-xs italic ${
                bulk_care_mode && !is_selected ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {plant.notes}
              </p>
            )}
          </div>

          {/* Care Activity Buttons - Hide in bulk mode */}
          {!bulk_care_mode && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Quick Care Actions:</p>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'watering');
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold py-2 px-2 rounded transition-colors"
                >
                  💧 Water
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'fertilizing');
                  }}
                  className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-2 px-2 rounded transition-colors"
                >
                  🌱 Fertilize
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'pest-control');
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold py-2 px-2 rounded transition-colors"
                >
                  🐛 Pest Control
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'repotting');
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold py-2 px-2 rounded transition-colors"
                >
                  🏺 Repot
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogCare(plant.id, 'structural-work');
                  }}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold py-2 px-2 rounded transition-colors col-span-2"
                >
                  ✂️ Structural Work
                </button>
              </div>
            </div>
          )}

          {/* Recent Care History */}
          {recent_activities.length > 0 && (
            <div className="mb-4">
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
            </div>
          )}

          {/* Plant Management Buttons - Hide completely in bulk mode */}
          {!bulk_care_mode && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPlant(plant.id);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 px-3 rounded transition-colors flex-1 min-w-0"
              >
                View Details
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(plant);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded transition-colors flex-1 min-w-0"
              >
                Edit
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this plant?')) {
                    onDeletePlant(plant.id);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded transition-colors flex-1 min-w-0"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpandablePlantCard;