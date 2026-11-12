import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  evaluate: vi.fn(),
  snapshot: vi.fn(),
  verify: vi.fn(),
}));

vi.mock('../../../adapters/powersync/database', () => ({
  getDrizzleDB: () => ({
    select: () => ({ from: async () => [{ content: 'permit(principal, action, resource);' }] }),
    query: {
      permissionSnapshots: { findFirst: state.snapshot },
      policyVersion: { findFirst: async () => ({ hash: 'v1' }) },
    },
  }),
  registerPermissionValidator: vi.fn(),
}));
vi.mock('../cedarClientEvaluator', () => ({ evaluateShape2: state.evaluate }));
vi.mock('../localResourceAttributes.adapter', () => ({
  getLocalResourceAttributes: async () => ({}),
}));
vi.mock('../signature.adapter', () => ({ verifySnapshotSignature: state.verify }));

import { checkLocalPermission } from '../localEvaluator.adapter.native';

describe('native dynamic Cedar snapshot boundary', () => {
  const request = {
    action: 'read' as const,
    resourceType: 'Classroom' as const,
    resourceId: 'c1',
    userContext: {
      userId: 'alice',
      schoolId: 's1',
      capacity: 'teacher' as const,
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL' as const,
    },
  };

  function snapshot(allowed: boolean) {
    state.snapshot.mockResolvedValue({
      userId: 'alice',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: '2099-01-01T00:00:00Z',
      permissions: JSON.stringify({ Classroom: { read: allowed } }),
    });
    state.verify.mockResolvedValue(true);
    vi.stubEnv('EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR', 'true');
  }

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('does not allow unsigned local policies to bypass a missing snapshot', async () => {
    vi.stubEnv('EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR', 'true');
    state.evaluate.mockResolvedValue(true);
    state.snapshot.mockResolvedValue(null);
    const decision = await checkLocalPermission(request);
    expect(decision).toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('does not allow dynamic policy to override a snapshot denial', async () => {
    snapshot(false);
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission(request)).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('uses the signed mapped action when a domain verb is absent', async () => {
    snapshot(true);
    state.snapshot.mockResolvedValue({
      userId: 'alice',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: '2099-01-01T00:00:00Z',
      permissions: JSON.stringify({ Classroom: { update: true } }),
    });
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission({ ...request, action: 'verify' })).resolves.toBe(true);
  });

  it('preserves a signed explicit denial even if the mapped action is allowed', async () => {
    snapshot(true);
    state.snapshot.mockResolvedValue({
      userId: 'alice',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: '2099-01-01T00:00:00Z',
      permissions: JSON.stringify({ Classroom: { verify: false, update: true } }),
    });
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission({ ...request, action: 'verify' })).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('does not replace an invalid explicit value with a mapped grant', async () => {
    snapshot(true);
    state.snapshot.mockResolvedValue({
      userId: 'alice',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: '2099-01-01T00:00:00Z',
      permissions: JSON.stringify({ Classroom: { verify: null, update: true } }),
    });
    await expect(checkLocalPermission({ ...request, action: 'verify' })).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('rejects a signed snapshot containing a non-boolean permission', async () => {
    snapshot(true);
    state.snapshot.mockResolvedValue({
      userId: 'alice',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: '2099-01-01T00:00:00Z',
      permissions: JSON.stringify({ Classroom: { read: 'true' } }),
    });
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission(request)).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('does not evaluate dynamic policies if the snapshot signature is invalid', async () => {
    snapshot(true);
    state.verify.mockResolvedValue(false);
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission(request)).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('does not evaluate dynamic policies for a different account', async () => {
    snapshot(true);
    state.snapshot.mockResolvedValue({
      userId: 'other',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: '2099-01-01T00:00:00Z',
      permissions: JSON.stringify({ Classroom: { read: true } }),
    });
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission(request)).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it('rejects a signed snapshot whose expiry is not a valid timestamp', async () => {
    snapshot(true);
    state.snapshot.mockResolvedValue({
      userId: 'alice',
      activeEntityId: 's1',
      activeEntityType: 'SCHOOL',
      policyVersion: 'v1',
      expiresAt: 'invalid',
      permissions: JSON.stringify({ Classroom: { read: true } }),
    });
    await expect(checkLocalPermission(request)).resolves.toBe(false);
    expect(state.evaluate).not.toHaveBeenCalled();
  });

  it.each([
    { policyVersion: 'v0', expiresAt: '2099-01-01T00:00:00Z' },
    { policyVersion: 'v1', expiresAt: '2000-01-01T00:00:00Z' },
  ])(
    'does not run dynamic policy with stale snapshot $policyVersion / $expiresAt',
    async (stateOverride) => {
      snapshot(true);
      state.snapshot.mockResolvedValue({
        userId: 'alice',
        activeEntityId: 's1',
        activeEntityType: 'SCHOOL',
        permissions: JSON.stringify({ Classroom: { read: true } }),
        ...stateOverride,
      });
      state.evaluate.mockResolvedValue(true);
      await expect(checkLocalPermission(request)).resolves.toBe(false);
      expect(state.evaluate).not.toHaveBeenCalled();
    },
  );

  it('can further restrict a snapshot grant using dynamic policy', async () => {
    snapshot(true);
    state.evaluate.mockResolvedValue(false);
    await expect(checkLocalPermission(request)).resolves.toBe(false);
    expect(state.evaluate).toHaveBeenCalledOnce();
  });

  it('permits when the snapshot and dynamic policy both allow', async () => {
    snapshot(true);
    state.evaluate.mockResolvedValue(true);
    await expect(checkLocalPermission(request)).resolves.toBe(true);
    expect(state.evaluate).toHaveBeenCalledOnce();
  });

  it('falls back to the verified snapshot when dynamic evaluation fails', async () => {
    snapshot(true);
    state.evaluate.mockRejectedValue(new Error('WASM unavailable'));
    await expect(checkLocalPermission(request)).resolves.toBe(true);
    expect(state.evaluate).toHaveBeenCalledOnce();
  });
});
