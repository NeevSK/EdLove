import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveAuthorizedEntry } from './authorizedEntry';

const subject = '00000000-0000-4000-8000-000000000001';
const accountId = '01234567-89ab-8101-8000-010203040506';

function supabaseFor(subjectId = subject) {
  return {
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: subjectId } }, error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'verified-token', user: { id: subjectId } } },
        error: null,
      }),
    },
  };
}

function identityPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: accountId,
    display_name: 'Nadeesha',
    onboarding_completed: true,
    scopeBootstrap: {
      version: 1,
      userId: accountId,
      primaryCapacity: 'teacher',
      selection: 'selected',
      activeScope: {
        bondId: '00000000-0000-4000-8000-000000000010',
        entityId: 'personal-sanctuary-1',
        entityType: 'PERSONAL_CLASSROOM',
        roles: ['teacher'],
      },
    },
    ...overrides,
  };
}

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('resolveAuthorizedEntry', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses only the server-issued selected scope for a ready browser entry', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const fetcher = vi.fn().mockResolvedValue(response(identityPayload()));

    const result = await resolveAuthorizedEntry(supabaseFor(), fetcher);

    expect(result).toEqual({
      kind: 'ready',
      accountId,
      authSubjectId: subject,
      displayName: 'Nadeesha',
      activeCapacity: 'teacher',
      primaryScopeRole: 'teacher',
      activeScope: {
        bondId: '00000000-0000-4000-8000-000000000010',
        entityId: 'personal-sanctuary-1',
        entityType: 'PERSONAL_CLASSROOM',
        roles: ['teacher'],
      },
    });
    expect(fetcher).toHaveBeenCalledWith('https://sanctuary.example/api/openapi/identity/resolveIdentity', {
      headers: { Authorization: 'Bearer verified-token' },
      method: 'GET',
      cache: 'no-store',
      redirect: 'error',
    });
  });

  it('rejects an insecure API origin before session lookup or authenticated fetch', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.example.test');
    const supabase = supabaseFor();
    const fetcher = vi.fn();

    await expect(resolveAuthorizedEntry(supabase, fetcher)).resolves.toMatchObject({
      kind: 'unavailable',
    });
    expect(supabase.auth.getSession).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('does not authorize a legacy activeBond card when scopeBootstrap is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(
        response({
          id: accountId,
          display_name: 'Nadeesha',
          onboarding_completed: true,
          activeBond: { capacity: 'teacher' },
        }),
      ),
    );

    expect(result).toEqual({ kind: 'onboarding-required', reason: 'missing-active-scope' });
  });

  it('accepts an API-resolved account ID distinct from the verified provider subject', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(response(identityPayload())),
    );

    expect(result).toMatchObject({ kind: 'ready', accountId, authSubjectId: subject });
  });

  it.each([undefined, 'not-a-uuid'])(
    'rejects a missing or malformed canonical account ID: %s',
    async (id) => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
      const payload = identityPayload({ id });

      const result = await resolveAuthorizedEntry(
        supabaseFor(),
        vi.fn().mockResolvedValue(response(payload)),
      );

      expect(result).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
    },
  );

  it('rejects a scope bootstrap whose canonical account ID differs from the identity payload', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(
        response(
          identityPayload({
            scopeBootstrap: {
              ...identityPayload().scopeBootstrap,
              userId: subject,
            },
          }),
        ),
      ),
    );

    expect(result).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
  });

  it('does not forward a bearer token when verified claims and provider session differ', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const supabase = supabaseFor();
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'verified-token', user: { id: accountId } } },
      error: null,
    });
    const fetcher = vi.fn();

    const result = await resolveAuthorizedEntry(supabase, fetcher);

    expect(result).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects an account switch while the authoritative request is in flight', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const supabase = supabaseFor();
    supabase.auth.getClaims
      .mockResolvedValueOnce({ data: { claims: { sub: subject } }, error: null })
      .mockResolvedValueOnce({ data: { claims: { sub: accountId } }, error: null });
    const fetcher = vi.fn().mockResolvedValue(response(identityPayload()));

    const result = await resolveAuthorizedEntry(supabase, fetcher);

    expect(result).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
  });

  it('rejects a provider-session switch while the authoritative request is in flight', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const supabase = supabaseFor();
    supabase.auth.getSession
      .mockResolvedValueOnce({
        data: { session: { access_token: 'verified-token', user: { id: subject } } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { session: { access_token: 'other-token', user: { id: accountId } } },
        error: null,
      });
    const fetcher = vi.fn().mockResolvedValue(response(identityPayload()));

    const result = await resolveAuthorizedEntry(supabase, fetcher);

    expect(result).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
  });

  it('fails closed for unavailable and unauthorized identity API responses', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const unavailable = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockRejectedValue(new Error('network unavailable')),
    );
    const unauthorized = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    expect(unavailable).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
    expect(unauthorized).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
  });
});
