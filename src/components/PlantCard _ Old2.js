import React from 'react';
import { getActivityDisplay, formatPrice } from '../utils/careUtils';

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
  return (
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

      {/* Cover Photo Display */}
      {plant.photos && plant.photos.length > 0 && (
        <div className="mb-3">
          {(() => {
            // console.log('Plant photos structure:', plant.photos); //added this for testing
            const cover_photo = plant.photos.find(p => p.id === plant.cover_photo_id) || plant.photos[0];
            // console.log('Cover photo:', cover_photo); // Add this line
            return (
              <img
                src={cover_photo.url}
                alt={cover_photo.caption || plant.name}
                className={`w-full h-32 object-cover rounded transition-all ${
                  bulk_care_mode && !is_selected ? 'opacity-60' : ''
                }`}
              />
            );
          })()}
          <p className={`text-xs mt-1 ${
            bulk_care_mode && !is_selected ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {plant.photos.length} photo{plant.photos.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

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

      {/* Plant Management Buttons - 🎯 HIDE COMPLETELY IN BULK MODE */}
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
  );
}

export default PlantCard;