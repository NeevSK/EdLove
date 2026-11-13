import { describe, expect, it, vi } from 'vitest';
import { readAccountEntry } from './accountEntry';

const subject = '00000000-0000-4000-8000-000000000001';
const accountId = '01234567-89ab-8101-8000-010203040506';
const origin = 'https://sanctuary.example';

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
    scopes: [scope(personalBond, 'PERSONAL', 'teacher'), scope(schoolBond, 'SCHOOL', 'principal')],
    ...overrides,
  };
}

function response(body: unknown): Response {
  return Response.json({ json: body });
}

describe('readAccountEntry (G1 / Vitest; Sanctuary API substituted)', () => {
  it('enters the chosen bond, keeping the personal capacity as primary', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(identityPayload()));

    const result = await readAccountEntry('verified-token', subject, {
      origin,
      fetcher,
      selectedBond: schoolBond,
    });

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

  it("falls back to the personal bond when the chosen one is not this account's", async () => {
    const result = await readAccountEntry('verified-token', subject, {
      origin,
      fetcher: vi.fn().mockResolvedValue(response(identityPayload())),
      selectedBond: '00000000-0000-4000-8000-0000000000ff',
    });
    expect(result).toMatchObject({ kind: 'ready', activeScope: { bondId: personalBond } });
  });

  it('never enters through a bond that is not admitted', async () => {
    const result = await readAccountEntry('verified-token', subject, {
      origin,
      fetcher: vi.fn().mockResolvedValue(
        response(
          identityPayload({
            scopes: [{ ...scope(schoolBond, 'SCHOOL', 'principal'), admission: 'denied' }],
          }),
        ),
      ),
      selectedBond: schoolBond,
    });
    expect(result).toEqual({ kind: 'onboarding-required', reason: 'missing-active-scope' });
  });

  it('rejects an insecure or missing API origin before any authenticated fetch', async () => {
    const fetcher = vi.fn();
    await expect(
      readAccountEntry('verified-token', subject, { origin: 'http://api.example.test', fetcher }),
    ).rejects.toThrow();
    await expect(
      readAccountEntry('verified-token', subject, { origin: '', fetcher }),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('requires onboarding for an account with no bonds', async () => {
    const result = await readAccountEntry('verified-token', subject, {
      origin,
      fetcher: vi.fn().mockResolvedValue(response(identityPayload({ scopes: [] }))),
    });
    expect(result).toEqual({ kind: 'onboarding-required', reason: 'missing-active-scope' });
  });

  it('accepts an API-resolved account ID distinct from the verified provider subject', async () => {
    const result = await readAccountEntry('verified-token', subject, {
      origin,
      fetcher: vi.fn().mockResolvedValue(response(identityPayload())),
    });

    expect(result).toMatchObject({ kind: 'ready', accountId, authSubjectId: subject });
  });

  it.each([undefined, 'not-a-uuid'])(
    'rejects a missing or malformed canonical account ID: %s',
    async (id) => {
      const payload = identityPayload({ accountId: id });

      const result = await readAccountEntry('verified-token', subject, {
        origin,
        fetcher: vi.fn().mockResolvedValue(response(payload)),
      });

      expect(result).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
    },
  );

  it('fails closed for unavailable and unauthorized identity API responses', async () => {
    await expect(
      readAccountEntry('verified-token', subject, {
        origin,
        fetcher: vi.fn().mockRejectedValue(new Error('network unavailable')),
      }),
    ).rejects.toThrow();
    await expect(
      readAccountEntry('verified-token', subject, {
        origin,
        fetcher: vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
      }),
    ).rejects.toThrow();
  });
});
