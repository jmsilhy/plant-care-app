import React, { useState } from 'react';
import ResponsivePlantCard from './components/ResponsivePlantCard'; // Updated import
import AddPlantForm from './components/AddPlantForm';
import EditPlantForm from './components/EditPlantForm';
import CareTimeline from './components/CareTimeline';
import BulkCarePanel from './components/BulkCarePanel';
import PlantDetailView from './components/PlantDetailView';
import { useCareActivities } from './hooks/useCareActivities';
import { useBulkCare } from './hooks/useBulkCare';
import PhotoUpload from './components/PhotoUpload';
import PhotoGallery from './components/PhotoGallery';
import { useSupabasePlants } from './hooks/useSupabasePlants';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';

function PlantManager() {

   // Add this temporary debug block at the very top
  const { user, profile, supabase } = useAuth();
  
  useEffect(() => {
    const debugAuth = async () => {
      console.log('=== DEBUGGING AUTH STATE ===');
      console.log('User from hook:', user?.email);
      
      if (supabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Direct session check:', session?.user?.email, 'Error:', error);
        
        // Also check if we can query the database directly
        if (session?.user) {
          console.log('Testing direct plant query...');
          try {
            const { data, error } = await supabase
              .from('plants')
              .select('id, name')
              .eq('user_id', session.user.id)
              .limit(1);
            console.log('Direct query result:', data, 'Error:', error);
          } catch (err) {
            console.log('Direct query failed:', err);
          }
        }
      }
    };
    
    debugAuth();
  }, [user, supabase]);

  // ... rest of your component

  // Use custom hooks for business logic
  const { user, profile, supabase } = useAuth();
const { plants, addPlant, updatePlant, deletePlant, addPhotoToPlant, setCoverPhoto, updatePhotoOrder, deletePhotoFromPlant, fetchPlants, loading } = useSupabasePlants(user, supabase);
  const [forceShowAuth, setForceShowAuth] = useState(false);

 const shouldShowAuthModal = !user || forceShowAuth;

// Add this line to see your login status  
// console.log('Login status - User:', user?.email, 'Profile:', profile);
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

  // Photo upload state
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoUploadPlantId, setPhotoUploadPlantId] = useState(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [galleryPlantId, setGalleryPlantId] = useState(null);

  // Photo upload handlers
  const handleOpenPhotoUpload = (plantId) => {
    setPhotoUploadPlantId(plantId);
    setShowPhotoUpload(true);
  };

  const handlePhotoUpload = async (plantId, photoData) => {
    await addPhotoToPlant(plantId, photoData);

    if (editingPlant === plantId) {
      const updatedPlant = plants.find(p => p.id === plantId);
      if (updatedPlant) {
        setEditPlantData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), {
            ...photoData,
            id: Date.now() + Math.random(),
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

  // Photo gallery handlers
  const handleOpenPhotoGallery = (plantId) => {
    setGalleryPlantId(plantId);
    setShowPhotoGallery(true);
  };

  const handleClosePhotoGallery = () => {
    setShowPhotoGallery(false);
    setGalleryPlantId(null);
  };

  const handleDeletePhoto = (plantId, photoId) => {
    deletePhotoFromPlant(plantId, photoId);
  };

  const handleSetCoverPhoto = (plantId, photoId) => {
    setCoverPhoto(plantId, photoId);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlant(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleDeletePlant = async (plantId) => {
    try {
      await deletePlant(plantId);
    } catch (error) {
      alert('Error deleting plant: ' + error.message);
    }
  };

  const handleStartEdit = (plant) => {
    setEditingPlant(plant.id);
    setEditPlantData({
      name: plant.name,
      species: plant.species,
      acquisitionDate: plant.acquisitionDate,
      source: plant.source || '',
      price: plant.price || '',
      notes: plant.notes || '',
      photos: plant.photos || [],
      coverPhotoId: plant.coverPhotoId,
      id: plant.id
    });
    setShowAddForm(false);
    setViewingPlantId(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'photos') {
      setEditPlantData(prev => ({
        ...prev,
        [name]: value
      }));
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
      await fetchPlants();
      
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

  const handleCancelEdit = () => {
    setEditingPlant(null);
    setEditPlantData({
      name: '',
      species: 'Portulacaria Afra',
      acquisitionDate: '',
      source: '',
      price: '',
      notes: '',
      photos: [],
      coverPhotoId: null,
      id: null
    });
  };

  const handleDeletePhotoFromEdit = async (plantId, photoId) => {
    try {
      await deletePhotoFromPlant(plantId, photoId);
      
      setEditPlantData(prev => ({
        ...prev,
        photos: prev.photos.filter(photo => photo.id !== photoId),
        coverPhotoId: prev.coverPhotoId === photoId ? null : prev.coverPhotoId
      }));
    } catch (error) {
      alert('Error deleting photo: ' + error.message);
    }
  };

  const handleSetCoverPhotoFromEdit = async (plantId, photoId) => {
    try {
      await setCoverPhoto(plantId, photoId);
      
      setEditPlantData(prev => ({
        ...prev,
        coverPhotoId: photoId
      }));
    } catch (error) {
      alert('Error setting cover photo: ' + error.message);
    }
  };

  const handleViewPlant = (plantId) => {
    setViewingPlantId(plantId);
    setShowAddForm(false);
    setShowTimeline(false);
  };

  const handleBackToCollection = () => {
    setViewingPlantId(null);
  };

  const handleLogCareWithAlert = (plantId, activityType) => {
    logCareActivity(plantId, activityType, plants);
    const plantName = plants.find(p => p.id === plantId)?.name || 'plant';
    alert(`${activityType.replace('-', ' ')} logged for ${plantName}!`);
  };

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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <AuthModal 
        isOpen={shouldShowAuthModal}
        onClose={() => setForceShowAuth(false)}
      />
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
        <>
          {/* Header */}
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
          
          {/* Stats */}
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

          {/* Add Plant Form */}
          {showAddForm && (
            <AddPlantForm
              newPlant={newPlant}
              onInputChange={handleInputChange}
              onSubmit={handleAddPlant}
              onCancel={handleCancelAddPlant}
              onOpenPhotoUpload={() => {
                alert('Please create the plant first, then add photos from the plant card.');
              }}
            />
          )}

          {/* Edit Plant Form */}
          {editingPlant && (
            <EditPlantForm
              editPlantData={editPlantData}
              onInputChange={handleEditInputChange}
              onSubmit={handleUpdatePlant}
              onCancel={handleCancelEdit}
              onOpenPhotoUpload={() => handleOpenPhotoUpload(editingPlant)}
              onDeletePhoto={handleDeletePhotoFromEdit}
              onSetCoverPhoto={handleSetCoverPhotoFromEdit}
              onUpdatePhotoOrder={updatePhotoOrder}
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

          {/* Expandable Plant Cards Grid */}
          {plants.length > 0 ? (
            <>
              {/* Instructions for mobile/tablet users */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg xl:hidden">
                <p className="text-sm text-green-700 text-center">
                  <span className="font-medium">💡 Tap any card</span> to <span className="hidden md:inline">open details modal</span><span className="md:hidden">expand and see details, care actions & management options</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {plants.map(plant => (
                  <ResponsivePlantCard
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No plants in your collection yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🌱 Add Your First Plant
              </button>
            </div>
          )}
        </>
      )}
    </div>
    
  );
}

export default PlantManager;