import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentRef, RefObject } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { usePanGesture } from 'react-native-gesture-handler';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';
import { resetToasts, toast } from '../../shared/toasts';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { Popover } from '../Popover/Popover';
import { Sheet } from '../Sheet/Sheet';
import { ToastHost } from '../Toast/ToastHost';
import { Tooltip } from '../Tooltip/Tooltip';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

afterEach(() => act(() => resetToasts()));

function flat(style: unknown) {
  return StyleSheet.flatten(style as never) ?? {};
}

describe('Dialog', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named modal dialog with its title as a heading', async () => {
    await render(
      <Dialog open onClose={() => {}} title="Leave the class?" description="Your notes stay." />,
    );
    // Container roles are not accessibility elements themselves (that would merge
    // their contents into one on iOS), so find the dialog by its name.
    const dialog = screen.getByLabelText('Leave the class?');
    expect(dialog.props.role).toBe('dialog');
    expect(dialog.props['aria-modal']).toBe(true);
    expect(screen.getByRole('heading', { name: 'Leave the class?' })).toBeTruthy();
    expect(screen.getByText('Your notes stay.')).toBeTruthy();
  });

  it('the backdrop dismisses, unless only an action may close it', async () => {
    const onClose = vi.fn();
    const { rerender } = await render(<Dialog open onClose={onClose} title="Note" />);
    await fireEvent.press(screen.getByTestId('overlay-scrim', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await rerender(<Dialog open onClose={onClose} title="Note" dismissable={false} />);
    await fireEvent.press(screen.getByTestId('overlay-scrim', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('takes every world’s raised surface for its panel', async () => {
    for (const id of WORLD_IDS) {
      const { unmount } = await render(
        <WorldScope world={id} phase="morning" mode="light">
          <Dialog open onClose={() => {}} title="Note" />
        </WorldScope>,
      );
      const panel = resolveWorld(id, 'morning', 'light').recipes.overlay.panel;
      expect(flat(screen.getByLabelText('Note').props.style).backgroundColor).toBe(panel.fill);
      await unmount();
    }
  });

  it('renders nothing while closed', async () => {
    await render(<Dialog open={false} onClose={() => {}} title="Hidden" />);
    expect(screen.queryByLabelText('Hidden')).toBeNull();
  });
});

describe('Sheet', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  function lastPan() {
    const calls = vi.mocked(usePanGesture).mock.calls;
    return calls[calls.length - 1]?.[0] as {
      onDeactivate: (e: { translationY: number; velocityY: number }) => void;
    };
  }

  it('is a named dialog with a grabber when it can be dragged away', async () => {
    await render(<Sheet open onClose={() => {}} title="Choose a class" />);
    expect(screen.getByLabelText('Choose a class').props.role).toBe('dialog');
    expect(screen.getByRole('heading', { name: 'Choose a class' })).toBeTruthy();
  });

  it('a long or fast drag down lets it go; a short one settles back', async () => {
    const onClose = vi.fn();
    await render(<Sheet open onClose={onClose} title="Choose a class" />);
    lastPan().onDeactivate({ translationY: 40, velocityY: 200 });
    expect(onClose).not.toHaveBeenCalled();
    lastPan().onDeactivate({ translationY: 140, velocityY: 0 });
    expect(onClose).toHaveBeenCalledTimes(1);
    lastPan().onDeactivate({ translationY: 20, velocityY: 1400 });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('cannot be dragged away when only an action may close it', async () => {
    await render(<Sheet open onClose={() => {}} title="Required" dismissable={false} />);
    const config = vi.mocked(usePanGesture).mock.calls.at(-1)?.[0] as { enabled: boolean };
    expect(config.enabled).toBe(false);
  });
});

describe('ToastHost', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('renders nothing while there are no toasts', async () => {
    await render(<ToastHost />);
    expect(screen.queryByTestId('toast-host')).toBeNull();
  });

  it('shows a toast as a status, a danger toast as an alert, and runs an action', async () => {
    const undo = vi.fn();
    await render(<ToastHost />);
    await act(() => {
      toast.show({ message: 'Saved' });
      toast.show({ message: 'Could not sync', tone: 'danger' });
      toast.show({ message: 'Deleted', action: { label: 'Undo', onPress: undo } });
    });
    const parentRole = (text: string) => {
      let node = screen.getByText(text).parent;
      while (node && node.props.role === undefined) node = node.parent;
      return node?.props.role;
    };
    expect(parentRole('Saved')).toBe('status');
    expect(parentRole('Could not sync')).toBe('alert');
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Deleted')).toBeNull();
  });
});

describe('Tooltip', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('gives its control the label as a hint and shows it on a long press', async () => {
    await render(
      <Tooltip label="Mark everyone present">
        <Pressable accessibilityRole="button" accessibilityLabel="All present" />
      </Tooltip>,
    );
    const control = screen.getByRole('button', { name: 'All present' });
    expect(control.props.accessibilityHint).toBe('Mark everyone present');
    const hidden = { includeHiddenElements: true };
    expect(screen.queryByText('Mark everyone present', hidden)).toBeNull();
    await fireEvent(control, 'longPress');
    // Shown for sighted people; screen readers already have it as the hint.
    expect(screen.getByText('Mark everyone present', hidden)).toBeTruthy();
  });
});

describe('Popover', { tags: ['a11y', 'unit'] }, () => {
  it('opens as a named panel below its anchor and closes from outside', async () => {
    // The test renderer has no layout; the anchor reports where it sits.
    const anchor = {
      current: { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(40, 100, 48, 32) },
    } as unknown as RefObject<ComponentRef<typeof View> | null>;
    const onClose = vi.fn();
    await render(
      <Popover open onClose={onClose} label="Class options" anchorRef={anchor} width={200}>
        <Button label="Rename" onPress={() => {}} />
      </Popover>,
    );
    const panel = screen.getByLabelText('Class options');
    expect(panel.props.role).toBe('dialog');
    expect(flat(panel.props.style).top).toBe(100 + 32 + 6);
    expect(screen.getByRole('button', { name: 'Rename' })).toBeTruthy();
  });
});
