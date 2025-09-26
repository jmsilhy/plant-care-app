import { useState, useEffect } from 'react';
// import { useAuth } from './useAuth';

export function useSupabasePlants(user, supabase) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed in debugging. const { user, supabase } = useAuth();

  // Fetch plants for the current user only
  const fetchPlants = async () => {
    // Early return if we don't have what we need
    if (!user || !supabase) {
      setPlants([]);
      setLoading(false);
      return;
    }

    console.log('Fetching plants for user:', user.id);
    setLoading(true);

    console.log('About to query plants table...');

try {
  const { data: plantsData, error: plantsError } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  console.log('Plants query completed:', { 
    plantsData: plantsData?.length || 0, 
    plantsError,
    fullError: plantsError ? JSON.stringify(plantsError, null, 2) : null 
  });

  if (plantsError) {
    console.error('Supabase error details:', plantsError);
    throw plantsError;
  }

      console.log('Plants fetched:', plantsData?.length || 0);

      // Fetch all photos for the user's plants
      const plantIds = plantsData?.map(plant => plant.id) || [];
      
      let photosData = [];
      if (plantIds.length > 0) {
        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .in('plant_id', plantIds)
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });

        if (photosError) {
          console.error('Error fetching photos:', photosError);
          throw photosError;
        }
        photosData = photos || [];
      }

      // Combine plants with their photos
      const plantsWithPhotos = (plantsData || []).map(plant => ({
        ...plant,
        photos: photosData.filter(photo => photo.plant_id === plant.id)
      }));

      console.log('Setting plants:', plantsWithPhotos.length);
      setPlants(plantsWithPhotos);
    } catch (error) {
      console.error('Error in fetchPlants:', error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // Critical fix: Watch for BOTH user AND supabase client changes
  useEffect(() => {
    console.log('useSupabasePlants effect:', { 
      hasUser: !!user,
      userId: user?.id,
      hasSupabase: !!supabase,
      supabaseType: typeof supabase
    });
    
    fetchPlants();
  }, [user?.id, supabase]); // Watch BOTH user and supabase

  const addPlant = async (plantData) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to add plants');
    }

    console.log('Adding plant for user:', user.id, plantData);

    try {
      // Convert camelCase to database field names
      const dbPlantData = {
        name: plantData.name,
        species: plantData.species,
        acquisition_date: plantData.acquisitionDate,
        source: plantData.source,
        price: plantData.price,
        notes: plantData.notes,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('plants')
        .insert([dbPlantData])
        .select()
        .single();

      if (error) {
        console.error('Error adding plant:', error);
        throw error;
      }

      console.log('Plant added successfully:', data);

      // Add to local state
      setPlants(prev => [{ ...data, photos: [] }, ...prev]);
      return data;
    } catch (error) {
      console.error('Error in addPlant:', error);
      throw error;
    }
  };

  const updatePlant = async (plantId, updates) => {
    console.log('🔄 updatePlant called:', { plantId, updates });
  
  if (!user || !supabase) {
    console.log('❌ updatePlant: Missing user or supabase');
    throw new Error('Must be logged in to update plants');
  }

  try {
    console.log('🔄 Processing updates...');
    // Convert camelCase to database field names
    const dbUpdates = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.species !== undefined) dbUpdates.species = updates.species;
    if (updates.acquisitionDate !== undefined) dbUpdates.acquisition_date = updates.acquisitionDate;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.coverPhotoId !== undefined) dbUpdates.cover_photo_id = updates.coverPhotoId;

    console.log('🔄 Database updates:', dbUpdates);

    const { data, error } = await supabase
      .from('plants')
      .update(dbUpdates)
      .eq('id', plantId)
      .eq('user_id', user.id)
      .select()
      .single();

    console.log('🔄 Update result:', { data, error });
      
      return data;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  };

  const deletePlant = async (plantId) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to delete plants');
    }

    try {
      // Delete photos first
      const { error: photosError } = await supabase
        .from('photos')
        .delete()
        .eq('plant_id', plantId)
        .eq('user_id', user.id);

      if (photosError) throw photosError;

      // Delete care activities
      const { error: activitiesError } = await supabase
        .from('care_activities')
        .delete()
        .eq('plant_id', plantId)
        .eq('user_id', user.id);

      if (activitiesError) throw activitiesError;

      // Delete plant
      const { error: plantError } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', user.id);

      if (plantError) throw plantError;

      // Update local state
      setPlants(prev => prev.filter(plant => plant.id !== plantId));
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  };

  const addPhotoToPlant = async (plantId, photoData) => {
  console.log('📸 addPhotoToPlant called:', { plantId, photoData });
  
  if (!user || !supabase) {
    console.log('❌ addPhotoToPlant: Missing user or supabase');
    throw new Error('Must be logged in to add photos');
  }

  console.log('📸 About to insert photo with client type:', typeof supabase);
  console.log('📸 Supabase client details:', supabase?.constructor?.name);

  try {
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        url: photoData.url,
        caption: photoData.caption,
        plant_id: plantId,
        user_id: user.id,
        file_name: photoData.fileName,
        storage_path: photoData.fileName, 
      }])
      .select()
      .single();

    console.log('📸 Photo insert result:', { data, error });
      if (error) throw error;

      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId 
          ? { ...plant, photos: [...plant.photos, data] }
          : plant
      ));

