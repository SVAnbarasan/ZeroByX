
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase project details
const supabaseUrl = 'https://wcwqdrjzdkrjjmmnsxru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjd3Fkcmp6ZGtyamptbW5zeHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMDU0OTIsImV4cCI6MjA1OTU4MTQ5Mn0.zFpL_QOpYTeZnmOnIeijS5Kp9CZtB1P4Cz26CI7ZGmo';

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});
