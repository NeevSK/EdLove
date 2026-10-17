import type { AccountDeletionRequest } from '@repo/core/logic/ports/auth.port';
import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '../../../lib/supabase/config';

const noStoreHeaders = { 'Cache-Control': 'private, no-store' };

function unavailableResponse(): NextResponse {
  return new NextResponse(null, { status: 503, headers: noStoreHeaders });
}

async function authenticatedClient(request: NextRequest) {
  const config = supabaseConfig();
  if (!config) return null;

  const supabase = createServerClient(config.url, config.publishableKey, {
    global: { fetch: secureApiFetch },
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => undefined },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error) return 'unavailable' as const;
  if (!data.user) return 'signed-out' as const;
  return supabase;
}

function json(body: AccountDeletionRequest | null, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function execute(request: NextRequest, operation: string): Promise<NextResponse> {
  const supabase = await authenticatedClient(request);
  if (supabase === null || supabase === 'unavailable') return unavailableResponse();
  if (supabase === 'signed-out')
    return new NextResponse(null, { status: 401, headers: noStoreHeaders });

  const { data, error } = await supabase.rpc(operation);
  if (error) return unavailableResponse();
  return json((Array.isArray(data) ? data[0] : data) as AccountDeletionRequest | null);
}

export function GET(request: NextRequest): Promise<NextResponse> {
  return execute(request, 'get_account_deletion_request_status');
}

export function POST(request: NextRequest): Promise<NextResponse> {
  return execute(request, 'request_account_deletion');
}

export function DELETE(request: NextRequest): Promise<NextResponse> {
  return execute(request, 'cancel_account_deletion_request');
}
