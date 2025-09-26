import React from 'react';
import { getActivityDisplay, formatPrice } from '../utils/careUtils';

function PlantCard({ 
  plant, 
  bulkCareMode, 
  isSelected, 
  onToggleSelect, 
  onViewPlant, 
  onStartEdit, 
  onDeletePlant, 
  onLogCare,
  onOpenPhotoUpload,
  onOpenPhotoGallery,  
  recentActivities 
}) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all ${
        bulkCareMode && isSelected
          ? 'border-purple-500 bg-purple-50'
          : 'border-green-500'
      }`}
    >
      {/* Bulk Selection Checkbox */}
      {bulkCareMode && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id={`select-${plant.id}`}
            checked={isSelected}
            onChange={onToggleSelect}
            className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
          <label 
            htmlFor={`select-${plant.id}`}
            className="text-sm font-medium text-purple-700 cursor-pointer"
          >
            Select for bulk actions
          </label>
        </div>
      )}

          <h3 className="text-xl font-bold text-gray-800 mb-2">
  {plant.name}
</h3>

{/* Cover Photo Display */}
{plant.photos && plant.photos.length > 0 && (
  <div className="mb-3">
    {(() => {
      const coverPhoto = plant.photos.find(p => p.id === plant.coverPhotoId) || plant.photos[0];
      return (
        <img
          src={coverPhoto.url}
          alt={coverPhoto.caption || plant.name}
          className="w-full h-32 object-cover rounded"
        />
      );
    })()}
    <p className="text-xs text-gray-500 mt-1">
      {plant.photos.length} photo{plant.photos.length !== 1 ? 's' : ''}
    </p>
  </div>
)}

      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Species:</span> {plant.species}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Acquired:</span> {plant.acquisitionDate}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Source:</span> {plant.source}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <span className="font-semibold">Price:</span> {formatPrice(plant.price)}
      </p>
      <p className="text-xs text-gray-500 italic mb-3">
        {plant.notes}
      </p>

      {/* Care Activity Buttons - Hide in bulk mode */}
      {!bulkCareMode && (
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
        {recentActivities.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-600 mb-1">Recent Care:</p>
            <div className="space-y-1">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                  <span className="font-medium text-gray-700">
  {(() => {
    const display = getActivityDisplay(activity.activityType);
    return `${display.emoji} ${display.name}`;
  })()}
</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Plant Management Buttons */}
<div className="flex flex-wrap gap-1">
  <button
    onClick={() => onViewPlant(plant.id)}
    className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
  >
    View
  </button>

  <button
  onClick={() => onOpenPhotoUpload(plant.id)}
  className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
>
   Photos
  </button>
  
  <button
    onClick={() => onStartEdit(plant)}
    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
  >
    
    Edit
  </button>
  <button
    onClick={() => onDeletePlant(plant.id)}
    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors flex-1 min-w-0"
  >
    Delete
  </button>
</div>
    </div>
  );
}

export default PlantCard;