import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  context: { userId: 'user-1', citizenship: 'SECOND_CLASS' },
  cleanup: vi.fn(),
  bindContext: vi.fn(),
}));
vi.mock('@repo/core/logic', () => ({ usePermissions: () => ({ context: mocks.context }) }));
vi.mock('@repo/core/store', () => ({
  useFeatureStore: (selector: (state: { bindContext: typeof mocks.bindContext }) => unknown) =>
    selector({ bindContext: mocks.bindContext }),
}));

import { FeatureProvider } from '@repo/ui/providers/FeatureProvider';

describe('FeatureProvider (real React, owner substituted)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bindContext.mockReturnValue(mocks.cleanup);
  });
  it('binds rollout ownership without withholding the shell and releases it on unmount', async () => {
    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<FeatureProvider>{'shell'}</FeatureProvider>);
    });
    expect(tree.toJSON()).toBe('shell');
    expect(mocks.bindContext).toHaveBeenCalledWith(mocks.context);
    await act(async () => {
      tree.unmount();
    });
    expect(mocks.cleanup).toHaveBeenCalledTimes(1);
  });
});
