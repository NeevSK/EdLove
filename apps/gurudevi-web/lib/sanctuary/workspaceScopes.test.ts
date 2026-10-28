import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ session: vi.fn(), load: vi.fn(), select: vi.fn() }));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { identity: { identifyActiveCitizen: mock.load, selectActiveScope: mock.select } },
}));
vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession: mock.session } }),
}));
import { createBrowserSupabaseClient } from '../supabase/browser';
import { loadWorkspaceScopes, selectWorkspaceScope } from './workspaceScopes';

const account = '123e4567-e89b-8101-8000-426614174020';
const subject = '123e4567-e89b-4000-8000-426614174010';
const firstId = '123e4567-e89b-12d3-a456-426614174030';
const nextId = '123e4567-e89b-12d3-a456-426614174031';
const session = { accessToken: 'access-token', subject };
const client = createBrowserSupabaseClient();
if (!client) throw new Error('Fixture client unavailable');

function identity(selected = firstId) {
  const bonds = [firstId, nextId].map((id) => ({
    id, user_id: account, entity_id: id, entity_type: 'CLASSROOM', capacity: 'teacher', status: 'active',
  }));
  return {
    id: account, email: 'teacher@example.com', name: 'Teacher', display_name: 'Teacher',
    onboarding_completed: true, availableBonds: bonds, activeBond: bonds.find((bond) => bond.id === selected),
    scopeBootstrap: { version: 1, userId: account, name: 'Teacher', primaryCapacity: 'teacher',
      selection: 'selected', activeScope: { bondId: selected, entityId: selected, entityType: 'CLASSROOM', roles: ['teacher'] } },
  };
}

describe('workspace scope authority', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mock.session.mockResolvedValue({ data: { session: { access_token: session.accessToken, user: { id: subject } } }, error: null });
    mock.load.mockResolvedValue(identity());
    mock.select.mockResolvedValue(identity(nextId));
  });
  it('loads owned bonds with session continuity', async () => {
    const snapshot = await loadWorkspaceScopes(client);
    expect(snapshot?.identity.availableBonds).toHaveLength(2);
    expect(mock.load).toHaveBeenCalledWith({}, { context: { expectedSession: session, retry: 0 } });
  });
  it('confirms the selected bond before completing', async () => {
    await expect(selectWorkspaceScope(client, session, account, nextId)).resolves.toBeUndefined();
    expect(mock.select).toHaveBeenCalledWith({ body: { bondId: nextId } }, { context: { expectedSession: session, retry: 0 } });
  });
  it('rejects a mismatched selection and changed session', async () => {
    mock.select.mockResolvedValue(identity());
    await expect(selectWorkspaceScope(client, session, account, nextId)).rejects.toThrow('could not be confirmed');
    mock.session.mockResolvedValue({ data: { session: { access_token: 'changed', user: { id: subject } } }, error: null });
    await expect(selectWorkspaceScope(client, session, account, nextId)).rejects.toThrow('session changed');
  });
});
