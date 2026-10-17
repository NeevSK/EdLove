import { act, create, type ReactTestRenderer } from 'react-test-renderer';

vi.mock('@repo/ui/primitives', () => ({ Box: 'View', Pressable: 'Pressable', Text: 'Text' }));

import { WorkspaceLayoutRecoveryNotice } from '@/components/self/WorkspaceLayoutRecoveryNotice';

describe('WorkspaceLayoutRecoveryNotice native (G3)', () => {
  let renderer: ReactTestRenderer | undefined;

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
  });

  it('shows the sync error and leaves retry under user control', () => {
    const onRetry = vi.fn();
    act(() => {
      renderer = create(
        <WorkspaceLayoutRecoveryNotice
          error={new Error('conflict')}
          isRetrying={false}
          onRetry={onRetry}
          retryError=""
        />,
      );
    });

    expect(renderer?.root.findByProps({ accessibilityLiveRegion: 'assertive' }).children).toEqual([
      'Your floor changes have not been confirmed by the server.',
    ]);
    const button = renderer?.root.findByProps({ accessibilityRole: 'button' });
    expect(button?.props.disabled).toBe(false);
    act(() => button?.props.onPress());
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders nothing without a sync error', () => {
    act(() => {
      renderer = create(
        <WorkspaceLayoutRecoveryNotice
          error={null}
          isRetrying={false}
          onRetry={vi.fn()}
          retryError=""
        />,
      );
    });

    expect(renderer?.toJSON()).toBeNull();
  });
});
