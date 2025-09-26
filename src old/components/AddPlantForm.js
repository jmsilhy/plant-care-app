import React from 'react';

function AddPlantForm({ 
  newPlant, 
  onInputChange, 
  onSubmit, 
  onCancel,
  onOpenPhotoUpload 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Plant</h2>

      <div className="flex justify-between items-center mb-4"> 
  <h2 className="text-xl font-bold text-gray-800">Add New Plant</h2>
  <button
    type="button"
    onClick={() => onOpenPhotoUpload && onOpenPhotoUpload()}
    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg transition-colors"
  >
    Add Photos
  </button>
</div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plant Name *
          </label>
          <input
            type="text"
            name="name"
            value={newPlant.name}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="My Beautiful Jade Plant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species
          </label>
          <select
            name="species"
            value={newPlant.species}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Portulacaria Afra">Portulacaria Afra (Elephant Bush)</option>
            <option value="Portulacaria Afra Variegata">Portulacaria Afra Variegata</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Acquisition Date
          </label>
          <input
            type="date"
            name="acquisitionDate"
            value={newPlant.acquisitionDate}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            type="text"
            name="source"
            value={newPlant.source}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Local nursery, Online store, Friend, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={newPlant.price}
            onChange={onInputChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="12.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={newPlant.notes}
            onChange={onInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Initial condition, size, special notes..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Add Plant
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPlantForm;