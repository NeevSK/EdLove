import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentRef, RefObject } from 'react';
import { StyleSheet, type View } from 'react-native';
import { usePanGesture } from 'react-native-gesture-handler';
import { describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';
import { Checkbox } from '../Checkbox/Checkbox';
import { Menu } from '../Menu/Menu';
import { RadioGroup } from '../Radio/RadioGroup';
import { Select } from '../Select/Select';
import { Slider } from '../Slider/Slider';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function flat(style: unknown) {
  return StyleSheet.flatten(style as never) ?? {};
}

const CLASSES = [
  { value: 'a', label: 'Grade 6A' },
  { value: 'b', label: 'Grade 6B', hint: 'Mornings' },
  { value: 'c', label: 'Grade 6C', disabled: true },
] as const;

describe('Checkbox', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('reports its state and flips it; mixed turns on', async () => {
    const onChange = vi.fn();
    const { rerender } = await render(<Checkbox label="Notify parents" checked={false} onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Notify parents' });
    expect(box.props['aria-checked']).toBe(false);
    await fireEvent.press(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    await rerender(<Checkbox label="Notify parents" checked="mixed" onChange={onChange} />);
    expect(screen.getByRole('checkbox').props['aria-checked']).toBe('mixed');
    await fireEvent.press(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('fills with each world’s lamp when checked', async () => {
    for (const id of WORLD_IDS) {
      const { unmount, toJSON } = await render(
        <WorldScope world={id} phase="morning" mode="light">
          <Checkbox label="On" checked onChange={() => {}} />
        </WorldScope>,
      );
      const lamp = resolveWorld(id, 'morning', 'light').recipes.toggle.on.fill;
      expect(JSON.stringify(toJSON())).toContain(lamp);
      await unmount();
    }
  });
});

describe('RadioGroup', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named group of radios; choosing calls onChange, disabled ones do not', async () => {
    const onChange = vi.fn();
    await render(<RadioGroup label="Class" value="a" options={CLASSES} onChange={onChange} />);
    expect(screen.getByLabelText('Class').props.role).toBe('radiogroup');
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.props['aria-checked'])).toEqual([true, false, false]);
    await fireEvent.press(screen.getByRole('radio', { name: 'Grade 6B' }));
    expect(onChange).toHaveBeenCalledWith('b');
    await fireEvent.press(screen.getByRole('radio', { name: 'Grade 6C' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Select', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('shows the choice or the placeholder, opens a sheet of choices, and closes on choosing', async () => {
    const onChange = vi.fn();
    await render(
      <Select label="Class" value={null} placeholder="Choose a class" options={CLASSES} onChange={onChange} />,
    );
    const field = screen.getByRole('combobox', { name: 'Class' });
    expect(field.props['aria-expanded']).toBe(false);
    expect(field.props.accessibilityValue).toEqual({ text: 'Choose a class' });
    await fireEvent.press(field);
    expect(screen.getByRole('combobox').props['aria-expanded']).toBe(true);
    await fireEvent.press(screen.getByRole('radio', { name: 'Grade 6A' }));
    expect(onChange).toHaveBeenCalledWith('a');
    expect(screen.getByRole('combobox').props['aria-expanded']).toBe(false);
  });

  it('marks an error and announces it', async () => {
    await render(<Select label="Class" value="a" options={CLASSES} onChange={() => {}} error="Pick a class" />);
    expect(screen.getByText('Pick a class').props.role).toBe('alert');
    expect(screen.getByRole('combobox').props.accessibilityHint).toBe('Pick a class');
  });
});

describe('Menu', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named menu of items; choosing one closes it first, then acts', async () => {
    const anchor = {
      current: { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 0, 40, 40) },
    } as unknown as RefObject<ComponentRef<typeof View> | null>;
    const order: string[] = [];
    await render(
      <Menu
        open
        onClose={() => order.push('close')}
        label="Note options"
        anchorRef={anchor}
        items={[
          { key: 'edit', label: 'Edit', onSelect: () => order.push('edit') },
          { key: 'delete', label: 'Delete', onSelect: () => order.push('delete'), destructive: true },
        ]}
      />,
    );
    expect(screen.getByLabelText('Note options').props.role).toBe('menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(order).toEqual(['close', 'delete']);
  });
});

describe('Slider', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  const panConfig = () =>
    vi.mocked(usePanGesture).mock.calls.at(-1)?.[0] as {
      onBegin: (e: { x: number }) => void;
      onUpdate: (e: { x: number }) => void;
    };

  it('is adjustable with its value read aloud, and steps with accessibility actions', async () => {
    const onChange = vi.fn();
    await render(
      <Slider label="Energy" value={3} min={1} max={5} onChange={onChange} valueText={(v) => `${v} of 5`} />,
    );
    const slider = screen.getByRole('slider', { name: 'Energy' });
    expect(slider.props.accessibilityValue).toEqual({ min: 1, max: 5, now: 3, text: '3 of 5' });
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(4);
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('touching the track jumps to that point', async () => {
    const onChange = vi.fn();
    await render(<Slider label="Volume" value={0} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    await act(() => slider.props.onLayout({ nativeEvent: { layout: { width: 200, height: 44 } } }));
    panConfig().onBegin({ x: 150 });
    expect(onChange).toHaveBeenLastCalledWith(75);
  });

  it('positions the thumb along the track', async () => {
    await render(<Slider label="Volume" value={50} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    await act(() => slider.props.onLayout({ nativeEvent: { layout: { width: 200, height: 44 } } }));
    const thumb = slider.children.at(-1) as unknown as { props: { style: unknown } };
    expect(flat(thumb.props.style).left).toBe(100 - 12);
  });
});
