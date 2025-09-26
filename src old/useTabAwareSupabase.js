import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';

// Create a hook that manages tab visibility and connection freshness
export function useTabAwareSupabase() {
  const [client, setClient] = useState(() => 
    createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY
    )
  );
  
  const lastActiveTime = useRef(Date.now());
  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeSinceLastActive = now - lastActiveTime.current;
      
      if (document.visibilityState === 'visible') {
        // If tab was hidden for more than 30 seconds, create fresh client
        if (timeSinceLastActive > 30000 && !isInitialMount.current) {
          console.log('Tab was inactive for', timeSinceLastActive, 'ms - creating fresh Supabase client');
          
          const freshClient = createClient(
            process.env.REACT_APP_SUPABASE_URL,
            process.env.REACT_APP_SUPABASE_ANON_KEY
          );
          
          setClient(freshClient);
        }
        lastActiveTime.current = now;
      }
      
      isInitialMount.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle page focus events as backup
    const handleFocus = () => handleVisibilityChange();
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return client;
}