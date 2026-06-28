import { instantRamenBrandConfig } from '../config/brand';

const defaultSiteOrigin = instantRamenBrandConfig.appUrl;

export function getInstantRamenSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return {
    supabaseAnonKey,
    supabaseUrl,
  };
}

export function getInstantRamenAuthRedirectUrl(path = '/auth/callback') {
  const origin =
    typeof window === 'undefined' ? defaultSiteOrigin : window.location.origin;

  return new URL(path, origin).toString();
}
