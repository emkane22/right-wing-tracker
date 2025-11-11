/**
 * Server-side Supabase client (for API routes)
 * Uses service role key for admin access, falls back to anon key if service key not available
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;

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
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL or DATABASE_URL must be set. ' +
      'Please check your .env.local file and ensure the Supabase URL is configured.'
    );
  }

  // Validate URL format
  try {
    new URL(SUPABASE_URL);
  } catch (error) {
    throw new Error(
      `Invalid SUPABASE_URL format: ${SUPABASE_URL}. ` +
      'Expected format: https://[project-ref].supabase.co'
    );
  }

  // Use service key if available, otherwise fall back to anon key
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY || '';
  
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. ' +
      'Please check your .env.local file and ensure at least one Supabase key is configured.'
    );
  }

  return {
    url: SUPABASE_URL,
    serviceKey: key,
  };
};

/**
 * Get or create the Supabase server client
 * Lazy initialization to avoid errors at module load time
 */
export function getSupabaseServer(): SupabaseClient {
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  try {
    const config = getSupabaseConfig();
    
    // Create server-side Supabase client
    // If using service role key, this bypasses RLS (Row Level Security)
    // If using anon key, RLS policies will apply
    supabaseServerInstance = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return supabaseServerInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to initialize Supabase client: ${errorMessage}. ` +
      'Please check your environment variables and network connection.'
    );
  }
}

// Export for backward compatibility
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseServer()[prop as keyof SupabaseClient];
  },
});
