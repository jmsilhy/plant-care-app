import React from 'react';

function EditPlantForm({ 
  editPlantData, 
  onInputChange, 
  onSubmit, 
  onCancel,
  onOpenPhotoUpload 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-yellow-500">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Plant</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>

<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold text-gray-800">Edit Plant</h2>
  <button
    type="button"
    onClick={() => onOpenPhotoUpload && onOpenPhotoUpload()}
    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg transition-colors"
  >
    Add Photos
  </button>
</div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plant Name *
          </label>
          <input
            type="text"
            name="name"
            value={editPlantData.name}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species
          </label>
          <select
            name="species"
            value={editPlantData.species}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
            value={editPlantData.acquisitionDate}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            type="text"
            name="source"
            value={editPlantData.source}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={editPlantData.price}
            onChange={onInputChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={editPlantData.notes}
            onChange={onInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Update Plant
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

export default EditPlantForm;