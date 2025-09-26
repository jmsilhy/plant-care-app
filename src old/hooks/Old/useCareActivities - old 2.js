import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './useAuth';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useCareActivities(plants) {
  const [careActivities, setCareActivities] = useState([]);
  const { user } = useAuth();

  // Fetch care activities for the current user
  const fetchCareActivities = async () => {
    if (!user) {
      setCareActivities([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('care_activities')
        .select('*')
        .eq('user_id', user.id) // Only get current user's activities
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
    if (!user) {
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
        user_id: user.id, // Associate with current user
        plant_name: plant.name,
        activity_type: activityType,
        notes: '', // Can be expanded later
        created_at: new Date().toISOString()
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
    if (!user) {
      throw new Error('Must be logged in to delete care activities');
    }

    try {
      const { error } = await supabase
        .from('care_activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', user.id); // Security: only delete own activities

      if (error) throw error;

      // Update local state
      setCareActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Error deleting care activity:', error);
      throw error;
    }
  };

  const updateCareActivity = async (activityId, updates) => {
    if (!user) {
      throw new Error('Must be logged in to update care activities');
    }

    try {
      const { data, error } = await supabase
        .from('care_activities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .eq('user_id', user.id) // Security: only update own activities
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