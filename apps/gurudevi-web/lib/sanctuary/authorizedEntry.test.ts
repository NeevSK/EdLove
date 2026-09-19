import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveAuthorizedEntry } from './authorizedEntry';

const subject = '00000000-0000-4000-8000-000000000001';

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
    id: subject,
    display_name: 'Nadeesha',
    onboarding_completed: true,
    scopeBootstrap: {
      version: 1,
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
    expect(fetcher).toHaveBeenCalledWith('https://sanctuary.example/api/identity/resolveIdentity', {
      headers: { Authorization: 'Bearer verified-token' },
      method: 'GET',
      cache: 'no-store',
    });
  });

  it('does not authorize a legacy activeBond card when scopeBootstrap is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi.fn().mockResolvedValue(
        response({
          id: subject,
          display_name: 'Nadeesha',
          onboarding_completed: true,
          activeBond: { capacity: 'teacher' },
        }),
      ),
    );

    expect(result).toEqual({ kind: 'onboarding-required', reason: 'missing-active-scope' });
  });

  it('rejects a scope response belonging to a different signed-in subject', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    const result = await resolveAuthorizedEntry(
      supabaseFor(),
      vi
        .fn()
        .mockResolvedValue(
          response(identityPayload({ id: '00000000-0000-4000-8000-000000000099' })),
        ),
    );

    expect(result).toMatchObject({ kind: 'unavailable', reason: 'profile-unavailable' });
  });
});
