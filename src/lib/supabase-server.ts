/**
 * Server-side Supabase client (for API routes)
 * Uses service role key for admin access, falls back to anon key if service key not available
 */

import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Try to extract from DATABASE_URL if env vars not set
  if (!SUPABASE_URL) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (DATABASE_URL) {
      const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:(\d+)\/(.+)/);
      if (urlMatch) {
        const projectRef = urlMatch[3];
        return {
          url: `https://${projectRef}.supabase.co`,
          serviceKey: SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY || '',
        };
      }
    }
  }

  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or DATABASE_URL must be set');
  }

  // Use service key if available, otherwise fall back to anon key
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY || '';
  
  if (!key) {
    throw new Error('SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }

  return {
    url: SUPABASE_URL,
    serviceKey: key,
  };
};

const config = getSupabaseConfig();

// Create server-side Supabase client
// If using service role key, this bypasses RLS (Row Level Security)
// If using anon key, RLS policies will apply
export const supabaseServer = createClient(config.url, config.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

