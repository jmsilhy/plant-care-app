import { useState } from 'react';

export function useBulkCare(plants, logCareActivity) {
  const [bulkCareMode, setBulkCareMode] = useState(false);
  const [selectedPlantIds, setSelectedPlantIds] = useState([]);

  const toggleBulkCare = () => {
    setBulkCareMode(!bulkCareMode);
    setSelectedPlantIds([]);
  };

  const toggleSelectPlant = (plantId) => {
    setSelectedPlantIds(prev => 
      prev.includes(plantId)
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const selectAllPlants = () => {
    setSelectedPlantIds(plants.map(plant => plant.id));
  };

  const clearSelections = () => {
    setSelectedPlantIds([]);
  };

  const applyBulkCare = (activityType) => {
    if (selectedPlantIds.length === 0) {
      alert('Please select at least one plant first!');
      return;
    }

    selectedPlantIds.forEach(plantId => 
  logCareActivity(plantId, activityType)
);

    const selectedPlantNames = selectedPlantIds
      .map(id => plants.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    
    alert(`${activityType.replace('-', ' ')} applied to: ${selectedPlantNames}`);
    
    setSelectedPlantIds([]);
    setBulkCareMode(false);
  };

  return {
    bulkCareMode,
    selectedPlantIds,
    toggleBulkCare,
    toggleSelectPlant,
    selectAllPlants,
    clearSelections,
    applyBulkCare
  };
}