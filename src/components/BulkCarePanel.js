import React from 'react';

function BulkCarePanel({ 
  selected_plant_ids, 
  onSelectAll, 
  onClearAll, 
  onBulkCare 
}) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-purple-800">
          Bulk Care Mode - {selected_plant_ids.length} plant(s) selected
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onSelectAll}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm font-bold py-1 px-3 rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-1 px-3 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
      
      {selected_plant_ids.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => onBulkCare('watering')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base"
          >
            Water Selected
          </button>
          <button
            onClick={() => onBulkCare('fertilizing')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base"
          >
            Fertilize Selected
          </button>
          <button
            onClick={() => onBulkCare('pest-control')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base"
          >
            Pest Control Selected
          </button>
        </div>
      )}
    </div>
  );
}

export default BulkCarePanel;