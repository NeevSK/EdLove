import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setActiveAccountId } from '../../lib/accountScope';
import { SupabaseIdentityAdapter } from '../supabaseIdentity.adapter';

const mock = vi.hoisted(() => ({
  getUser: vi.fn(),
  getSession: vi.fn(),
  bondResolver: undefined as (() => Promise<string | null>) | undefined,
  from: vi.fn(),
  bootstrap: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  createBond: vi.fn(),
  completeProfile: vi.fn(),
  completeOnboarding: vi.fn(),
  storage: { getStringAsync: vi.fn(), set: vi.fn() },
}));
vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: {
    auth: { getUser: mock.getUser, getSession: mock.getSession },
    from: mock.from,
  },
}));
vi.mock('@repo/core/api/clientRuntime', () => ({
  registerTokenResolver: vi.fn(),
  registerActiveBondIdResolver: (resolver: () => Promise<string | null>) => {
    mock.bondResolver = resolver;
  },
}));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    identity: {
      identifyActiveCitizen: mock.bootstrap,
      selectActiveScope: mock.select,
      modifyUserProfile: mock.update,
    },
    onboarding: {
      createInitialBond: mock.createBond,
      completeProfile: mock.completeProfile,
      completeOnboarding: mock.completeOnboarding,
    },
  },
}));
vi.mock('@repo/core/lib/storage', () => ({ storage: mock.storage }));
vi.mock('@repo/core/utils/effect', async () => ({
  strictRetryPolicy: (await import('@repo/core/effect/Schedules')).strictRetryPolicy,
  tryPromise: vi.fn(),
}));

const subject = '123e4567-e89b-12d3-a456-426614174010';
const account = '123e4567-e89b-8101-8000-426614174020';
const bond = {
  id: '123e4567-e89b-12d3-a456-426614174030',
  user_id: account,
  entity_id: 'school-fixture',
  entity_type: 'SCHOOL',
  capacity: 'teacher',
  status: 'active',
};
const identity = {
  id: account,
  email: null,
  display_name: 'Teacher',
  activeBond: bond,
  availableBonds: [bond],
};

