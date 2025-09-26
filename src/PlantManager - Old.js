import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    console.log('🚀 PlantManager MOUNTED');
    return () => {
      console.log('💀 PlantManager UNMOUNTED');
    };
  }, []);
  // SINGLE declaration of auth variables
  const { user, profile, supabase, signIn, signUp, resetPassword } = useAuth();
  const { plants, addPlant, updatePlant, deletePlant, addPhotoToPlant, setCoverPhoto, testWhichColumnWorks, updatePhotoOrder, deletePhotoFromPlant, fetchPlants, loading } = useSupabasePlants(user, supabase);
  const [forceShowAuth, setForceShowAuth] = useState(false);

 useEffect(() => {
  const debugAuth = async () => {
    console.log('=== DEBUGGING AUTH STATE ===');
    console.log('User from hook:', user?.email);
    console.log('Supabase instance ID:', supabase?.constructor?.name, typeof supabase);
    
    // Add this condition to ensure we have both user and supabase
    if (supabase && user) {
      console.log('Running session and connection tests...');
      
      // Check session details
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        accessToken: session?.access_token ? 'present' : 'missing',
        sessionError
      });
      
      if (session?.user) {
        console.log('Testing basic Supabase connection...');
        try {
          const { data, error } = await supabase
            .from('plants')
            .select('count')
            .limit(1);
          console.log('Basic connection test result:', { data, error });
          
          if (!error) {
            console.log('Testing user-filtered query...');
            const { data: userData, error: userError } = await supabase
              .from('plants')
              .select('id, name')
              .eq('user_id', session.user.id)
              .limit(1);
            console.log('User-filtered query result:', { userData, userError });
          }
        } catch (err) {
          console.log('Connection test failed:', err);
        }
      }
    } else {
      console.log('Skipping tests - missing user or supabase:', { hasUser: !!user, hasSupabase: !!supabase });
    }
  };
  
  debugAuth();
}, [user, supabase]);

  const shouldShowAuthModal = !user || forceShowAuth;

  // Add this line to see your login status  
  console.log('Login status - User:', user?.email, 'Profile:', profile?.display_name, 'Plants count:', plants.length);

  const { 
    care_activities, 
    logCareActivity, 
    getRecentCareActivities, 
    getPlantActivities
  } = useCareActivities(plants, user, supabase);

  const { 
    bulk_care_mode, 
    selected_plant_ids, 
    toggleBulkCare, 
    toggleSelectPlant, 
    selectAllPlants, 
    clearSelections, 
    applyBulkCare 
  } = useBulkCare(plants, logCareActivity);

  // UI state (forms and views)
  const [show_add_form, setShowAddForm] = useState(false);
  const [show_timeline, setShowTimeline] = useState(false);
  const [viewing_plant_id, setViewingPlantId] = useState(null);
  
  // Form data state
  const [new_plant, setNewPlant] = useState({
    name: '',
    species: 'Portulacaria Afra',
    acquisition_date: '',
    source: '',
    price: '',
    notes: ''
  });
  
  const [editing_plant, setEditingPlant] = useState(null);
  const [edit_plant_data, setEditPlantData] = useState({
    name: '',
    species: 'Portulacaria Afra',
    acquisition_date: '',
    source: '',
    price: '',
    notes: ''
  });

  // Photo upload state
  const [show_photo_upload, setShowPhotoUpload] = useState(false);
  const [photo_upload_plant_id, setPhotoUploadPlantId] = useState(null);
  const [show_photo_gallery, setShowPhotoGallery] = useState(false);
  const [gallery_plant_id, setGalleryPlantId] = useState(null);

  // Photo upload handlers
  const handleOpenPhotoUpload = (plant_id) => {
    setPhotoUploadPlantId(plant_id);
    setShowPhotoUpload(true);
  };

  const handlePhotoUpload = async (plant_id, photo_data) => {
    await addPhotoToPlant(plant_id, photo_data);

    if (editing_plant === plant_id) {
      const updated_plant = plants.find(p => p.id === plant_id);
      if (updated_plant) {
        setEditPlantData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), {
            ...photo_data,
            id: Date.now() + Math.random(),
            upload_date: new Date().toISOString()
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
  const handleOpenPhotoGallery = (plant_id) => {
    setGalleryPlantId(plant_id);
    setShowPhotoGallery(true);
  };

  const handleClosePhotoGallery = () => {
    setShowPhotoGallery(false);
    setGalleryPlantId(null);
  };

  const handleDeletePhoto = (plant_id, photo_id) => {
    deletePhotoFromPlant(plant_id, photo_id);
  };

  const handleSetCoverPhoto = (plant_id, photo_id) => {
    setCoverPhoto(plant_id, photo_id);
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
      await addPlant(new_plant);
      setNewPlant({
        name: '',
        species: 'Portulacaria Afra',
        acquisition_date: '',
        source: '',
        price: '',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      alert('Error adding plant: ' + error.message);
    }
  };

  const handleDeletePlant = async (plant_id) => {
    try {
      await deletePlant(plant_id);
    } catch (error) {
      alert('Error deleting plant: ' + error.message);
    }
  };

  const handleStartEdit = (plant) => {
    setEditingPlant(plant.id);
    setEditPlantData({
      name: plant.name,
      species: plant.species,
      acquisition_date: plant.acquisition_date,
      source: plant.source || '',
      price: plant.price || '',
      notes: plant.notes || '',
      photos: plant.photos || [],
      cover_photo_id: plant.cover_photo_id,
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
      updatePlant(editing_plant, { ...edit_plant_data, [name]: value });
      return;
    }
    
    setEditPlantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePlant = async (e) => {
    e.preventDefault();
    console.log('🔍 handleUpdatePlant called:', edit_plant_data);

    try {
      await updatePlant(editing_plant, edit_plant_data);
      await fetchPlants();
      
      setEditingPlant(null);
      setEditPlantData({
        name: '',
        species: 'Portulacaria Afra',
        acquisition_date: '',
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
      acquisition_date: '',
      source: '',
      price: '',
      notes: '',
      photos: [],
      cover_photo_id: null,
      id: null
    });
  };

  const handleDeletePhotoFromEdit = async (plant_id, photo_id) => {
    try {
      await deletePhotoFromPlant(plant_id, photo_id);
      
      setEditPlantData(prev => ({
        ...prev,
        photos: prev.photos.filter(photo => photo.id !== photo_id),
        cover_photo_id: prev.cover_photo_id === photo_id ? null : prev.cover_photo_id
      }));
    } catch (error) {
      alert('Error deleting photo: ' + error.message);
    }
  };

  const handleSetCoverPhotoFromEdit = async (plant_id, photo_id) => {
    try {
      await setCoverPhoto(plant_id, photo_id);
      
      setEditPlantData(prev => ({
        ...prev,
        cover_photo_id: photo_id
      }));
    } catch (error) {
      alert('Error setting cover photo: ' + error.message);
    }
  };

  const handleViewPlant = (plant_id) => {
    setViewingPlantId(plant_id);
    setShowAddForm(false);
    setShowTimeline(false);
  };

  const handleBackToCollection = () => {
    setViewingPlantId(null);
  };

  const handleLogCareWithAlert = (plant_id, activity_type) => {
    logCareActivity(plant_id, activity_type, plants);
    const plant_name = plants.find(p => p.id === plant_id)?.name || 'plant';
    alert(`${activity_type.replace('-', ' ')} logged for ${plant_name}!`);
  };

  const handleCancelAddPlant = () => {
    setShowAddForm(false);
    setNewPlant({
      name: '',
      species: 'Portulacaria Afra',
      acquisition_date: '',
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
        signIn={signIn}           // Pass as props
        signUp={signUp}           // Pass as props  
        resetPassword={resetPassword} // Pass as props
        user={user}               // Pass as props
      />
      {viewing_plant_id ? (
        <PlantDetailView
          plant={plants.find(p => p.id === viewing_plant_id)}
          plant_activities={getPlantActivities(viewing_plant_id)}
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
              {!bulk_care_mode && (
                <>
                  <button
                    onClick={() => setShowTimeline(!show_timeline)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">{show_timeline ? 'Hide Timeline' : '📅 Care Timeline'}</span>
                    <span className="sm:hidden">📅</span>
                  </button>
                  <button
                    onClick={() => setShowAddForm(!show_add_form)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">{show_add_form ? 'Cancel' : '+ Add Plant'}</span>
                    <span className="sm:hidden">+</span>
                  </button>
                  <button onClick={() => testWhichColumnWorks('some-plant-id', 'some-photo-id')}>
  Test Cover Photo Column
</button>
                </>
              )}
              <button
                onClick={toggleBulkCare}
                className={`${bulk_care_mode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base`}
              >
                <span className="hidden sm:inline">{bulk_care_mode ? 'Exit Bulk Mode' : '⚡ Bulk Care'}</span>
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
              Total Care Activities: {care_activities.length}
            </span>
          </div>

          {/* Bulk Care Control Panel */}
          {bulk_care_mode && (
            <BulkCarePanel
              selected_plant_ids={selected_plant_ids}
              onSelectAll={selectAllPlants}
              onClearAll={clearSelections}
              onBulkCare={applyBulkCare}
            />
          )}

          {/* Care Activities Timeline */}
          {show_timeline && (
            <CareTimeline activities={care_activities} plants={plants} />
          )}

          {/* Add Plant Form */}
          {show_add_form && (
            <AddPlantForm
              new_plant={new_plant}
              onInputChange={handleInputChange}
              onSubmit={handleAddPlant}
              onCancel={handleCancelAddPlant}
              onOpenPhotoUpload={() => {
                alert('Please create the plant first, then add photos from the plant card.');
              }}
            />
          )}

          {/* Edit Plant Form */}
          {editing_plant && (
            <EditPlantForm
              edit_plant_data={edit_plant_data}
              onInputChange={handleEditInputChange}
              onSubmit={handleUpdatePlant}
              onCancel={handleCancelEdit}
              onOpenPhotoUpload={() => handleOpenPhotoUpload(editing_plant)}
              onDeletePhoto={handleDeletePhotoFromEdit}
              onSetCoverPhoto={handleSetCoverPhotoFromEdit}
              onUpdatePhotoOrder={updatePhotoOrder}
            />
          )}

          {/* Photo Upload Modal */}
          {show_photo_upload && (
            <PhotoUpload
              plant_id={photo_upload_plant_id}
              onPhotoUpload={handlePhotoUpload}
              onClose={handleClosePhotoUpload}
            />
          )}

          {/* Photo Gallery Modal */}
          {show_photo_gallery && (
            <div className="mb-6">
              <PhotoGallery
                plant={plants.find(p => p.id === gallery_plant_id)}
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
                    bulk_care_mode={bulk_care_mode}
                    is_selected={selected_plant_ids.includes(plant.id)}
                    onToggleSelect={() => toggleSelectPlant(plant.id)}
                    onViewPlant={handleViewPlant}
                    onStartEdit={handleStartEdit}
                    onDeletePlant={handleDeletePlant}
                    onLogCare={handleLogCareWithAlert}
                    onOpenPhotoUpload={handleOpenPhotoUpload}
                    onOpenPhotoGallery={handleOpenPhotoGallery}
                    recent_activities={getRecentCareActivities(plant.id)}
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