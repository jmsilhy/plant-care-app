import { useState, useEffect } from 'react';
import { validatePlantData, validatePhotoData } from '../utils/securityUtils';

export function useSupabasePlants(user, supabase) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlants = async () => {
    if (!user || !supabase) {
      setPlants([]);
      setLoading(false);
      return;
    }

    console.log('Fetching plants for user:', user.id);
    setLoading(true);

    try {
      const { data: plants_data, error: plants_error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (plants_error) {
        console.error('Supabase error details:', plants_error);
        throw plants_error;
      }

      console.log('Plants fetched:', plants_data?.length || 0);

      // Fetch photos
      const plant_ids = plants_data?.map(plant => plant.id) || [];
      
      let photos_data = [];
      if (plant_ids.length > 0) {
        const { data: photos, error: photos_error } = await supabase
          .from('photos')
          .select('*')
          .in('plant_id', plant_ids)
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });

        if (photos_error) {
          console.error('Error fetching photos:', photos_error);
          throw photos_error;
        }
        photos_data = photos || [];
      }

      // Combine plants with photos
      const plants_with_photos = (plants_data || []).map(plant => ({
        ...plant,
        photos: photos_data.filter(photo => photo.plant_id === plant.id)
      }));

      console.log('Setting plants:', plants_with_photos.length);
      setPlants(plants_with_photos);
    } catch (error) {
      console.error('Error in fetchPlants:', error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useSupabasePlants effect triggered');
    fetchPlants();
  }, [user?.id, supabase]);

  const addPlant = async (plant_data) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to add plants');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Validate and sanitize all plant data
          const validated_plant_data = validatePlantData(plant_data);
          
          const db_plant_data = {
            ...validated_plant_data,
            user_id: user.id
          };

          const { data, error } = await supabase
            .from('plants')
            .insert([db_plant_data])
            .select()
            .single();

          if (error) {
            console.error('Error adding plant:', error);
            throw error;
          }

          setPlants(prev => [{ ...data, photos: [] }, ...prev]);
          resolve(data);
        } catch (error) {
          console.error('Error in addPlant:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const updatePlant = async (plant_id, updates) => {
    console.log('🔄 updatePlant called:', { plant_id, updates });
  
    if (!user || !supabase) {
      throw new Error('Must be logged in to update plants');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Validate updates before sending to database
          const validated_updates = validatePlantData(updates);

          console.log('🔄 Validated updates:', validated_updates);

          const { data, error } = await supabase
            .from('plants')
            .update(validated_updates)
            .eq('id', plant_id)
            .eq('user_id', user.id) // SECURITY: Ensure user can only update their own plants
            .select()
            .single();

          console.log('🔄 Update result:', { data, error });

          if (error) {
            console.error('Database update error:', error);
            throw error;
          }

          // Update local state
          setPlants(prev => prev.map(plant => 
            plant.id === plant_id 
              ? { ...plant, ...data, photos: plant.photos } 
              : plant
          ));
          
          resolve(data);
        } catch (error) {
          console.error('Error updating plant:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const deletePlant = async (plant_id) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to delete plants');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: All deletes use user_id to ensure users can only delete their own data
          
          // Delete photos first
          const { error: photos_error } = await supabase
            .from('photos')
            .delete()
            .eq('plant_id', plant_id)
            .eq('user_id', user.id);

          if (photos_error) throw photos_error;

          // Delete care activities
          const { error: activities_error } = await supabase
            .from('care_activities')
            .delete()
            .eq('plant_id', plant_id)
            .eq('user_id', user.id);

          if (activities_error) throw activities_error;

          // Delete plant
          const { error: plant_error } = await supabase
            .from('plants')
            .delete()
            .eq('id', plant_id)
            .eq('user_id', user.id);

          if (plant_error) throw plant_error;

          setPlants(prev => prev.filter(plant => plant.id !== plant_id));
          resolve();
        } catch (error) {
          console.error('Error deleting plant:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const addPhotoToPlant = async (plant_id, photo_data) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to add photos');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Validate photo data before upload
          const validated_photo = validatePhotoData(photo_data);

          const photo_record = {
            ...validated_photo,
            plant_id: plant_id,
            user_id: user.id,
            storage_path: validated_photo.file_name
          };

          const { data, error } = await supabase
            .from('photos')
            .insert([photo_record])
            .select()
            .single();
          
          if (error) throw error;

          setPlants(prev => prev.map(plant => 
            plant.id === plant_id 
              ? { ...plant, photos: [...plant.photos, data] }
              : plant
          ));

          resolve(data);
        } catch (error) {
          console.error('Error adding photo:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const deletePhotoFromPlant = async (plant_id, photo_id) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to delete photos');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Ensure user can only delete their own photos
          const { error } = await supabase
            .from('photos')
            .delete()
            .eq('id', photo_id)
            .eq('plant_id', plant_id)
            .eq('user_id', user.id);

          if (error) throw error;

          setPlants(prev => prev.map(plant => 
            plant.id === plant_id 
              ? { ...plant, photos: plant.photos.filter(photo => photo.id !== photo_id) }
              : plant
          ));

          resolve();
        } catch (error) {
          console.error('Error deleting photo:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const setCoverPhoto = async (plant_id, photo_id) => {
    console.log('🖼️ setCoverPhoto called:', { plant_id, photo_id });
    
    if (!user || !supabase) {
      throw new Error('Must be logged in to set cover photo');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Ensure user can only modify their own plants
          const { data, error } = await supabase
            .from('plants')
            .update({ cover_photo_id: photo_id })
            .eq('id', plant_id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;

          setPlants(prev => prev.map(plant => 
            plant.id === plant_id 
              ? { ...plant, cover_photo_id: photo_id }
              : plant
          ));

          resolve(data);
        } catch (error) {
          console.error('Error setting cover photo:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const updatePhotoOrder = async (plant_id, photos_array) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to update photo order');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Ensure user can only reorder their own photos
          const update_promises = photos_array.map((photo, index) =>
            supabase
              .from('photos')
              .update({ display_order: index })
              .eq('id', photo.id)
              .eq('user_id', user.id) // This ensures only user's photos are updated
          );

          const results = await Promise.all(update_promises);
          
          const errors = results.filter(result => result.error);
          if (errors.length > 0) {
            throw new Error('Failed to update some photo orders');
          }

          setPlants(prev => prev.map(plant => 
            plant.id === plant_id 
              ? { ...plant, photos: photos_array }
              : plant
          ));

          resolve();
        } catch (error) {
          console.error('Error updating photo order:', error);
          reject(error);
        }
      }, 0);
    });
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