import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  context: { userId: 'user-1', citizenship: 'SECOND_CLASS' },
  recomputeFlags: vi.fn(),
  subscribeToFlagChanges: vi.fn(() => vi.fn()),
}));

vi.mock('@repo/core/logic', () => ({
  featureFlags: {
    subscribeToFlagChanges: mocks.subscribeToFlagChanges,
  },
  useFeatureStore: (
    selector: (state: { recomputeFlags: typeof mocks.recomputeFlags }) => unknown,
  ) => selector({ recomputeFlags: mocks.recomputeFlags }),
  usePermissions: () => ({ context: mocks.context }),
}));

import { FeatureProvider } from '@repo/ui/providers/FeatureProvider';

describe('FeatureProvider (component-real web synchronization)', () => {
  beforeEach(() => {
    mocks.recomputeFlags.mockClear();
    mocks.subscribeToFlagChanges.mockClear();
  });

  it('recomputes and subscribes to flag changes without withholding the shell', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <FeatureProvider>
          <>{'shell'}</>
        </FeatureProvider>,
      );
      await Promise.resolve();
    });

    expect(tree!.toJSON()).toBe('shell');
    expect(mocks.recomputeFlags).toHaveBeenCalledWith(mocks.context);
    expect(mocks.subscribeToFlagChanges).toHaveBeenCalledWith(mocks.context, expect.any(Function));
  });
});
