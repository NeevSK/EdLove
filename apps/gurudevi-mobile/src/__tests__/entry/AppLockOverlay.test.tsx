import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasPin: vi.fn<(accountId?: string | null) => Promise<boolean>>(),
  verifyPin: vi.fn<(accountId: string, pin: string) => Promise<boolean>>(),
  routeState: {
    principalId: 'account-1' as string | null,
    isProfileForSession: true,
    session: { user: { id: 'account-1', is_anonymous: false } } as {
      user: { id: string; is_anonymous?: boolean };
    } | null,
  },
  lastDialogProps: null as Record<string, unknown> | null,
}));

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));
vi.mock('@repo/core/logic', () => ({
  accountPin: {
    hasPin: mocks.hasPin,
    verifyPin: mocks.verifyPin,
  },
}));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user: { display_name: string } | null }) => unknown) =>
    selector({ user: { display_name: 'Amara' } }),
}));
vi.mock('@/entry/BootstrapSessionProvider', () => ({
  useBootstrapSession: () => mocks.routeState,
}));
vi.mock('@/components/pin/AccountPinDialog', () => ({
  AccountPinDialog: (props: Record<string, unknown>) => {
    mocks.lastDialogProps = props;
    return createElement('AccountPinDialog', props);
  },
}));

import { AppLockOverlay } from '@/entry/AppLockOverlay';

describe('AppLockOverlay / G1', () => {
  beforeEach(() => {
    mocks.hasPin.mockReset();
    mocks.verifyPin.mockReset();
    mocks.lastDialogProps = null;
    mocks.routeState = {
      principalId: 'account-1',
      isProfileForSession: true,
      session: { user: { id: 'account-1', is_anonymous: false } },
    };
  });

  it('renders nothing when the active account has no PIN configured', async () => {
    mocks.hasPin.mockResolvedValue(false);
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<AppLockOverlay />);
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it('locks on cold launch when a PIN is configured and unlocks on valid verification', async () => {
    mocks.hasPin.mockResolvedValue(true);
    mocks.verifyPin.mockResolvedValue(true);
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<AppLockOverlay />);
    });
    expect(mocks.lastDialogProps?.isOpen).toBe(true);
    expect(mocks.lastDialogProps?.allowClose).toBe(false);

    const onSubmit = mocks.lastDialogProps?.onSubmit as (v: { pin: string }) => Promise<void>;
    await act(async () => {
      await onSubmit({ pin: '1234' });
    });
    expect(mocks.verifyPin).toHaveBeenCalledWith('account-1', '1234');
    expect(tree!.toJSON()).toBeNull();
  });

  it('keeps the overlay locked and shows an error on an invalid PIN', async () => {
    mocks.hasPin.mockResolvedValue(true);
    mocks.verifyPin.mockResolvedValue(false);
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<AppLockOverlay />);
    });
    const onSubmit = mocks.lastDialogProps?.onSubmit as (v: { pin: string }) => Promise<void>;
    await act(async () => {
      await onSubmit({ pin: '9999' });
    });
    expect(tree!.toJSON()).not.toBeNull();
    expect(mocks.lastDialogProps?.error).toBe('Incorrect PIN. Please try again.');
  });
});
