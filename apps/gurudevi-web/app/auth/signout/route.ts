import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '../../../lib/supabase/config';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Cache-Control', 'private, no-store');
  const config = supabaseConfig();
  if (!config) return response;

  const supabase = createServerClient(config.url, config.publishableKey, {
    global: { fetch: secureApiFetch },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) {
    return new NextResponse(null, {
      status: 503,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
  return response;
}
