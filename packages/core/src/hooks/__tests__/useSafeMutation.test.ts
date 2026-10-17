import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  showToast: vi.fn(),
  addToQueue: vi.fn(),
  logAudit: vi.fn(),
  user: { id: 'test-user-1', email: 'test@example.com' },
}));

vi.mock('react', () => ({
  useCallback: <Callback extends (...args: any[]) => any>(cb: Callback) => cb,
  useEffect: (effect: () => void | (() => void)) => {
    effect();
  },
  useMemo: <Value>(factory: () => Value) => factory(),
  useRef: <Value>(initial: Value) => ({ current: initial }),
  useState: <Value>(initial: Value) => [initial, vi.fn()] as const,
}));

vi.mock('@repo/core/store/useAuthStore', () => {
  const mockUseAuthStore = Object.assign(
    <Value>(selector: (state: any) => Value) =>
      selector({ user: mocks.user, showToast: mocks.showToast }),
    {
      getState: () => ({ user: mocks.user, showToast: mocks.showToast }),
      setState: (state: any) => {
        if (state.user !== undefined) mocks.user = state.user;
      },
    },
  );
  return { useAuthStore: mockUseAuthStore };
});

vi.mock('@repo/core/lib/sync/useMutationQueue', () => {
  const mockUseMutationQueue = Object.assign(
    <Value>(selector: (state: any) => Value) => selector({ addToQueue: mocks.addToQueue }),
    {
      getState: () => ({ addToQueue: mocks.addToQueue }),
      setState: vi.fn(),
    },
  );
  return { useMutationQueue: mockUseMutationQueue };
});

vi.mock('@repo/core/lib/sync/MutationAuditLog', () => {
  const mockUseMutationAuditLog = Object.assign(
    <Value>(selector: (state: any) => Value) => selector({ logEntry: mocks.logAudit }),
    {
      getState: () => ({ logEntry: mocks.logAudit }),
      setState: vi.fn(),
    },
  );
  return { useMutationAuditLog: mockUseMutationAuditLog };
});

import { networkManager } from '../../logic/managers/NetworkManager';
import { useSafeMutation } from '../useSafeMutation';

describe('useSafeMutation (G1 Hook / Boundary Contract)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: 'test-user-1', email: 'test@example.com' };
  });

  it('executes online mutation successfully with mutateAsync and executes callbacks with context', async () => {
    vi.spyOn(networkManager, 'isConnected').mockResolvedValue(true);

    const mutationFn = vi.fn().mockResolvedValue({ success: true, id: 'post-1' });
    const onMutate = vi.fn().mockReturnValue({ previousSnapshot: 'snap-1' });
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    const { mutateAsync, isIdle, isLoading } = useSafeMutation(mutationFn, {
      mutationKey: 'createPost',
      scope: 'community',
      mutationType: 'CREATE',
      onMutate,
      onSuccess,
      onSettled,
    });

    const res = await mutateAsync({ title: 'Hello World' });

    expect(onMutate).toHaveBeenCalledWith({ title: 'Hello World' });
    expect(mutationFn).toHaveBeenCalledWith({ title: 'Hello World' });
    expect(onSuccess).toHaveBeenCalledWith(
      { success: true, id: 'post-1' },
      { title: 'Hello World' },
      { previousSnapshot: 'snap-1' },
    );
    expect(onSettled).toHaveBeenCalledWith(
      { success: true, id: 'post-1' },
      null,
      { title: 'Hello World' },
      { previousSnapshot: 'snap-1' },
    );
    expect(res).toEqual({ success: true, id: 'post-1' });
    expect(mocks.addToQueue).not.toHaveBeenCalled();
  });

  it('queues mutation to outbox when offline with user attribution and logs audit', async () => {
    vi.spyOn(networkManager, 'isConnected').mockResolvedValue(false);

    const mutationFn = vi.fn().mockResolvedValue({ success: true });
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    const { mutate } = useSafeMutation(mutationFn, {
      mutationKey: 'createPost',
      scope: 'community',
      mutationType: 'CREATE',
      onSuccess,
      onSettled,
    });

    const res = await mutate({ title: 'Offline Post' });

    // When offline and queued, it returns null and triggers onSuccess(null, vars)
    expect(res).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith(null, { title: 'Offline Post' }, undefined);
    expect(onSettled).toHaveBeenCalledWith(null, null, { title: 'Offline Post' }, undefined);

    // Verify addToQueue arguments with multi-tenant userId attribution
    expect(mocks.addToQueue).toHaveBeenCalledWith({
      name: 'createPost',
      scope: 'community',
      type: 'CREATE',
      userId: 'test-user-1',
      variables: { title: 'Offline Post' },
    });

    // Verify Audit log entry
    expect(mocks.logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'createPost',
        scope: 'community',
        status: 'queued',
      }),
    );
    expect(mocks.showToast).toHaveBeenCalledWith('Saved to Outbox (Offline)', 'info');
  });

  it('passes rollback context to onError and onSettled on execution failure', async () => {
    vi.spyOn(networkManager, 'isConnected').mockResolvedValue(true);

    const networkError = new Error('Server 500');
    const mutationFn = vi.fn().mockRejectedValue(networkError);
    const onMutate = vi.fn().mockReturnValue({ rollbackState: 'saved-state-123' });
    const onError = vi.fn();
    const onSettled = vi.fn();

    const { mutate, mutateAsync, reset } = useSafeMutation(mutationFn, {
      mutationKey: 'updateItem',
      scope: 'classroom',
      mutationType: 'UPDATE',
      retryCount: 0,
      onMutate,
      onError,
      onSettled,
    });

    // Test mutate (swallows error and returns null)
    const result = await mutate({ itemId: 'item-1' });
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Server 500' }),
      { itemId: 'item-1' },
      { rollbackState: 'saved-state-123' },
    );
    expect(onSettled).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ message: 'Server 500' }),
      { itemId: 'item-1' },
      { rollbackState: 'saved-state-123' },
    );

    // Test mutateAsync (throws error to caller)
    await expect(mutateAsync({ itemId: 'item-1' })).rejects.toThrow('Server 500');

    // Test reset
    expect(typeof reset).toBe('function');
    reset();
  });

  it('debounces identical in-flight rapid taps and prevents duplicate simultaneous calls', async () => {
    vi.spyOn(networkManager, 'isConnected').mockResolvedValue(true);

    let resolveMutation: (val: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveMutation = resolve;
    });
    const mutationFn = vi.fn().mockImplementation(() => pendingPromise);

    const { mutate } = useSafeMutation(mutationFn, {
      mutationKey: 'likePost',
      scope: 'community',
      mutationType: 'CREATE',
    });

    // Trigger two rapid simultaneous calls with identical payload
    const call1 = mutate({ postId: 'post-99' });
    const call2 = mutate({ postId: 'post-99' });

    // Allow promise microtasks to run and initiate execution
    resolveMutation!({ liked: true });
    const [res1, res2] = await Promise.all([call1, call2]);

    // Only 1 execution reached mutationFn
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(res1).toEqual({ liked: true });
    expect(res2).toBeNull();
  });
});
