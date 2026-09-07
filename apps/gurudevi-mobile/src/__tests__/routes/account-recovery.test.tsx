import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deviceSignOut: vi.fn(),
  replace: vi.fn(),
  screen: vi.fn((props: Record<string, unknown>) => {
    mocks.screenProps = props;
    return null;
  }),
  screenProps: {} as Record<string, unknown>,
  useAuth: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock('@repo/core', () => ({ deviceAccounts: { signOutCurrentAccount: mocks.deviceSignOut } }));

vi.mock('@repo/core/logic', () => ({ useAuth: mocks.useAuth }));

vi.mock('expo-router', () => ({ useRouter: () => ({ replace: mocks.replace }) }));

vi.mock('@repo/ui/components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
  RouteErrorBoundary: () => null,
}));

vi.mock('@repo/ui/providers/ToastProvider', () => ({
  useSanctuaryToast: () => ({ showToast: mocks.showToast }),
}));

vi.mock('@/screens/AccountRecoveryScreen', () => ({ AccountRecoveryScreen: mocks.screen }));

import AccountRecoveryRoute from '@/../app/account-recovery';

describe('AccountRecoveryRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      accountLifecycleStatus: { deactivated_at: null, scheduled_for: null },
      refreshProfile: vi.fn(),
    });
    mocks.deviceSignOut.mockResolvedValue(undefined);
  });

  it('uses the device-account lifecycle and then returns to the public route', async () => {
    act(() => {
      create(<AccountRecoveryRoute />);
    });
    const props = mocks.screenProps as { onSignOut: () => void };

    await act(async () => {
      props.onSignOut();
      await Promise.resolve();
    });

    expect(mocks.deviceSignOut).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith('/welcome');
  });

  it('keeps the user on recovery when device-account sign-out fails', async () => {
    mocks.deviceSignOut.mockRejectedValue(new Error('storage unavailable'));
    act(() => {
      create(<AccountRecoveryRoute />);
    });
    const props = mocks.screenProps as { onSignOut: () => void };

    await act(async () => {
      props.onSignOut();
      await Promise.resolve();
    });

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'storage unavailable' }),
    );
  });
});
