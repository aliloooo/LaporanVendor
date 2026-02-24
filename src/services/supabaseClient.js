import { createClient } from '@supabase/supabase-js';

// These should be configured in .env in a real application
// For the purpose of this task and without user inputs, we will use mock configurations 
// or placeholders. In a real scenario, Supabase URL and Key are required.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