describe('legacy identity adapter canonical bootstrap (network/storage substituted)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.getSession.mockReset().mockResolvedValue({
      data: { session: { access_token: 'session-a', user: { id: subject } } },
      error: null,
    });
    mock.bootstrap.mockResolvedValue(identity);
    mock.select.mockResolvedValue(identity);
    mock.from.mockImplementation(() => {
      throw new Error('Direct identity table access is forbidden');
    });
  });
  afterEach(() => {
    expect(mock.getUser).not.toHaveBeenCalled();
    setActiveAccountId(null);
  });

  it('resolves a different canonical ID without reading or healing identity tables', async () => {
    const adapter = new SupabaseIdentityAdapter();
    await expect(adapter.identifyActiveCitizen()).resolves.toMatchObject({ id: account });
    expect(mock.bootstrap).toHaveBeenCalledWith(
      {},
      { context: { expectedSession: { accessToken: 'session-a', subject }, retry: 0 } },
    );
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('returns an identity even before a scope is selected', async () => {
    mock.bootstrap.mockResolvedValue({ ...identity, activeBond: null, availableBonds: [] });
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).resolves.toMatchObject({
      id: account,
      activeBond: null,
    });
  });

  it('does not contact the API after sign-out', async () => {
    mock.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).resolves.toBeNull();
    expect(mock.bootstrap).not.toHaveBeenCalled();
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('does not fallback to the subject or write mappings when bootstrap fails', async () => {
    const failure = new Error('Synthetic offline bootstrap');
    mock.bootstrap.mockRejectedValue(failure);
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).rejects.toBe(failure);
    expect(mock.from).not.toHaveBeenCalled();
    expect(mock.storage.set).not.toHaveBeenCalled();
  });

  it('does not resolve another session subject or a different provider', async () => {
    const adapter = new SupabaseIdentityAdapter();
    await expect(adapter.resolveInternalId('supabase', 'foreign-subject')).resolves.toBeNull();
    await expect(adapter.resolveInternalId('google', subject)).resolves.toBeNull();
    expect(mock.bootstrap).not.toHaveBeenCalled();
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('confirms an existing mapping but refuses arbitrary relinking', async () => {
    const adapter = new SupabaseIdentityAdapter();
    await expect(adapter.linkIdentity(account, 'supabase', subject)).resolves.toBeUndefined();
    await expect(adapter.linkIdentity(subject, 'supabase', subject)).rejects.toThrow();
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('does not return a bootstrap received across an account switch', async () => {
    mock.getSession
      .mockResolvedValueOnce({
        data: { session: { access_token: 'session-a', user: { id: subject } } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { session: { access_token: 'session-b', user: { id: 'different-subject' } } },
        error: null,
      });
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).rejects.toThrow();
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('rejects a changed token even when the subject is unchanged', async () => {
    mock.getSession
      .mockResolvedValueOnce({
        data: { session: { access_token: 'session-a', user: { id: subject } } },
      })
      .mockResolvedValueOnce({
        data: { session: { access_token: 'session-new', user: { id: subject } } },
      });
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).rejects.toMatchObject({
      code: 'AUTH_SESSION_CHANGED',
    });
  });

  it('does not accept a provider UUID as a canonical account', async () => {
    mock.bootstrap.mockResolvedValueOnce({ ...identity, id: subject });
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).rejects.toThrow();
  });

  it('fails loudly on session read failure without leaking provider details or dispatching', async () => {
    mock.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'private fixture detail' },
    });
    await expect(new SupabaseIdentityAdapter().identifyActiveCitizen()).rejects.toMatchObject({
      code: 'AUTH_SESSION_UNAVAILABLE',
      message: 'Unable to read the authentication session.',
    });
    expect(mock.bootstrap).not.toHaveBeenCalled();
  });

  it('discards a persisted scope hint if the account changes while storage is pending', async () => {
    setActiveAccountId(account);
    const pending = Promise.withResolvers<string>();
    mock.storage.getStringAsync.mockReturnValueOnce(pending.promise);
    const hint = mock.bondResolver!();
    await vi.waitFor(() => expect(mock.storage.getStringAsync).toHaveBeenCalled());
    setActiveAccountId('other-account');
    pending.resolve(JSON.stringify({ activeBond: { id: bond.id } }));
    await expect(hint).resolves.toBeNull();
  });

  it('uses the server-selected perspective rather than a locally remembered first bond', async () => {
    mock.bootstrap.mockResolvedValue({ ...identity, activeBond: null });
    await expect(new SupabaseIdentityAdapter().getActivePerspective()).resolves.toEqual({
      availableBonds: [bond],
    });
    expect(mock.storage.getStringAsync).not.toHaveBeenCalled();
  });

  it('persists scope selection on the server before mirroring the confirmed result locally', async () => {
    await new SupabaseIdentityAdapter().switchPerspective('school-fixture', 'teacher');
    expect(mock.select).toHaveBeenCalledWith(
      { body: { bondId: bond.id } },
      {
        context: { expectedAccountId: account, retry: 0 },
      },
    );
    expect(mock.storage.set).toHaveBeenCalledWith(
      `active_perspective_${account}`,
      JSON.stringify({
        activeBond: bond,
        availableBonds: [bond],
      }),
    );
  });

  it('does not change the local perspective after a failed selection', async () => {
    mock.select.mockRejectedValueOnce(new Error('Synthetic offline selection'));
    await expect(
      new SupabaseIdentityAdapter().switchPerspective('school-fixture', 'teacher'),
    ).rejects.toThrow('Synthetic offline selection');
    expect(mock.storage.set).not.toHaveBeenCalled();
  });

  it('rejects a selection acknowledged for another account', async () => {
    mock.select.mockResolvedValueOnce({ ...identity, id: subject });
    await expect(
      new SupabaseIdentityAdapter().switchPerspective('school-fixture', 'teacher'),
    ).rejects.toThrow();
    expect(mock.storage.set).not.toHaveBeenCalled();
  });

  it('routes profile updates to the authenticated API without writing tables', async () => {
    await new SupabaseIdentityAdapter().updateProfile(account, { display_name: 'New Name' });
    expect(mock.update).toHaveBeenCalledWith(
      { params: { id: account }, body: { display_name: 'New Name' } },
      { context: { expectedAccountId: account, retry: 0 } },
    );
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('rejects cross-account profile writes and caller-selected initial accounts', async () => {
    const adapter = new SupabaseIdentityAdapter();
    await expect(adapter.updateProfile(subject, { display_name: 'Name' })).rejects.toMatchObject({
      code: 'AUTH_ACCOUNT_MISMATCH',
    });
    await expect(adapter.createInitialBond('teacher', { userId: subject })).rejects.toMatchObject({
      code: 'AUTH_ACCOUNT_MISMATCH',
    });
    expect(mock.update).not.toHaveBeenCalled();
    expect(mock.createBond).not.toHaveBeenCalled();
  });

  it('rejects lifecycle and pricing changes rather than silently stripping them', async () => {
    await expect(
      new SupabaseIdentityAdapter().updateProfile(account, {
        pricing_tier: 'PRO',
        onboarding_completed: true,
      }),
    ).rejects.toThrow();
    expect(mock.update).not.toHaveBeenCalled();
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('uses the server commands for initial scope, profile completion and onboarding', async () => {
    const adapter = new SupabaseIdentityAdapter();
    await adapter.createInitialBond('teacher', { displayName: 'Name' });
    await adapter.completeProfile(account, {
      displayName: 'Name',
      capacityLabel: 'Physics teacher',
    });
    await adapter.completeOnboarding(account);
    expect(mock.createBond).toHaveBeenCalledWith(
      {
        body: {
          orientation: 'teacher',
          confirmCapacityChange: false,
          context: { displayName: 'Name' },
        },
      },
      { context: { expectedAccountId: account, retry: 0 } },
    );
    expect(mock.completeProfile).toHaveBeenCalledWith(
      {
        body: expect.objectContaining({ display_name: 'Name', capacity_label: 'Physics teacher' }),
      },
      { context: { expectedAccountId: account, retry: 0 } },
    );
    expect(mock.completeOnboarding).toHaveBeenCalledWith(
      { body: {} },
      { context: { expectedAccountId: account, retry: 0 } },
    );
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('propagates an unavailable server instead of falling back to direct writes', async () => {
    mock.completeOnboarding.mockRejectedValueOnce(new Error('Synthetic 503'));
    await expect(new SupabaseIdentityAdapter().completeOnboarding(account)).rejects.toThrow(
      'Synthetic 503',
    );
    expect(mock.from).not.toHaveBeenCalled();
  });
});
