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

const personalBond = '00000000-0000-4000-8000-000000000010';
const schoolBond = '00000000-0000-4000-8000-000000000011';

function scope(bondId: string, entityType: string, capacity: string) {
  return {
    bondId,
    entityId: `${entityType}-1`,
    entityType,
    capacity,
    citizenship: 'FIRST_CLASS',
    admission: 'available',
  };
}

function identityPayload(overrides: Record<string, unknown> = {}) {
  return {
    accountId,
    displayName: 'Nadeesha',
    onboardingCompleted: true,
    scopes: [
      scope(personalBond, 'PERSONAL', 'teacher'),
      scope(schoolBond, 'SCHOOL', 'principal'),
    ],
    ...overrides,
  };
}

function response(body: unknown): Response {
  return Response.json({ json: body });
}

const noSelection = async () => undefined;

describe('resolveAuthorizedEntry', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enters the chosen bond, keeping the personal capacity as primary', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const fetcher = vi.fn().mockResolvedValue(response(identityPayload()));

    const result = await resolveAuthorizedEntry(supabaseFor(), fetcher, async () => schoolBond);

    expect(result).toEqual({
      kind: 'ready',
      accountId,
      authSubjectId: subject,
      displayName: 'Nadeesha',
      activeCapacity: 'principal',
      primaryCapacity: 'teacher',
      primaryScopeRole: 'teacher',
      activeScope: {
        bondId: schoolBond,
        entityId: 'SCHOOL-1',
        entityType: 'SCHOOL',
        roles: ['principal'],
      },
    });
    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(String(url)).toBe('https://sanctuary.example/api/v1/identity/entry');
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer verified-token');
    expect(init).toMatchObject({ cache: 'no-store', redirect: 'error' });
  });

  it('falls back to the personal bond when the chosen one is not this account\'s', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(response(identityPayload())),
      async () => '00000000-0000-4000-8000-0000000000ff',
    );
    expect(result).toMatchObject({ kind: 'ready', activeScope: { bondId: personalBond } });
  });

  it('never enters through a bond that is not admitted', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(
        response(
          identityPayload({
            scopes: [{ ...scope(schoolBond, 'SCHOOL', 'principal'), admission: 'denied' }],
          }),
        ),
      ),
      async () => schoolBond,
    );
    expect(result).toEqual({ kind: 'onboarding-required', reason: 'missing-active-scope' });
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

  it('requires onboarding for an account with no bonds', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(response(identityPayload({ scopes: [] }))),
      noSelection,
    );
    expect(result).toEqual({ kind: 'onboarding-required', reason: 'missing-active-scope' });
  });

  it('accepts an API-resolved account ID distinct from the verified provider subject', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(response(identityPayload())),
      noSelection,
    );

    expect(result).toMatchObject({ kind: 'ready', accountId, authSubjectId: subject });
  });

  it.each([undefined, 'not-a-uuid'])(
    'rejects a missing or malformed canonical account ID: %s',
    async (id) => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
      const payload = identityPayload({ accountId: id });

      const result = await resolveAuthorizedEntry(
        supabaseFor(),
        vi.fn().mockResolvedValue(response(payload)),
        noSelection,
      );

      expect(result).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
    },
  );

  it('does not forward a bearer token when verified claims and provider session differ', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const supabase = supabaseFor();
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'verified-token', user: { id: accountId } } },
      error: null,
    });
    const fetcher = vi.fn();

    const result = await resolveAuthorizedEntry(supabase, fetcher, noSelection);

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

    const result = await resolveAuthorizedEntry(supabase, fetcher, noSelection);

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

    const result = await resolveAuthorizedEntry(supabase, fetcher, noSelection);

    expect(result).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
  });

  it('fails closed for unavailable and unauthorized identity API responses', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const unavailable = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockRejectedValue(new Error('network unavailable')),
      noSelection,
    );
    const unauthorized = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
      noSelection,
    );

    expect(unavailable).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
    expect(unauthorized).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
  });
});
