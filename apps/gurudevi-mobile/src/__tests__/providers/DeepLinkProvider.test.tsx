import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addEventListener: vi.fn(),
  canOpenURL: vi.fn(),
  getInitialURL: vi.fn(),
  handleURL: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
  storageGetItem: vi.fn(),
  storageRemoveItem: vi.fn(),
  useAuth: vi.fn(),
  useQRDeepLink: vi.fn(),
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

vi.mock('@repo/scanner-kit', () => ({ useQRDeepLink: mocks.useQRDeepLink }));

vi.mock('expo-router', () => ({ router: { push: mocks.push } }));

vi.mock('react-native', () => ({
  Linking: { canOpenURL: mocks.canOpenURL },
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
    mocks.canOpenURL.mockResolvedValue(true);
    mocks.getInitialURL.mockResolvedValue(null);
    mocks.handleURL.mockResolvedValue({ isHandled: true, params: {}, type: 'magic_link' });
    mocks.storageGetItem.mockResolvedValue(null);
    mocks.useAuth.mockReturnValue({ session: null });
  });

  it('registers one native listener and handles a validated foreground URL', async () => {
    await renderProvider();

    expect(mocks.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    const listener = mocks.addEventListener.mock.calls[0]?.[1] as (event: { url: string }) => void;

    await act(async () => {
      listener({ url: 'gurudevi://auth/callback' });
      await Promise.resolve();
    });

    expect(mocks.canOpenURL).toHaveBeenCalledWith('gurudevi://auth/callback');
    expect(mocks.handleURL).toHaveBeenCalledWith('gurudevi://auth/callback');
  });

  it('handles a validated cold-start URL before an authenticated session exists', async () => {
    mocks.getInitialURL.mockResolvedValue('gurudevi://auth/callback');

    await renderProvider();

    expect(mocks.handleURL).toHaveBeenCalledWith('gurudevi://auth/callback');
  });
});
