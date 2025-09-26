import React from 'react';
import { formatCareDate, getActivityDisplay, formatPrice } from '../utils/careUtils';

function PlantDetailView({ 
  plant, 
  plantActivities, 
  onBackToCollection, 
  onStartEdit, 
  onLogCare,
  // REMOVED: onOpenPhotoUpload, onSetCoverPhoto, onDeletePhoto (not needed in view mode)
}) {
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

  return (
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
              <span className="font-semibold">Acquired:</span> {plant.acquisitionDate}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Source:</span> {plant.source}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Price:</span> {formatPrice(plant.price)}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Total Care Activities:</span> {plantActivities.length}
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

      {/* READ-ONLY Photo Gallery Section */}
      {plant.photos && plant.photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Plant Photos ({plant.photos.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
            {plant.photos.map(photo => (
              <div 
                key={photo.id} 
                className={`border-2 rounded-lg p-3 ${
                  photo.id === plant.coverPhotoId 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Plant photo'}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  {/* KEPT: Cover photo indicator (read-only) */}
                  {photo.id === plant.coverPhotoId && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
                
                {photo.caption && (
                  <p className="text-sm text-gray-700 mb-2">{photo.caption}</p>
                )}
                
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
                
                {/* REMOVED: All photo management buttons */}
                {/* This section is now purely for viewing */}
              </div>
            ))}
          </div>
          {/* ADDED: Helpful message directing users to edit mode */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 To manage photos (add, delete, reorder, or set cover), click the "Edit Plant" button above.
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
        {plantActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No care activities logged yet.</p>
            <p className="text-sm text-gray-400">Use the Quick Care Actions above to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plantActivities.map(activity => {
              const display = getActivityDisplay(activity.activityType);
              return (
                <div key={activity.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{display.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{display.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {formatCareDate(activity.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantDetailView;