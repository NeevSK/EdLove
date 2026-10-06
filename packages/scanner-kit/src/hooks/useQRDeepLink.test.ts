import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMap = vi.hoisted(() => new Map<string, string>());
const storageSpy = vi.hoisted(() => ({
  delete: vi.fn((key: string) => {
    storageMap.delete(key);
  }),
  set: vi.fn((key: string, value: string) => {
    storageMap.set(key, value);
  }),
  getStringAsync: vi.fn(async (key: string) => storageMap.get(key)),
  getString: vi.fn((key: string) => storageMap.get(key)),
}));

const payload = { action: 'join_class' as const, classroom_id: 'class-1', v: 1 as const };

vi.mock('@repo/core/lib/storage', () => ({ storage: storageSpy }));
const classifyRouteIntent = vi.hoisted(() => vi.fn<any>(() => ({ kind: 'qr' as const, payload })));

vi.mock('@repo/core/logic', () => ({ classifyRouteIntent }));
vi.mock('react-native', () => ({
  Linking: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    getInitialURL: vi.fn(async () => null),
  },
}));

import { dispatchQRDeepLink, redeemPendingQRAction } from './useQRDeepLink';

describe('QR pending-action boundary', () => {
  beforeEach(() => {
    storageMap.clear();
    vi.clearAllMocks();
  });

  it('persists a signed-out QR action and redeems it exactly once', async () => {
    await expect(dispatchQRDeepLink('gurudevi://qr?v=1&action=join_class')).resolves.toBe(true);

    await expect(redeemPendingQRAction()).resolves.toEqual(payload);
    await expect(redeemPendingQRAction()).resolves.toBeNull();
    expect(storageSpy.delete).toHaveBeenCalledOnce();
  });

  it('delivers an authenticated QR action without persisting it', async () => {
    const onQRAction = vi.fn();

    await expect(
      dispatchQRDeepLink('gurudevi://qr?v=1&action=join_class', onQRAction),
    ).resolves.toBe(true);

    expect(onQRAction).toHaveBeenCalledWith(payload);
    await expect(redeemPendingQRAction()).resolves.toBeNull();
  });

  it('does not persist or dispatch an unsupported URL', async () => {
    classifyRouteIntent.mockReturnValueOnce({ kind: 'unsupported' });

    await expect(dispatchQRDeepLink('https://evil.example/qr')).resolves.toBe(false);

    expect(storageSpy.set).not.toHaveBeenCalled();
  });
});
