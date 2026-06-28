'use client';

import { createBrowserClient } from '@supabase/ssr';

import { getInstantRamenSupabaseConfig } from './config';

export function createInstantRamenSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getInstantRamenSupabaseConfig();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
