import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Factory function to create fresh clients
const createFreshClient = () => {
  return createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  );
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('=== Auth hook initializing with fresh client ===');
    
    const supabase = createFreshClient(); // Fresh client for auth listener
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setIsAdmin(data.role === 'admin' || data.role === 'moderator');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async ({ email, password, displayName }) => {
    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await createUserProfile(data.user, displayName);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await updateLastLogin(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setIsAdmin(false);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const supabase = createFreshClient(); // Fresh client for each operation
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    supabase: createFreshClient(), // Always return a fresh client
  };
}

// Helper functions using fresh clients
const createUserProfile = async (user, displayName) => {
  try {
    const supabase = createFreshClient(); // Fresh client for each operation
    
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          display_name: displayName,
          is_email_verified: user.email_confirmed_at !== null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error creating user profile:', error);
    }
  } catch (error) {
    console.error('Error in createUserProfile:', error);
  }
};

const updateLastLogin = async (userId) => {
  try {
    const supabase = createFreshClient(); // Fresh client for each operation
    
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};