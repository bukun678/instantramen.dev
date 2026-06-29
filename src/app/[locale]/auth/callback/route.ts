import { NextResponse } from 'next/server';

import { createInstantRamenSupabaseServerClient } from '@/domains/instant-ramen/auth/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const { locale } = await params;
  const localePrefix = locale ? `/${locale}` : '';

  if (code) {
    const supabase = await createInstantRamenSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const redirectUrl = new URL(`${localePrefix}/`, requestUrl.origin);
      redirectUrl.searchParams.set('auth_error', error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
