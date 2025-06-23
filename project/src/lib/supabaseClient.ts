import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekwpzlzdjbfzjdtdfafk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing. This will cause authentication issues.');
}

console.log('Supabase client initialization:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  url: supabaseUrl,
  mode: import.meta.env.MODE
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 