import { useState } from 'react';

export function useBulkCare(plants, logCareActivity) {
  const [bulk_care_mode, setBulkCareMode] = useState(false);
  const [selected_plant_ids, setSelectedPlantIds] = useState([]);

  const toggleBulkCare = () => {
    setBulkCareMode(!bulk_care_mode);
    setSelectedPlantIds([]);
  };

  const toggleSelectPlant = (plant_id) => {
    setSelectedPlantIds(prev => 
      prev.includes(plant_id)
        ? prev.filter(id => id !== plant_id)
        : [...prev, plant_id]
    );
  };

  const selectAllPlants = () => {
    setSelectedPlantIds(plants.map(plant => plant.id));
  };

  const clearSelections = () => {
    setSelectedPlantIds([]);
  };

  const applyBulkCare = (activity_type) => {
    if (selected_plant_ids.length === 0) {
      alert('Please select at least one plant first!');
      return;
    }

    // FIX: Pass the plants array as the third parameter
    selected_plant_ids.forEach(plant_id => 
      logCareActivity(plant_id, activity_type, plants)
    );

    const selected_plant_names = selected_plant_ids
      .map(id => plants.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    
    alert(`${activity_type.replace('-', ' ')} applied to: ${selected_plant_names}`);
    
    setSelectedPlantIds([]);
    setBulkCareMode(false);
  };

  return {
    bulk_care_mode,
    selected_plant_ids,
    toggleBulkCare,
    toggleSelectPlant,
    selectAllPlants,
    clearSelections,
    applyBulkCare
  };
}