import { useState, useEffect } from 'react';
import { validateCareActivityData } from '../utils/securityUtils';

export function useCareActivities(plants, user, supabase) {
  const [care_activities, setCareActivities] = useState([]);

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

  useEffect(() => {
    fetchCareActivities();
  }, [user?.id, supabase]);

  const logCareActivity = async (plant_id, activity_type, plants_array) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to log care activities');
    }

    // Wrap the entire operation in setTimeout to avoid auth/database timing conflicts
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const plant = plants_array.find(p => p.id === plant_id);

          if (!plant) {
            throw new Error('Plant not found');
          }

          if (plant.user_id !== user.id) {
            throw new Error('Access denied - not your plant');
          }

          const raw_activity = {
            plant_id: plant_id,
            user_id: user.id,
            plant_name: plant.name,
            activity_type: activity_type,
            notes: ''
          };

          // SECURITY: Validate and sanitize all input data
          const validated_activity = validateCareActivityData(raw_activity);

          console.log('Inserting care activity...', validated_activity);

          const { data, error } = await supabase
            .from('care_activities')
            .insert([validated_activity])
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          console.log('Care activity logged successfully:', data);

          // Update local state
          setCareActivities(prev => [data, ...prev]);
          
          resolve(data);
        } catch (error) {
          console.error('Error logging care activity:', error);
          reject(error);
        }
      }, 0); // 0ms delay - just pushes to next event loop
    });
  };

  const getRecentCareActivities = (plant_id, limit = 5) => {
    return care_activities
      .filter(activity => activity.plant_id === plant_id)
      .slice(0, limit);
  };

  const getPlantActivities = (plant_id) => {
    return care_activities
      .filter(activity => activity.plant_id === plant_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const deleteCareActivity = async (activity_id) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to delete care activities');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Ensure user can only delete their own activities
          const { error } = await supabase
            .from('care_activities')
            .delete()
            .eq('id', activity_id)
            .eq('user_id', user.id); // This prevents users from deleting other users' activities

          if (error) throw error;

          setCareActivities(prev => prev.filter(activity => activity.id !== activity_id));
          resolve();
        } catch (error) {
          console.error('Error deleting care activity:', error);
          reject(error);
        }
      }, 0);
    });
  };

  const updateCareActivity = async (activity_id, updates) => {
    if (!user || !supabase) {
      throw new Error('Must be logged in to update care activities');
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // SECURITY: Validate updates before sending to database
          const validated_updates = {};
          
          if (updates.plant_name !== undefined) {
            validated_updates.plant_name = validateCareActivityData({
              plant_name: updates.plant_name,
              activity_type: 'watering', // dummy value for validation
              plant_id: 'dummy',
              user_id: 'dummy'
            }).plant_name;
          }
          
          if (updates.activity_type !== undefined) {
            validated_updates.activity_type = validateCareActivityData({
              plant_name: 'dummy',
              activity_type: updates.activity_type,
              plant_id: 'dummy',
              user_id: 'dummy'
            }).activity_type;
          }
          
          if (updates.notes !== undefined) {
            validated_updates.notes = validateCareActivityData({
              plant_name: 'dummy',
              activity_type: 'watering',
              plant_id: 'dummy',
              user_id: 'dummy',
              notes: updates.notes
            }).notes;
          }

          const { data, error } = await supabase
            .from('care_activities')
            .update(validated_updates)
            .eq('id', activity_id)
            .eq('user_id', user.id) // SECURITY: Ensure user can only update their own activities
            .select()
            .single();

          if (error) throw error;

          setCareActivities(prev => prev.map(activity => 
            activity.id === activity_id ? data : activity
          ));

          resolve(data);
        } catch (error) {
          console.error('Error updating care activity:', error);
          reject(error);
        }
      }, 0);
    });
  };

  return {
    care_activities,
    logCareActivity,
    getRecentCareActivities,
    getPlantActivities,
    deleteCareActivity,
    updateCareActivity,
    fetchCareActivities,
    user
  };
}