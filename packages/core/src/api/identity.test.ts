import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  getSession: vi.fn(),
  identifyActiveCitizen: vi.fn(),
}));

vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { auth: { getSession: mock.getSession } },
}));
vi.mock('@repo/core/api/highways', () => ({ assertHighway: vi.fn() }));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { identity: { identifyActiveCitizen: mock.identifyActiveCitizen } },
}));
vi.mock('@repo/core/native/guestIdentity', () => ({
  getLocalGuestIdentity: vi.fn(),
  updateLocalGuestIdentity: vi.fn(),
}));
vi.mock('@repo/core/native/guestScope', () => ({ setGuestScope: vi.fn() }));

import { identityAPI } from './identity';

const accountId = '123e4567-e89b-8101-8000-426614174020';
const authSubject = '123e4567-e89b-4000-8000-426614174010';
const bondId = '123e4567-e89b-12d3-a456-426614174030';

function bootstrap(overrides: Record<string, unknown> = {}) {
  const bond = {
    id: bondId,
    user_id: accountId,
    entity_id: 'school-a',
    entity_type: 'SCHOOL',
    capacity: 'teacher',
    status: 'active',
  };
  return {
    id: accountId,
    email: 'teacher@example.com',
    name: 'Teacher',
    display_name: 'Teacher',
    onboarding_completed: true,
    activeBond: bond,
    availableBonds: [bond],
    scopeBootstrap: {
      version: 1,
      userId: accountId,
      name: 'Teacher',
      primaryCapacity: 'teacher',
      selection: 'selected',
      activeScope: {
        bondId,
        entityId: 'school-a',
        entityType: 'SCHOOL',
        roles: ['teacher'],
      },
    },
    ...overrides,
  };
}

describe('identity API bootstrap normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'access-token',
          user: { id: authSubject, is_anonymous: false },
        },
      },
    });
  });

  it('accepts a schema-valid server bootstrap and returns full active bond facts', async () => {
    mock.identifyActiveCitizen.mockResolvedValue(bootstrap());

    await expect(identityAPI.identifyActiveCitizen()).resolves.toMatchObject({
      id: accountId,
      activeBond: { id: bondId, entity_type: 'SCHOOL', capacity: 'teacher' },
      availableBonds: [{ id: bondId, user_id: accountId, status: 'active' }],
    });
    expect(mock.identifyActiveCitizen).toHaveBeenCalledWith(
      {},
      {
        context: {
          expectedSession: { accessToken: 'access-token', subject: authSubject },
          retry: 0,
        },
      },
    );
  });

  it('does not publish a bootstrap after its captured token is replaced', async () => {
    mock.identifyActiveCitizen.mockResolvedValue(bootstrap());
    mock.getSession
      .mockResolvedValueOnce({
        data: { session: { access_token: 'access-token', user: { id: authSubject } } },
      })
      .mockResolvedValueOnce({
        data: { session: { access_token: 'new-token', user: { id: authSubject } } },
      });
    await expect(identityAPI.identifyActiveCitizen()).rejects.toMatchObject({
      code: 'AUTH_SESSION_CHANGED',
    });
  });

  it('deduplicates only the same captured session while bootstrap is pending', async () => {
    const pending = Promise.withResolvers<ReturnType<typeof bootstrap>>();
    mock.identifyActiveCitizen.mockReturnValueOnce(pending.promise);
    const first = identityAPI.identifyActiveCitizen();
    const second = identityAPI.identifyActiveCitizen();
    await vi.waitFor(() => expect(mock.identifyActiveCitizen).toHaveBeenCalledOnce());
    pending.resolve(bootstrap());
    expect((await first)?.id).toBe(accountId);
    expect((await second)?.id).toBe(accountId);
  });

  it('rejects a bootstrap bond with a capacity unsupported by the client contract', async () => {
    mock.identifyActiveCitizen.mockResolvedValue(
      bootstrap({
        activeBond: { ...bootstrap().activeBond, capacity: 'unrecognized-capacity' },
        availableBonds: [{ ...bootstrap().activeBond, capacity: 'unrecognized-capacity' }],
      }),
    );

    await expect(identityAPI.identifyActiveCitizen()).rejects.toThrow();
  });

  it('rejects an active bond omitted from the available authorization facts', async () => {
    mock.identifyActiveCitizen.mockResolvedValue(bootstrap({ availableBonds: [] }));

    await expect(identityAPI.identifyActiveCitizen()).rejects.toThrow(
      'Identity bootstrap selected a bond outside its available bonds.',
    );
  });
});
