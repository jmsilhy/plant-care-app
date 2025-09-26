import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useSupabasePlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, supabase, loading: authLoading } = useAuth(); // Get supabase client from useAuth

  // Fetch plants for the current user only
  const fetchPlants = async () => {
    // Don't fetch if auth is still loading or user is null
    if (authLoading || !user) {
      console.log('Skipping plant fetch - auth loading or no user:', { authLoading, hasUser: !!user });
      setPlants([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching plants for user:', user.id);
      setLoading(true);
      
      // Fetch plants with photos for the current user
      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (plantsError) {
        console.error('Error fetching plants:', plantsError);
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

      console.log('Final plants with photos:', plantsWithPhotos.length);
      setPlants(plantsWithPhotos);
    } catch (error) {
      console.error('Error in fetchPlants:', error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plants when user changes or auth loading completes
  useEffect(() => {
    console.log('useSupabasePlants effect triggered:', { 
      authLoading, 
      userId: user?.id,
      hasSupabase: !!supabase 
    });
    fetchPlants();
  }, [user?.id, authLoading]); // Re-fetch when user changes or auth loading completes

  const addPlant = async (plantData) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to add plants');
    }

    console.log('Adding plant for user:', user.id, plantData);

    try {
      const { data, error } = await supabase
        .from('plants')
        .insert([{
          ...plantData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
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
    if (!user || !supabase) {
      throw new Error('Must be logged in to update plants');
    }

    try {
      const { data, error } = await supabase
        .from('plants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', plantId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId 
          ? { ...plant, ...data, photos: plant.photos } 
          : plant
      ));
      
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
    if (!user || !supabase) {
      throw new Error('Must be logged in to add photos');
    }

    try {
      // Verify plant belongs to user first
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .select('id')
        .eq('id', plantId)
        .eq('user_id', user.id)
        .single();

      if (plantError || !plant) {
        throw new Error('Plant not found or access denied');
      }

      const { data, error } = await supabase
        .from('photos')
        .insert([{
          ...photoData,
          plant_id: plantId,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId 
          ? { ...plant, photos: [...plant.photos, data] }
          : plant
      ));

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
      // Verify both plant and photo belong to user
      const { data: photo, error: photoError } = await supabase
        .from('photos')
        .select('id')
        .eq('id', photoId)
        .eq('plant_id', plantId)
        .eq('user_id', user.id)
        .single();

      if (photoError || !photo) {
        throw new Error('Photo not found or access denied');
      }

      const { data, error } = await supabase
        .from('plants')
        .update({ 
          cover_photo_id: photoId,
          updated_at: new Date().toISOString()
        })
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

  const updatePhotoOrder = async (plantId, photosArray) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to update photo order');
    }

    try {
      // Verify plant belongs to user
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .select('id')
        .eq('id', plantId)
        .eq('user_id', user.id)
        .single();

      if (plantError || !plant) {
        throw new Error('Plant not found or access denied');
      }

      // Update each photo's display order
      const updatePromises = photosArray.map((photo, index) =>
        supabase
          .from('photos')
          .update({ 
            display_order: index,
            updated_at: new Date().toISOString()
          })
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
    user
  };
}