import { useState, useEffect } from 'react';

export function useCareActivities(plants, user, supabase) {
  const [careActivities, setCareActivities] = useState([]);

  // Fetch care activities for the current user
  const fetchCareActivities = async () => {
    if (!user || !supabase) {
      setCareActivities([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('care_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCareActivities(data || []);
    } catch (error) {
      console.error('Error fetching care activities:', error);
      setCareActivities([]);
    }
  };

  // Fetch activities when user changes or component mounts
  useEffect(() => {
    fetchCareActivities();
  }, [user?.id]);

  const logCareActivity = async (plantId, activityType, plantsArray) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to log care activities');
    }

    try {
      // Get plant name for the activity record
      const plant = plantsArray.find(p => p.id === plantId);
      if (!plant) {
        throw new Error('Plant not found');
      }

      // Verify plant belongs to user - handle both camelCase and snake_case
      const plantUserId = plant.user_id || plant.userId;
      if (plantUserId !== user.id) {
        throw new Error('Access denied - not your plant');
      }

      const newActivity = {
        plant_id: plantId,
        user_id: user.id,
        plant_name: plant.name,
        activity_type: activityType,
        notes: ''
      };

      const { data, error } = await supabase
        .from('care_activities')
        .insert([newActivity])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCareActivities(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error logging care activity:', error);
      throw error;
    }
  };

  const getRecentCareActivities = (plantId, limit = 5) => {
    return careActivities
      .filter(activity => activity.plant_id === plantId)
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        // Ensure consistent field names for display
        plantName: activity.plant_name,
        activityType: activity.activity_type,
        createdAt: activity.created_at
      }));
  };

  const getPlantActivities = (plantId) => {
    return careActivities
      .filter(activity => activity.plant_id === plantId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(activity => ({
        ...activity,
        // Ensure consistent field names for display
        plantName: activity.plant_name,
        activityType: activity.activity_type,
        createdAt: activity.created_at
      }));
  };

  const deleteCareActivity = async (activityId) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to delete care activities');
    }

    try {
      const { error } = await supabase
        .from('care_activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setCareActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Error deleting care activity:', error);
      throw error;
    }
  };

  const updateCareActivity = async (activityId, updates) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to update care activities');
    }

    try {
      // Convert camelCase inputs to snake_case for database
      const dbUpdates = {};
      
      if (updates.plant_name !== undefined) dbUpdates.plant_name = updates.plant_name;
      if (updates.plantName !== undefined) dbUpdates.plant_name = updates.plantName;
      if (updates.activity_type !== undefined) dbUpdates.activity_type = updates.activity_type;
      if (updates.activityType !== undefined) dbUpdates.activity_type = updates.activityType;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      
      // Remove any undefined fields
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const { data, error } = await supabase
        .from('care_activities')
        .update(dbUpdates)
        .eq('id', activityId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCareActivities(prev => prev.map(activity => 
        activity.id === activityId ? data : activity
      ));

      return data;
    } catch (error) {
      console.error('Error updating care activity:', error);
      throw error;
    }
  };

  return {
    careActivities,
    logCareActivity,
    getRecentCareActivities,
    getPlantActivities,
    deleteCareActivity,
    updateCareActivity,
    fetchCareActivities,
    user
  };
}