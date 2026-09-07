import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clear: vi.fn(),
  useAuth: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('@repo/core', () => ({ useAuth: mocks.useAuth }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: mocks.useQueryClient }));

import { AuthQueryCacheBoundary } from '@/entry/AuthQueryCacheBoundary';

describe('AuthQueryCacheBoundary', () => {
  let renderer: ReactTestRenderer;
  let subjectId: string | null;

  beforeEach(() => {
    vi.clearAllMocks();
    subjectId = 'account-a';
    mocks.useAuth.mockImplementation(() => ({
      session: subjectId ? { user: { id: subjectId } } : null,
    }));
    mocks.useQueryClient.mockReturnValue({ clear: mocks.clear });

    act(() => {
      renderer = create(<AuthQueryCacheBoundary />);
    });
  });

  afterEach(() => {
    act(() => renderer.unmount());
  });

  it('preserves cache on first mount and clears it once when the account changes', () => {
    expect(mocks.clear).not.toHaveBeenCalled();

    subjectId = 'account-b';
    act(() => renderer.update(<AuthQueryCacheBoundary />));
    expect(mocks.clear).toHaveBeenCalledTimes(1);

    act(() => renderer.update(<AuthQueryCacheBoundary />));
    expect(mocks.clear).toHaveBeenCalledTimes(1);
  });

  it('clears account-bound cache after sign-out', () => {
    subjectId = null;
    act(() => renderer.update(<AuthQueryCacheBoundary />));

    expect(mocks.clear).toHaveBeenCalledTimes(1);
  });
});
