import React from 'react';
import { formatCareDate, getActivityDisplay } from '../utils/careUtils';

function CareTimeline({ activities, plants, onDeleteActivity }) {
  // Get all activities sorted by most recent with plant names
  const activities_with_plant_names = activities
  .map(activity => ({
    ...activity,
    plant_name: activity.plant_name || 'Unknown Plant'
  }))
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleDeleteActivity = (activity) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this activity?\n\n"${getActivityDisplay(activity.activity_type).name}" for ${activity.plant_name}\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      onDeleteActivity(activity.id);
    }
  };
    
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Care Activities Timeline</h2>
      {activities_with_plant_names.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No care activities logged yet. Start caring for your plants!</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities_with_plant_names.map(activity => {
            const display = getActivityDisplay(activity.activity_type);
            return (
              <div key={activity.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{display.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{display.name}</p>
                    <p className="text-sm text-gray-600">{activity.plant_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {formatCareDate(activity.created_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Delete button - only visible on hover */}
                  <button
                    onClick={() => handleDeleteActivity(activity)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-all duration-200"
                    title="Delete this activity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CareTimeline;