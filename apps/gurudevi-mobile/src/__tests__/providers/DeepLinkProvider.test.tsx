import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addEventListener: vi.fn(),
  dispatchQRDeepLink: vi.fn(),
  getInitialURL: vi.fn(),
  handleURL: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
  storageGetItem: vi.fn(),
  storageRemoveItem: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('@repo/core/logic', () => ({
  DeepLinkType: { CLASSROOM_INVITE: 'CLASSROOM_INVITE', AUTH_CALLBACK: 'AUTH_CALLBACK' },
  coreRuntime: {
    linking: {
      addEventListener: mocks.addEventListener,
      getInitialURL: mocks.getInitialURL,
    },
    storage: {
      getItem: mocks.storageGetItem,
      removeItem: mocks.storageRemoveItem,
    },
  },
  deepLink: { handleURL: mocks.handleURL },
  useAuth: mocks.useAuth,
}));

vi.mock('@repo/scanner-kit', () => ({ dispatchQRDeepLink: mocks.dispatchQRDeepLink }));

vi.mock('expo-router', () => ({ router: { push: mocks.push } }));

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import { DeepLinkProvider } from '@/providers/DeepLinkProvider';

async function renderProvider() {
  await act(async () => {
    create(
      <DeepLinkProvider>
        <>{null}</>
      </DeepLinkProvider>,
    );
    await Promise.resolve();
  });
}

describe('DeepLinkProvider (G3 Component & Runtime Provider Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addEventListener.mockReturnValue({ remove: mocks.remove });
    mocks.getInitialURL.mockResolvedValue(null);
    mocks.handleURL.mockResolvedValue({ isHandled: true, params: {}, type: 'AUTH_CALLBACK' });
    mocks.storageGetItem.mockResolvedValue(null);
    mocks.useAuth.mockReturnValue({ session: null });
  });

  it('registers one native listener and dispatches an accepted foreground URL once', async () => {
    await renderProvider();

    expect(mocks.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    const listener = mocks.addEventListener.mock.calls[0]?.[1] as (event: { url: string }) => void;

    await act(async () => {
      listener({ url: 'gurudevi://auth/callback' });
      await Promise.resolve();
    });

    expect(mocks.handleURL).toHaveBeenCalledWith('gurudevi://auth/callback');
  });

  it('handles a validated cold-start URL before an authenticated session exists', async () => {
    mocks.getInitialURL.mockResolvedValue('gurudevi://auth/callback');

    await renderProvider();

    expect(mocks.handleURL).toHaveBeenCalledWith('gurudevi://auth/callback');
  });

  it('passes signed-out QR links to the pending-action dispatcher without a second listener', async () => {
    mocks.dispatchQRDeepLink.mockResolvedValue(true);
    await renderProvider();
    const listener = mocks.addEventListener.mock.calls[0]?.[1] as (event: { url: string }) => void;
    const qrUrl = 'gurudevi://qr?v=1&action=join_class&classroom_id=class-1';

    await act(async () => {
      listener({ url: qrUrl });
      await Promise.resolve();
    });

    expect(mocks.addEventListener).toHaveBeenCalledOnce();
    expect(mocks.dispatchQRDeepLink).toHaveBeenCalledWith(qrUrl, undefined);
    expect(mocks.handleURL).not.toHaveBeenCalled();
  });

  it('does not treat a rejected QR dispatch as handled', async () => {
    mocks.dispatchQRDeepLink.mockResolvedValue(false);
    mocks.storageGetItem.mockResolvedValue(
      'gurudevi://qr?v=1&action=join_class&classroom_id=class-1',
    );
    await renderProvider();

    expect(mocks.dispatchQRDeepLink).toHaveBeenCalledWith(
      'gurudevi://qr?v=1&action=join_class&classroom_id=class-1',
      undefined,
    );
    expect(mocks.storageRemoveItem).not.toHaveBeenCalled();
  });

  it('navigates to community tab with inviteCode when a classroom invite deep link is received', async () => {
    mocks.handleURL.mockResolvedValue({
      isHandled: false,
      params: { inviteCode: 'INVITE-999' },
      type: 'CLASSROOM_INVITE',
    });

    await renderProvider();
    const listener = mocks.addEventListener.mock.calls[0]?.[1] as (event: { url: string }) => void;

    await act(async () => {
      listener({ url: 'gurudevi://invite/classroom/INVITE-999' });
      await Promise.resolve();
    });

    expect(mocks.push).toHaveBeenCalledWith({
      pathname: '/community',
      params: { inviteCode: 'INVITE-999' },
    });
  });

  it('consumes and removes deferred deep links from storage on app launch', async () => {
    mocks.storageGetItem.mockResolvedValue('gurudevi://auth/callback?code=def-123');

    await renderProvider();

    expect(mocks.handleURL).toHaveBeenCalledWith('gurudevi://auth/callback?code=def-123');
    expect(mocks.storageRemoveItem).toHaveBeenCalledWith('deferred_deep_link');
  });
});
