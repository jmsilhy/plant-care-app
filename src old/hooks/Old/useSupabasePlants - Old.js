import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSupabasePlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plants from Supabase
  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select(`
        *,
        photos (
          id,
          file_name,
          storage_path,
          caption,
          url,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPlants(data || []);
  } catch (error) {
    console.error('Error fetching plants:', error);
  } finally {
    setLoading(false);
  }
};

  const addPlant = async (plantData) => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .insert([{
        name: plantData.name,
        species: plantData.species,
        acquisition_date: plantData.acquisitionDate || null,
        source: plantData.source,
        price: plantData.price || null,
        notes: plantData.notes
      }])
      .select()
      .single();

    if (error) throw error;

   // Add the new plant to local state
    setPlants(prev => [data, ...prev]);
    return data;
  } catch (error) {
    console.error('Error adding plant:', error);
    throw error;
  }
};

    const updatePlant = async (plantId, plantData) => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .update({
        name: plantData.name,
        species: plantData.species,
        acquisition_date: plantData.acquisitionDate || null,
        source: plantData.source,
        price: plantData.price || null,
        notes: plantData.notes
      })
      .eq('id', plantId)
      .select()
      .single();

    if (error) throw error;
  
    // Update the plant in local state
    setPlants(prev => prev.map(plant => 
      plant.id === plantId ? data : plant
    ));
    return data;
  } catch (error) {
    console.error('Error updating plant:', error);
    throw error;
  }
};

    const deletePlant = async (plantId) => {
  try {
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plantId);

    if (error) throw error;
    
    // Remove the plant from local state
    setPlants(prev => prev.filter(plant => plant.id !== plantId));
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
};

const addPhotoToPlant = async (plantId, photoData) => {
    console.log('addPhotoToPlant called with:', plantId, photoData);
    console.log('Plant ID being used:', plantId);  // Add these lines here
  console.log('All plants in state:', plants.map(p => ({ id: p.id, name: p.name })));
  try {
    // First upload the photo file to storage
    const fileName = `${plantId}/${Date.now()}-${photoData.fileName}`;
    
    // Convert base64 to blob for upload
    const response = await fetch(photoData.url);
    const blob = await response.blob();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant_photos')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

   // Get the public URL
const { data: { publicUrl } } = supabase.storage
  .from('plant_photos')
  .getPublicUrl(fileName);

// Save photo record to database with the public URL
const { data, error } = await supabase
  .from('photos')
  .insert([{
    plant_id: plantId,
    file_name: photoData.fileName,
    storage_path: fileName,
    url: publicUrl,  // Add this line
    caption: photoData.caption
  }])
      .select()
      .single();

    if (error) throw error;

    // Fetch updated plant data
    await fetchPlants();
    
    return data;
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
};

const setCoverPhoto = async (plantId, photoId) => {
  try {
    const { error } = await supabase
      .from('plants')
      .update({ coverPhotoId: photoId })
      .eq('id', plantId);

    if (error) throw error;

    // Update local state
    setPlants(prev => prev.map(plant =>
      plant.id === plantId 
        ? { ...plant, coverPhotoId: photoId }
        : plant
    ));
  } catch (error) {
    console.error('Error setting cover photo:', error);
    throw error;
  }
};

const updatePhotoOrder = async (plantId, photoIds) => {
  try {
    // Update each photo with its new display_order
    const updates = photoIds.map((photoId, index) => ({
      id: photoId,
      display_order: index + 1
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('photos')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    // Refresh plants data
    await fetchPlants();
  } catch (error) {
    console.error('Error updating photo order:', error);
    throw error;
  }
};

const deletePhotoFromPlant = async (plantId, photoId) => {
  try {
    // Get the photo record to find the storage path
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('plant_photos')
      .remove([photo.storage_path]);

    if (storageError) throw storageError;

    // Delete record from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    // Refresh plants data
    await fetchPlants();
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

  return {
    plants,
    loading,
    fetchPlants,
    addPlant,
    updatePlant,
    deletePlant,
    addPhotoToPlant,
    setCoverPhoto,
    updatePhotoOrder,
    deletePhotoFromPlant
  };
}