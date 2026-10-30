import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { usePanGesture } from 'react-native-gesture-handler';
import { describe, expect, it, vi } from 'vitest';
import { SwipeRow } from '../SwipeRow/SwipeRow';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));

const pan = () =>
  vi.mocked(usePanGesture).mock.calls.at(-1)?.[0] as {
    onDeactivate: (e: { translationX: number }) => void;
  };

function row(onDone = vi.fn(), onDelete = vi.fn()) {
  return {
    onDone,
    onDelete,
    node: (
      <SwipeRow
        label="Buy chalk"
        start={{ label: 'Done', tone: 'success', onAction: onDone }}
        end={{ label: 'Delete', tone: 'danger', onAction: onDelete }}
      >
        <Text>Buy chalk</Text>
      </SwipeRow>
    ),
  };
}

describe('SwipeRow', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('a long swipe runs the action on that side; a short one does nothing', async () => {
    const r = row();
    await render(r.node);
    pan().onDeactivate({ translationX: 30 });
    expect(r.onDone).not.toHaveBeenCalled();
    pan().onDeactivate({ translationX: 120 });
    expect(r.onDone).toHaveBeenCalledTimes(1);
    pan().onDeactivate({ translationX: -120 });
    expect(r.onDelete).toHaveBeenCalledTimes(1);
  });

  it('offers every action to screen readers by name, without swiping', async () => {
    const r = row();
    await render(r.node);
    const el = screen.getByLabelText('Buy chalk');
    expect(el.props.accessibilityActions.map((a: { name: string }) => a.name)).toEqual(['Done', 'Delete']);
    await fireEvent(el, 'accessibilityAction', { nativeEvent: { actionName: 'Delete' } });
    expect(r.onDelete).toHaveBeenCalledTimes(1);
  });
});
