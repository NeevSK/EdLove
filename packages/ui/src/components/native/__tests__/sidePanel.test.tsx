import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { I18nManager } from 'react-native';
import { usePanGesture } from 'react-native-gesture-handler';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SidePanel } from '../SidePanel/SidePanel';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

type Pan = {
  enabled: boolean;
  failOffsetY: [number, number];
  onDeactivate: (e: { translationX: number; velocityX: number }) => void;
};
const lastPan = () => vi.mocked(usePanGesture).mock.calls.at(-1)?.[0] as unknown as Pan;

function noop() {}

describe('SidePanel / G3 component, gestures and native modal substituted', () => {
  // Unmount each panel, so one test's open panel (and its chrome cover) never leaks into the next.
  afterEach(async () => {
    await cleanup();
    I18nManager.isRTL = false;
  });

  it('is a named modal dialog with its title as a heading', async () => {
    await render(<SidePanel open onClose={noop} title="Lesson notes" />);
    expect(screen.getByLabelText('Lesson notes').props.role).toBe('dialog');
    expect(screen.getByRole('heading', { name: 'Lesson notes' })).toBeTruthy();
  });

  it('covers the chrome while open and gives it back when closed', async () => {
    const view = await render(<SidePanel open onClose={noop} title="Lesson notes" />);
    expect(useActiveSubTabsStore.getState().chromeCovers).toBe(1);
    await act(async () => {
      view.rerender(<SidePanel open={false} onClose={noop} title="Lesson notes" />);
    });
    expect(useActiveSubTabsStore.getState().chromeCovers).toBe(0);
  });

  it('the scrim closes it', async () => {
    const onClose = vi.fn();
    await render(<SidePanel open onClose={onClose} title="Filters" />);
    fireEvent.press(screen.getByTestId('side-panel-scrim'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('nothing but `open` closes it when it is not dismissable', async () => {
    const onClose = vi.fn();
    await render(<SidePanel open onClose={onClose} title="Required" dismissable={false} />);
    expect(lastPan().enabled).toBe(false);
    fireEvent.press(screen.getByTestId('side-panel-scrim'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('a long or fast drag toward its edge lets it go; a short one or the wrong way settles back', async () => {
    const onClose = vi.fn();
    await render(<SidePanel open onClose={onClose} title="Filters" />);
    // From the right edge (the end side in a left-to-right layout), toward the edge is rightward.
    lastPan().onDeactivate({ translationX: 30, velocityX: 100 });
    lastPan().onDeactivate({ translationX: -300, velocityX: -2000 });
    expect(onClose).not.toHaveBeenCalled();
    lastPan().onDeactivate({ translationX: 200, velocityX: 0 });
    lastPan().onDeactivate({ translationX: 10, velocityX: 1400 });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('comes from the other edge in a right-to-left layout', async () => {
    I18nManager.isRTL = true;
    const onClose = vi.fn();
    await render(<SidePanel open onClose={onClose} title="Filters" />);
    lastPan().onDeactivate({ translationX: 200, velocityX: 0 });
    expect(onClose).not.toHaveBeenCalled();
    lastPan().onDeactivate({ translationX: -200, velocityX: 0 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('leaves vertical moves to the content, so it can scroll', async () => {
    await render(<SidePanel open onClose={noop} title="Filters" />);
    expect(lastPan().failOffsetY).toEqual([-12, 12]);
  });
});
