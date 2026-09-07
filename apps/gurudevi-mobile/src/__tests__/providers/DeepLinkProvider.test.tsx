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
  DeepLinkType: { CLASSROOM_INVITE: 'classroom_invite' },
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

describe('DeepLinkProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addEventListener.mockReturnValue({ remove: mocks.remove });
    mocks.getInitialURL.mockResolvedValue(null);
    mocks.handleURL.mockResolvedValue({ isHandled: true, params: {}, type: 'magic_link' });
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
    await renderProvider();
    const listener = mocks.addEventListener.mock.calls[0]?.[1] as (event: { url: string }) => void;

    await act(async () => {
      listener({ url: 'gurudevi://qr?token=one' });
      await Promise.resolve();
    });

    expect(mocks.addEventListener).toHaveBeenCalledOnce();
    expect(mocks.dispatchQRDeepLink).toHaveBeenCalledWith('gurudevi://qr?token=one', undefined);
    expect(mocks.handleURL).not.toHaveBeenCalled();
  });
});
