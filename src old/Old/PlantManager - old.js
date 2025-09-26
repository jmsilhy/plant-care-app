import React, { useState } from 'react';
// Remove the unused utility imports since they're now used in individual components - > import { formatCareDate, getActivityDisplay } from './utils/careUtils';
import PlantCard from './components/PlantCard';
import AddPlantForm from './components/AddPlantForm';
import EditPlantForm from './components/EditPlantForm';
import CareTimeline from './components/CareTimeline';
import BulkCarePanel from './components/BulkCarePanel';
import PlantDetailView from './components/PlantDetailView';
// import { usePlants } from './hooks/usePlants'; 
import { useCareActivities } from './hooks/useCareActivities';
import { useBulkCare } from './hooks/useBulkCare';
import PhotoUpload from './components/PhotoUpload';
import PhotoGallery from './components/PhotoGallery';
import { useSupabasePlants } from './hooks/useSupabasePlants';


function PlantManager() {
  // Use custom hooks for business logic
  const { plants, addPlant, updatePlant, deletePlant, addPhotoToPlant, setCoverPhoto, updatePhotoOrder,deletePhotoFromPlant, fetchPlants, loading } = useSupabasePlants();
// Temporarily comment out the old hook
// const { plants, addPlant, updatePlant, deletePlant, addPhotoToPlant, deletePhotoFromPlant, setCoverPhoto } = usePlants();
    const { 
    careActivities, 
    logCareActivity, 
    getRecentCareActivities, 
    getPlantActivities
  } = useCareActivities(plants);

  const { 
    bulkCareMode, 
    selectedPlantIds, 
    toggleBulkCare, 
    toggleSelectPlant, 
    selectAllPlants, 
    clearSelections, 
    applyBulkCare 
  } = useBulkCare(plants, logCareActivity);

  // UI state (forms and views)
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [viewingPlantId, setViewingPlantId] = useState(null);
  
  // Form data state
  const [newPlant, setNewPlant] = useState({
    name: '',
    species: 'Portulacaria Afra',
    acquisitionDate: '',
    source: '',
    price: '',
    notes: ''
  });
  
  const [editingPlant, setEditingPlant] = useState(null);
  const [editPlantData, setEditPlantData] = useState({
    name: '',
    species: 'Portulacaria Afra',
    acquisitionDate: '',
    source: '',
    price: '',
    notes: ''
  });

  // Add photo upload state HERE
const [showPhotoUpload, setShowPhotoUpload] = useState(false);
const [photoUploadPlantId, setPhotoUploadPlantId] = useState(null);
const [showPhotoGallery, setShowPhotoGallery] = useState(false); //added later
const [galleryPlantId, setGalleryPlantId] = useState(null); //added later

// Add photo upload handlers
const handleOpenPhotoUpload = (plantId) => {
  setPhotoUploadPlantId(plantId);
  setShowPhotoUpload(true);
};

const handlePhotoUpload = async (plantId, photoData) => {
  await addPhotoToPlant(plantId, photoData);

  // If we're currently editing this plant, update the edit form data too
  if (editingPlant === plantId) {
    const updatedPlant = plants.find(p => p.id === plantId);
    if (updatedPlant) {
      setEditPlantData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), {
          ...photoData,
          id: Date.now() + Math.random(), // Generate ID for new photo
          uploadDate: new Date().toISOString()
        }]
      }));
    }
  }
};

const handleClosePhotoUpload = () => {
  setShowPhotoUpload(false);
  setPhotoUploadPlantId(null);
};

// Add photo gallery handlers
const handleOpenPhotoGallery = (plantId) => {
  setGalleryPlantId(plantId);
  setShowPhotoGallery(true);
};

const handleClosePhotoGallery = () => {
  setShowPhotoGallery(false);
  setGalleryPlantId(null);
};

const handleDeletePhoto = (plantId, photoId) => {
  deletePhotoFromPlant(plantId, photoId); // added this back Sat night
};

const handleSetCoverPhoto = (plantId, photoId) => {
  // setCoverPhoto(plantId, photoId);
};

// State for care activities
// removed and moved to hook -> const [careActivities, setCareActivities] = useState([]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // State to show/hide the activity timeline
// removed by Claude: const [showTimeline, setShowTimeline] = useState(false);

// State for plant detail view
// Removed by Claude: const [viewingPlantId, setViewingPlantId] = useState(null); // null means not viewing any plant

// State for bulk care actions
// Removed and included in hook-> const [bulkCareMode, setBulkCareMode] = useState(false);
// Removed and included in hook-> const [selectedPlantIds, setSelectedPlantIds] = useState([]); // Array of selected plant IDs

  const handleAddPlant = async (e) => {
  e.preventDefault();
  try {
    await addPlant(newPlant);
    setNewPlant({
      name: '',
      species: 'Portulacaria Afra',
      acquisitionDate: '',
      source: '',
      price: '',
      notes: ''
    });
    setShowAddForm(false);
  } catch (error) {
    alert('Error adding plant: ' + error.message);
  }
};

