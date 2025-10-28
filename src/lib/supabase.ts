import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function validateEnvironmentVariables() {
  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not defined');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }

  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not defined');
  } else if (supabaseAnonKey.split('.').length !== 3) {
    errors.push('VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
  }

  if (errors.length > 0) {
    console.error('Supabase Configuration Errors:', errors);
    throw new Error(
      `Missing or invalid Supabase environment variables:\n${errors.join('\n')}\n\n` +
      'Please check your .env file and ensure both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.'
    );
  }
}

validateEnvironmentVariables();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
