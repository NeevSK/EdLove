import { COMMUNITY_GROUP_PAGE_SIZE } from '../../../../lib/community/groups-contract';
import { loadCommunityGroups } from '../../../../lib/community/groups';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = positiveInteger(params.get('limit'), COMMUNITY_GROUP_PAGE_SIZE);
  const offset = nonNegativeInteger(params.get('offset'));
  const rawSearch = params.get('search');
  const search = rawSearch?.trim() || undefined;
  if (
    limit === null ||
    limit > 50 ||
    offset === null ||
    offset > 100_000 ||
    (search !== undefined && search.length > 120)
  ) {
    return Response.json({ error: 'Invalid group directory query.' }, { status: 400, headers });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase)
    return Response.json({ error: 'Community is not configured.' }, { status: 503, headers });

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out')
    return Response.json({ error: 'Sign in to access Community.' }, { status: 401, headers });
  if (entry.kind === 'onboarding-required' || entry.kind === 'inactive')
    return Response.json({ error: 'Community is unavailable in this account state.' }, { status: 403, headers });
  if (entry.kind === 'unavailable')
    return Response.json({ error: 'Community access could not be verified.' }, { status: 503, headers });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session?.access_token || session.user.id !== entry.authSubjectId) {
    return Response.json({ error: 'Community access could not be verified.' }, { status: 401, headers });
  }

  const result = await loadCommunityGroups(session.access_token, {
    query: { limit, offset, search },
  });
  if (result.kind === 'denied')
    return Response.json({ error: 'Community access is not available in this scope.' }, { status: 403, headers });
  if (result.kind === 'unavailable')
    return Response.json({ error: 'Community groups could not be loaded.' }, { status: 503, headers });
  return Response.json(result, { status: 200, headers });
}

function positiveInteger(value: string | null, fallback: number): number | null {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function nonNegativeInteger(value: string | null): number | null {
  if (value === null) return 0;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}
