import React from 'react';
import { formatCareDate, getActivityDisplay } from '../utils/careUtils';

function CareTimeline({ activities, plants }) {
  // Get all activities sorted by most recent with plant names
  const activitiesWithPlantNames = activities
  .map(activity => ({
    ...activity,
    plantName: activity.plantName || 'Unknown Plant'
  }))
  .sort((a, b) => new Date(b.date) - new Date(a.date));
    
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Care Activities Timeline</h2>
      {activitiesWithPlantNames.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No care activities logged yet. Start caring for your plants!</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activitiesWithPlantNames.map(activity => {
            const display = getActivityDisplay(activity.activityType);
            return (
              <div key={activity.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{display.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{display.name}</p>
                    <p className="text-sm text-gray-600">{activity.plantName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {formatCareDate(activity.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
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