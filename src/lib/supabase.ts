/**
 * Supabase client setup for the application
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Extract from DATABASE_URL or use separate env variables
const getSupabaseConfig = () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If SUPABASE_URL and SUPABASE_ANON_KEY are set, use them
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
  }

  // Otherwise, try to extract from DATABASE_URL
  if (DATABASE_URL) {
    const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:(\d+)\/(.+)/);
    if (urlMatch) {
      const projectRef = urlMatch[3];
      return {
        url: `https://${projectRef}.supabase.co`,
        anonKey: process.env.SUPABASE_ANON_KEY || '', // Will need to be set separately
      };
    }
  }

  throw new Error(
    'Supabase configuration not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
};

const config = getSupabaseConfig();

// Create Supabase client
export const supabase = createClient(config.url, config.anonKey);

// Database types (will be generated from Supabase later)
export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          jurisdiction: string | null;
          actor_type: string | null;
          active_since: string | null;
          notes: string | null;
          affiliations: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          location: string | null;
          links: string | null;
          key_people: string | null;
          notes: string | null;
          affiliated: string | null;
        };
      };
      topics: {
        Row: {
          id: string;
          label: string;
          definition: string | null;
          domain: string | null;
          related_topics: string | null;
        };
      };
      sources: {
        Row: {
          id: string;
          date_published: string | null;
          outlet: string | null;
          type: string | null;
          title: string | null;
          topic: string | null;
          summary: string | null;
          url: string | null;
        };
      };
      statements: {
        Row: {
          id: string;
          date: string;
          actor_id: string;
          type: string | null;
          short_quote: string | null;
          topic_ids: string | null;
          source_id: string | null;
          notes: string | null;
        };
      };
    };
  };
}