console.log('📸 Photo added to local state successfully'); // Add this line

      return data;
    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  };

  const deletePhotoFromPlant = async (plantId, photoId) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to delete photos');
    }

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)
        .eq('plant_id', plantId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId 
          ? { ...plant, photos: plant.photos.filter(photo => photo.id !== photoId) }
          : plant
      ));
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  };

  const setCoverPhoto = async (plantId, photoId) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to set cover photo');
    }

    try {
      const { data, error } = await supabase
        .from('plants')
        .update({ cover_photo_id: photoId }) // make sure this matched DB
        .eq('id', plantId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId 
          ? { ...plant, cover_photo_id: photoId }
          : plant
      ));

            return data;
    } catch (error) {
      console.error('Error setting cover photo:', error);
      throw error;
    }
  };

  const testWhichColumnWorks = async (plantId, photoId) => {
  console.log('Testing which cover photo column is active...');
  
  try {
    // Test snake_case first
    console.log('Testing cover_photo_id (snake_case)...');
    const { data: snakeResult, error: snakeError } = await supabase
      .from('plants')
      .update({ cover_photo_id: photoId })
      .eq('id', plantId)
      .eq('user_id', user.id)
      .select('cover_photo_id, "coverPhotoId"')
      .single();
    
    console.log('Snake_case update result:', snakeResult);
    
    // Now check what's actually in the database
    const { data: checkResult } = await supabase
      .from('plants')
      .select('cover_photo_id, "coverPhotoId"')
      .eq('id', plantId)
      .single();
    
    console.log('Database state after snake_case update:', checkResult);
    
    return checkResult;
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

  const updatePhotoOrder = async (plantId, photosArray) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to update photo order');
    }

    try {
      // Update each photo's display order
      const updatePromises = photosArray.map((photo, index) =>
        supabase
          .from('photos')
          .update({ display_order: index })
          .eq('id', photo.id)
          .eq('user_id', user.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update some photo orders');
      }

      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId 
          ? { ...plant, photos: photosArray }
          : plant
      ));
    } catch (error) {
      console.error('Error updating photo order:', error);
      throw error;
    }
  };

  return {
    plants,
    addPlant,
    updatePlant,
    deletePlant,
    addPhotoToPlant,
    deletePhotoFromPlant,
    setCoverPhoto,
    updatePhotoOrder,
    fetchPlants,
    loading,
    user,
    testWhichColumnWorks
  };
}