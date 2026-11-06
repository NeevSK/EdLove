// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ session: vi.fn(), entry: vi.fn() }));
vi.mock('./v1Entry', async (original) => ({
  ...(await original<typeof import('./v1Entry')>()),
  readV1Entry: mock.entry,
}));
vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession: mock.session } }),
}));
import { createBrowserSupabaseClient } from '../supabase/browser';
import { ACTIVE_BOND_COOKIE } from './v1Entry';
import { loadWorkspaceScopes, selectWorkspaceScope } from './workspaceScopes';

const account = '123e4567-e89b-8101-8000-426614174020';
const subject = '123e4567-e89b-4000-8000-426614174010';
const firstId = '123e4567-e89b-12d3-a456-426614174030';
const nextId = '123e4567-e89b-12d3-a456-426614174031';
const session = { accessToken: 'access-token', subject };
const client = createBrowserSupabaseClient();
if (!client) throw new Error('Fixture client unavailable');

function entry(bonds = [firstId, nextId]) {
  return {
    accountId: account,
    displayName: 'Teacher',
    onboardingCompleted: true,
    scopes: bonds.map((bondId) => ({
      bondId,
      entityId: bondId,
      entityType: 'CLASSROOM',
      capacity: 'teacher',
      citizenship: 'FIRST_CLASS',
      admission: 'available',
    })),
  };
}

const clearCookie = () => {
  document.cookie = `${ACTIVE_BOND_COOKIE}=; Path=/; Max-Age=0`;
};

describe('workspace scope authority', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearCookie();
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.invalid');
    mock.session.mockResolvedValue({
      data: { session: { access_token: session.accessToken, user: { id: subject } } },
      error: null,
    });
    mock.entry.mockResolvedValue(entry());
  });
  afterEach(() => vi.unstubAllEnvs());

  it('loads owned bonds with session continuity', async () => {
    const snapshot = await loadWorkspaceScopes(client);
    expect(snapshot?.identity.availableBonds).toHaveLength(2);
    expect(snapshot?.identity.activeBond.id).toBe(firstId);
    expect(mock.entry).toHaveBeenCalledWith('https://api.example.invalid', session.accessToken);
  });

  it('remembers a selected bond only after the server lists it for this account', async () => {
    await expect(selectWorkspaceScope(client, session, account, nextId)).resolves.toBeUndefined();
    expect((await loadWorkspaceScopes(client))?.identity.activeBond.id).toBe(nextId);
  });

  it('ignores a remembered bond the account no longer has', async () => {
    document.cookie = `${ACTIVE_BOND_COOKIE}=${nextId}; Path=/`;
    mock.entry.mockResolvedValue(entry([firstId]));
    expect((await loadWorkspaceScopes(client))?.identity.activeBond.id).toBe(firstId);
  });

  it('rejects a bond the account does not hold, another account, and a changed session', async () => {
    mock.entry.mockResolvedValue(entry([firstId]));
    await expect(selectWorkspaceScope(client, session, account, nextId)).rejects.toThrow('could not');
    expect(document.cookie).not.toContain(nextId);
    mock.entry.mockResolvedValue(entry());
    await expect(selectWorkspaceScope(client, session, subject, nextId)).rejects.toThrow('could not');
    mock.session.mockResolvedValue({
      data: { session: { access_token: 'changed', user: { id: subject } } },
      error: null,
    });
    await expect(selectWorkspaceScope(client, session, account, nextId)).rejects.toThrow(
      'session changed',
    );
  });

  it('fails when workspaces are not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    await expect(loadWorkspaceScopes(client)).rejects.toThrow('not configured');
    expect(mock.entry).not.toHaveBeenCalled();
  });
});
