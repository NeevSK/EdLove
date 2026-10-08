import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addEventListener: vi.fn(),
  getInitialURL: vi.fn(),
  storageGetItem: vi.fn(),
}));

vi.mock('@repo/core/logic', () => ({
  coreRuntime: {
    linking: {
      addEventListener: mocks.addEventListener,
      getInitialURL: mocks.getInitialURL,
    },
    storage: {
      getItem: mocks.storageGetItem,
    },
  },
  useAuth: () => ({ session: null }),
}));

import { DeepLinkProvider } from '@/providers/DeepLinkProvider';

describe('DeepLinkProvider (G3 Component & Redundancy Elimination Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children transparently without modifying the component tree', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <DeepLinkProvider>
          <>{'child-content'}</>
        </DeepLinkProvider>,
      );
      await Promise.resolve();
    });

    expect(tree!.toJSON()).toBe('child-content');
  });

  it('does NOT register redundant Linking.addEventListener listeners (zero dual-brain races)', async () => {
    await act(async () => {
      create(
        <DeepLinkProvider>
          <>{null}</>
        </DeepLinkProvider>,
      );
      await Promise.resolve();
    });

    // Authority is fully delegated to app/+native-intent.tsx
    expect(mocks.addEventListener).not.toHaveBeenCalled();
  });

  it('does NOT query getInitialURL on cold start (preventing initial route collision with +native-intent)', async () => {
    await act(async () => {
      create(
        <DeepLinkProvider>
          <>{null}</>
        </DeepLinkProvider>,
      );
      await Promise.resolve();
    });

    expect(mocks.getInitialURL).not.toHaveBeenCalled();
  });

  it('does NOT race with SessionRouteGate by reading deferred storage items directly', async () => {
    await act(async () => {
      create(
        <DeepLinkProvider>
          <>{null}</>
        </DeepLinkProvider>,
      );
      await Promise.resolve();
    });

    expect(mocks.storageGetItem).not.toHaveBeenCalled();
  });
});
