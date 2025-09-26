import { useState, useEffect } from 'react';
// import { useAuth } from './useAuth';

export function useCareActivities(plants, user, supabase) {
  const [careActivities, setCareActivities] = useState([]);
 //  const { user, supabase } = useAuth(); // Get supabase client from useAuth

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

      // Verify plant belongs to user
      if (plant.user_id !== user.id) {
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
      .slice(0, limit);
  };

  const getPlantActivities = (plantId) => {
    return careActivities
      .filter(activity => activity.plant_id === plantId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
      // Filter out invalid fields and convert field names if needed
      const dbUpdates = {
        ...updates
        // updated_at will be handled by database trigger
      };

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