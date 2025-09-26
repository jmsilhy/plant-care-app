import { useState } from 'react';

export function usePlants() {
  // Update the initial sample plants to include photos array
const [plants, setPlants] = useState([
  {
    id: '1',
    name: 'My First Jade Plant',
    species: 'Portulacaria Afra',
    acquisitionDate: '2024-08-22',
    source: 'Local nursery',
    price: 12.99,
    notes: 'Small cutting from friend',
    photos: [], // Array of photo objects
    coverPhotoId: null // ID of the photo to use as cover
  },
  {
    id: '2',
    name: 'Baby Elephant Bush',
    species: 'Portulacaria Afra',
    acquisitionDate: '2024-07-15',
    source: 'Online store',
    price: 8.50,
    notes: 'Tiny but healthy',
    photos: [],
    coverPhotoId: null
  }
]);

  const addPlant = (plantData) => {
    const newPlant = {
      ...plantData,
      id: Date.now().toString(),
      price: plantData.price ? parseFloat(plantData.price) : null
    };
    setPlants(prev => [...prev, newPlant]);
  };

  const updatePlant = (plantId, plantData) => {
    setPlants(prev => prev.map(plant => 
      plant.id === plantId 
        ? {
            ...plant,
            ...plantData,
            price: plantData.price ? parseFloat(plantData.price) : null
          }
        : plant
    ));
  };

  const deletePlant = (plantId) => {
    setPlants(prev => prev.filter(plant => plant.id !== plantId));
  };

  const addPhotoToPlant = (plantId, photoData) => {
  setPlants(prev => prev.map(plant =>
    plant.id === plantId
      ? {
          ...plant,
          photos: [...plant.photos, {
            id: Date.now().toString() + Math.random(),
            url: photoData.url,
            fileName: photoData.fileName,
            uploadDate: new Date().toISOString(),
            caption: photoData.caption || ''
          }]
        }
      : plant
  ));
};

const deletePhotoFromPlant = (plantId, photoId) => {
  setPlants(prev => prev.map(plant =>
    plant.id === plantId
      ? {
          ...plant,
          photos: plant.photos.filter(photo => photo.id !== photoId),
          coverPhotoId: plant.coverPhotoId === photoId ? null : plant.coverPhotoId
        }
      : plant
  ));
};

const setCoverPhoto = (plantId, photoId) => {
  setPlants(prev => prev.map(plant =>
    plant.id === plantId
      ? { ...plant, coverPhotoId: photoId }
      : plant
  ));
};

  return {
    plants,
    addPlant,
    updatePlant,
    deletePlant,
    addPhotoToPlant,
    deletePhotoFromPlant,
    setCoverPhoto
  };
  
}