// Function to delete a plant
const handleDeletePlant = async (plantId) => {
  if (window.confirm('Are you sure you want to delete this plant?')) {
    try {
      await deletePlant(plantId);
    } catch (error) {
      alert('Error deleting plant: ' + error.message);
    }
  }
};

// Function to start editing a plant
// 1. UPDATE: handleStartEdit function to include photos
const handleStartEdit = (plant) => {
  setEditingPlant(plant.id);
  setEditPlantData({
    name: plant.name,
    species: plant.species,
    acquisitionDate: plant.acquisitionDate,
    source: plant.source || '',
    price: plant.price || '',
    notes: plant.notes || '',
    photos: plant.photos || [],           // 🎯 ADDED THIS
    coverPhotoId: plant.coverPhotoId,     // 🎯 ADDED THIS
    id: plant.id                          // 🎯 ADDED THIS (needed for photo management)
  });
  setShowAddForm(false);
  setViewingPlantId(null);
};

// Function to handle edit form input changes
// 2. UPDATE: handleEditInputChange to handle photos array updates
const handleEditInputChange = (e) => {
  const { name, value } = e.target;
  
  // Handle photos array update specially
  if (name === 'photos') {
    setEditPlantData(prev => ({
      ...prev,
      [name]: value
    }));
    // Also update the actual plant immediately for drag-and-drop
    updatePlant(editingPlant, { ...editPlantData, [name]: value });
    return;
  }
  
  setEditPlantData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleUpdatePlant = async (e) => {
  e.preventDefault();
  
  try {
    await updatePlant(editingPlant, editPlantData);
    await fetchPlants(); // added this code to try refreshing after updates.
    
    // Clear editing state
    setEditingPlant(null);
    setEditPlantData({
      name: '',
      species: 'Portulacaria Afra',
      acquisitionDate: '',
      source: '',
      price: '',
      notes: ''
    });
  } catch (error) {
    alert('Error updating plant: ' + error.message);
  }
};

// Function to cancel editing
// 3. UPDATE: handleCancelEdit to clear the new fields
const handleCancelEdit = () => {
  setEditingPlant(null);
  setEditPlantData({
    name: '',
    species: 'Portulacaria Afra',
    acquisitionDate: '',
    source: '',
    price: '',
    notes: '',
    photos: [],                 // 🎯 ADDED THIS
    coverPhotoId: null,         // 🎯 ADDED THIS  
    id: null                    // 🎯 ADDED THIS
  });
};

// 4. Delete from edit - updated  
const handleDeletePhotoFromEdit = async (plantId, photoId) => {
  // if (window.confirm('Are you sure you want to delete this photo?')) {
    try {
      // Call the Supabase deletion function
      await deletePhotoFromPlant(plantId, photoId);
      
      // Update the edit form data to reflect the change
      setEditPlantData(prev => ({
        ...prev,
        photos: prev.photos.filter(photo => photo.id !== photoId),
        coverPhotoId: prev.coverPhotoId === photoId ? null : prev.coverPhotoId
      }));
    } catch (error) {
      alert('Error deleting photo: ' + error.message);
    }
  // }
};

// 5. NEW: Add function to handle setting cover photo from edit mode  
const handleSetCoverPhotoFromEdit = async (plantId, photoId) => {
  try {
    // Use the Supabase function instead of just local state
    await setCoverPhoto(plantId, photoId);
    
    // Update the edit form data to reflect the change
    setEditPlantData(prev => ({
      ...prev,
      coverPhotoId: photoId
    }));
  } catch (error) {
    alert('Error setting cover photo: ' + error.message);
  }
};

// Function to start viewing a plant's details
const handleViewPlant = (plantId) => {
  setViewingPlantId(plantId);
  setShowAddForm(false); // Hide add form if open
  setShowTimeline(false); // Hide timeline if open
};

// Function to go back to collection view
const handleBackToCollection = () => {
  setViewingPlantId(null);
};
const handleLogCareWithAlert = (plantId, activityType) => {
  logCareActivity(plantId, activityType, plants); //Added plants parameter here
  const plantName = plants.find(p => p.id === plantId)?.name || 'plant';
  alert(`${activityType.replace('-', ' ')} logged for ${plantName}!`);
};

// Function to cancel handler function?
const handleCancelAddPlant = () => {
  setShowAddForm(false);
  setNewPlant({
    name: '',
    species: 'Portulacaria Afra',
    acquisitionDate: '',
    source: '',
    price: '',
    notes: ''
  });
};

 return (
  <div className="max-w-4xl mx-auto p-6">
   {viewingPlantId ? (
  <PlantDetailView
    plant={plants.find(p => p.id === viewingPlantId)}
    plantActivities={getPlantActivities(viewingPlantId)}
    onBackToCollection={handleBackToCollection}
    onStartEdit={handleStartEdit}
    onLogCare={handleLogCareWithAlert}
    onOpenPhotoUpload={handleOpenPhotoUpload}
    onSetCoverPhoto={handleSetCoverPhoto}
    onDeletePhoto={handleDeletePhoto}
  />

) : (
  /* COLLECTION VIEW remains the same after getting this section out */

      /* COLLECTION VIEW - Your existing content stays exactly the same */
      <>
        {/* KEEP ALL YOUR EXISTING CONTENT EXACTLY AS IS FROM HERE... */}

    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
  <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-3 md:mb-0">
    🌿 My Plant Collection
  </h1>
  <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-end">
    {!bulkCareMode && (
      <>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
        >
          <span className="hidden sm:inline">{showTimeline ? 'Hide Timeline' : '📅 Care Timeline'}</span>
          <span className="sm:hidden">📅</span>
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
        >
          <span className="hidden sm:inline">{showAddForm ? 'Cancel' : '+ Add Plant'}</span>
          <span className="sm:hidden">+</span>
        </button>
      </>
    )}
    <button
      onClick={toggleBulkCare}
      className={`${bulkCareMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base`}
    >
      <span className="hidden sm:inline">{bulkCareMode ? 'Exit Bulk Mode' : '⚡ Bulk Care'}</span>
      <span className="sm:hidden">⚡</span>
    </button>
            
    </div>
</div>
      
      <div className="mb-6 flex space-x-6">
  <span className="text-lg font-semibold text-gray-700">
    Total Plants: {plants.length}
  </span>
  <span className="text-lg font-semibold text-blue-700">
    Total Care Activities: {careActivities.length}
  </span>
</div>

{/* Bulk Care Control Panel */}
{bulkCareMode && (
  <BulkCarePanel
    selectedPlantIds={selectedPlantIds}
    onSelectAll={selectAllPlants}
    onClearAll={clearSelections}
    onBulkCare={applyBulkCare}
  />
)}

{/* Care Activities Timeline */}
{showTimeline && (
  <CareTimeline activities={careActivities} plants={plants} />
)}

      {/* Add Plant Form - Only show when showAddForm is true */}
{showAddForm && (
  <AddPlantForm
    newPlant={newPlant}
    onInputChange={handleInputChange}
    onSubmit={handleAddPlant}
    onCancel={handleCancelAddPlant}
    onOpenPhotoUpload={() => {
      // We need to create a temporary plant ID for photos during creation
      alert('Please create the plant first, then add photos from the plant card.');
    }}
  />
)}

{/* Edit Plant Form - Only show when editingPlant is not null */}
{editingPlant && (
  <EditPlantForm
    editPlantData={editPlantData}
    onInputChange={handleEditInputChange}
    onSubmit={handleUpdatePlant}
    onCancel={handleCancelEdit}
    onOpenPhotoUpload={() => handleOpenPhotoUpload(editingPlant)}
    onDeletePhoto={handleDeletePhotoFromEdit}      // 🎯 CHANGED: Use new function
    onSetCoverPhoto={handleSetCoverPhotoFromEdit}  // 🎯 CHANGED: Use new function
    onUpdatePhotoOrder={updatePhotoOrder} // New function to drg and drop
  />
)}

{/* Photo Upload Modal */}
{showPhotoUpload && (
  <PhotoUpload
    plantId={photoUploadPlantId}
    onPhotoUpload={handlePhotoUpload}
    onClose={handleClosePhotoUpload}
  />
)}

{/* Photo Gallery Modal */}
{showPhotoGallery && (
  <div className="mb-6">
  <PhotoGallery
    plant={plants.find(p => p.id === galleryPlantId)}
    onSetCoverPhoto={handleSetCoverPhoto}
    onDeletePhoto={handleDeletePhoto}
    onClose={handleClosePhotoGallery}
  />
  </div>
)}

{/* Plant Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {plants.map(plant => (
    <PlantCard
      key={plant.id}
      plant={plant}
      bulkCareMode={bulkCareMode}
      isSelected={selectedPlantIds.includes(plant.id)}
      onToggleSelect={() => toggleSelectPlant(plant.id)}
      onViewPlant={handleViewPlant}
      onStartEdit={handleStartEdit}
      onDeletePlant={handleDeletePlant}
      onLogCare={handleLogCareWithAlert}
      onOpenPhotoUpload={handleOpenPhotoUpload}
      onOpenPhotoGallery={handleOpenPhotoGallery}
      recentActivities={getRecentCareActivities(plant.id)}
    />
  ))}
</div>
         
    </>
  )}
  </div>
 );
}
export default PlantManager;