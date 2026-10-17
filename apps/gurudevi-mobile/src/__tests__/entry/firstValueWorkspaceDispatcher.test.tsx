import type { ReactNode } from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  activePerspective: { id: 'perspective-1', kind: 'institutional' as const },
  context: {
    userId: 'user-1',
    activeBond: { id: 'bond-1', capacity: 'teacher' },
    primaryCapacity: 'teacher',
    classroomId: null,
  },
  cedar: {
    isLoading: false,
    error: null as string | null,
    snapshotLoaded: true,
    loadDecisions: vi.fn(),
  },
  emptyState: vi.fn(),
  errorState: vi.fn(),
  redirects: [] as unknown[],
  searchParams: {} as { classroomId?: string; classroomName?: string },
}));

vi.mock('@repo/core/logic', () => ({
  usePermissions: () => ({ context: mocks.context }),
  usePerspectiveSwitch: () => ({ activePerspective: mocks.activePerspective }),
}));
vi.mock('@repo/core/store/useCedarDecisionStore', () => ({
  useCedarDecisionStore: <T,>(selector: (state: typeof mocks.cedar) => T) => selector(mocks.cedar),
}));
vi.mock('@repo/ui/components/BrandPulse', () => ({ BrandPulse: () => null }));
vi.mock('@repo/ui/components/ErrorBoundary', () => ({ RouteErrorBoundary: () => null }));
vi.mock('@repo/ui/components/BrandedEmptyState', () => ({
  BrandedEmptyState: (props: unknown) => {
    mocks.emptyState(props);
    return null;
  },
}));
vi.mock('@repo/ui/components/ErrorState', () => ({
  ErrorState: ({ children, ...props }: { children?: ReactNode }) => {
    mocks.errorState(props);
    return children;
  },
}));
vi.mock('@repo/ui/primitives', () => ({
  Center: 'Center',
  Pressable: 'Pressable',
  Text: 'Text',
}));
vi.mock('expo-router', () => ({
  Redirect: ({ href }: { href: unknown }) => {
    mocks.redirects.push(href);
    return null;
  },
  useLocalSearchParams: () => mocks.searchParams,
}));

import WorkspaceDispatcher from '../../../app/(tabs)/workspace';

describe('first-value workspace dispatch', () => {
  beforeEach(() => {
    mocks.activePerspective = { id: 'perspective-1', kind: 'institutional' };
    mocks.context = {
      userId: 'user-1',
      activeBond: { id: 'bond-1', capacity: 'teacher' },
      primaryCapacity: 'teacher',
      classroomId: null,
    };
    mocks.cedar.isLoading = false;
    mocks.cedar.error = null;
    mocks.cedar.snapshotLoaded = true;
    mocks.cedar.loadDecisions.mockReset();
    mocks.emptyState.mockReset();
    mocks.errorState.mockReset();
    mocks.redirects = [];
    mocks.searchParams = {};
  });

  it.each([
    ['parent', '/workspace/guardian'],
    ['assistantPrincipal', '/workspace/principal'],
    ['developer', '/workspace/founder'],
  ])('sends %s to its existing institutional workspace surface', async (capacity, target) => {
    mocks.context.activeBond.capacity = capacity;
    mocks.context.primaryCapacity = capacity;

    await act(async () => {
      create(<WorkspaceDispatcher />);
    });

    expect(mocks.redirects).toContain(target);
  });

  it('offers a real retry when first-value permission recovery fails', async () => {
    mocks.cedar.snapshotLoaded = false;
    mocks.cedar.error = 'offline';

    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<WorkspaceDispatcher />);
    });

    const retry = tree!.root.findByProps({ accessibilityLabel: 'Retry workspace access' });
    expect(retry.props.accessibilityRole).toBe('button');

    await act(async () => {
      retry.props.onPress();
    });

    expect(mocks.cedar.loadDecisions).toHaveBeenCalledWith('user-1', 'bond-1');
  });

  it('keeps missing student classroom access explicit instead of selecting a generic dashboard', async () => {
    mocks.context.activeBond.capacity = 'student';
    mocks.context.primaryCapacity = 'student';

    await act(async () => {
      create(<WorkspaceDispatcher />);
    });

    expect(mocks.emptyState).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'No classroom selected' }),
    );
    expect(mocks.redirects).toEqual([]);
  });
});
