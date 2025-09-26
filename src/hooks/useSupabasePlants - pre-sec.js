import { useState, useEffect } from 'react';

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
          const db_plant_data = {
            name: plant_data.name,
            species: plant_data.species,
            acquisition_date: plant_data.acquisition_date,
            source: plant_data.source,
            price: plant_data.price,
            notes: plant_data.notes,
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
          const db_updates = {};
          
          if (updates.name !== undefined) db_updates.name = updates.name;
          if (updates.species !== undefined) db_updates.species = updates.species;
          if (updates.acquisition_date !== undefined) db_updates.acquisition_date = updates.acquisition_date || null;
          if (updates.source !== undefined) db_updates.source = updates.source || null;
          if (updates.price !== undefined) db_updates.price = updates.price ? parseFloat(updates.price) : null;
          if (updates.notes !== undefined) db_updates.notes = updates.notes || null;
          if (updates.cover_photo_id !== undefined) db_updates.cover_photo_id = updates.cover_photo_id;

          console.log('🔄 Database updates:', db_updates);

          const { data, error } = await supabase
            .from('plants')
            .update(db_updates)
            .eq('id', plant_id)
            .eq('user_id', user.id)
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
          const { data, error } = await supabase
            .from('photos')
            .insert([{
              url: photo_data.url,
              caption: photo_data.caption,
              plant_id: plant_id,
              user_id: user.id,
              file_name: photo_data.file_name,
              storage_path: photo_data.storage_path || photo_data.file_name, 
            }])
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
          const update_promises = photos_array.map((photo, index) =>
            supabase
              .from('photos')
              .update({ display_order: index })
              .eq('id', photo.id)
              .eq('user_id', user.id)
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