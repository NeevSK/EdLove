import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';
import { scopedQueryKey } from '../../lib/clientStateFoundation';
import { resetScopedStores } from '../../store/resetScopedStores';
import { commitIdentityScopeSession } from '../../store/scopeSessionCoordinator';
import { bindQueryCacheToAccount } from '../queryAccountBoundary.coordinator';

const bond = (user: string, school: string) => ({
  id: `bond:${user}:${school}:teacher`,
  user_id: user,
  entity_id: school,
  entity_type: 'SCHOOL' as const,
  capacity: 'teacher' as const,
  status: 'active' as const,
});

const signIn = (user: string, school: string) =>
  commitIdentityScopeSession({
    principalId: user,
    availableBonds: [bond(user, school)],
    selectedBond: bond(user, school),
  });

const keyFor = (user: string, school: string) =>
  scopedQueryKey({ principalId: user, tenantId: school, perspectiveId: bond(user, school).id }, ['attendance']);

describe('G2 bindQueryCacheToAccount: no account sees the previous one\'s data', () => {
  beforeEach(() => resetScopedStores());

  it("removes the outgoing account's queries when the account changes, keeping queued writes", async () => {
    const queryClient = new QueryClient();
    const unbind = bindQueryCacheToAccount(queryClient);
    await signIn('account-a', 'school-a');
    queryClient.setQueryData(keyFor('account-a', 'school-a'), { learner: 'A private record' });
    queryClient.setQueryData(['legacy', 'profile'], { principalId: 'account-a' });
    queryClient.getMutationCache().build(queryClient, { mutationKey: ['command', 'a'], mutationFn: async () => undefined });

    await signIn('account-b', 'school-b');
    await Promise.resolve();

    expect(queryClient.getQueryData(keyFor('account-a', 'school-a'))).toBeUndefined();
    expect(queryClient.getQueryData(['legacy', 'profile'])).toBeUndefined();
    expect(queryClient.getMutationCache().getAll()).toHaveLength(1);
    unbind();
  });

  it('leaves the cache alone while the account stays the same', async () => {
    const queryClient = new QueryClient();
    const unbind = bindQueryCacheToAccount(queryClient);
    await signIn('account-a', 'school-a');
    queryClient.setQueryData(keyFor('account-a', 'school-a'), { ok: true });
    await signIn('account-a', 'school-a');
    expect(queryClient.getQueryData(keyFor('account-a', 'school-a'))).toEqual({ ok: true });
    unbind();
  });

  it('stops after unbinding', async () => {
    const queryClient = new QueryClient();
    bindQueryCacheToAccount(queryClient)();
    await signIn('account-a', 'school-a');
    queryClient.setQueryData(['legacy', 'profile'], { ok: true });
    await signIn('account-b', 'school-b');
    expect(queryClient.getQueryData(['legacy', 'profile'])).toEqual({ ok: true });
  });
});
