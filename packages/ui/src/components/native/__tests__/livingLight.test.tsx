import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Chip } from '../Chip/Chip';
import { Surface } from '../Surface/Surface';
import { TextField } from '../TextField/TextField';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

const flat = (style: unknown) => StyleSheet.flatten(style as never) ?? {};

// The substituted Reanimated computes animated styles at render, so each check
// re-renders once; on a device the UI thread moves the colour without one.
describe('living light', { tags: ['interaction', 'unit'] }, () => {
  it('a field edge moves from rest to focus to the error colour', async () => {
    const w = resolveWorld('wewa', 'morning', 'light');
    const f = w.recipes.field;
    const key = f.form === 'underline' ? 'borderBottomColor' : 'borderColor';
    const tree = (error?: string) => (
      <WorldScope world="wewa" phase="morning" mode="light">
        <TextField label="Name" value="" error={error} />
      </WorldScope>
    );
    const { rerender } = await render(tree());
    const edge = () => flat(screen.getByLabelText('Name').parent?.props.style)[key];
    expect(edge()).toBe(f.states.rest.edge.color);
    await fireEvent(screen.getByLabelText('Name'), 'focus');
    await rerender(tree());
    expect(edge()).toBe(f.states.focus.edge.color);
    await rerender(tree('Needed.'));
    await rerender(tree('Needed.'));
    expect(edge()).toBe(f.states.error.edge.color);
  });

  it('a filled button carries a light layer in its world glow, dark until pressed', async () => {
    const w = resolveWorld('sanctuary', 'morning', 'light');
    await render(
      <WorldScope world="sanctuary" phase="morning" mode="light">
        <Button label="Begin" />
      </WorldScope>,
    );
    const layers = screen
      .getByRole('button', { name: 'Begin' })
      .children.flatMap((c) => (typeof c === 'string' ? [] : [c]))
      .map((c) => flat(c.props.style));
    const light = layers.find((s) => s.backgroundColor === w.recipes.material.states.press.glow);
    expect(light).toMatchObject({ position: 'absolute', opacity: 0 });
  });

  it('a text-form button has no light layer', async () => {
    await render(
      <WorldScope world="sanctuary" phase="morning" mode="light">
        <Button label="Later" variant="quiet" />
      </WorldScope>,
    );
    const w = resolveWorld('sanctuary', 'morning', 'light');
    // Sanctuary's quiet action is an underlined word.
    expect(w.recipes.button.variants.quiet.form).toBe('text');
    const glow = w.recipes.material.states.press.glow;
    const layers = screen
      .getByRole('button', { name: 'Later' })
      .children.flatMap((c) => (typeof c === 'string' ? [] : [c]))
      .map((c) => flat(c.props.style));
    expect(layers.some((s) => s.backgroundColor === glow)).toBe(false);
  });

  it('a checkbox fills with the lamp when checked, from the lamp at zero', async () => {
    const r = resolveWorld('sanctuary', 'morning', 'light').recipes.toggle;
    const tree = (checked: boolean) => (
      <WorldScope world="sanctuary" phase="morning" mode="light">
        <Checkbox label="Notify" checked={checked} onChange={() => {}} />
      </WorldScope>
    );
    const { rerender } = await render(tree(false));
    const box = () => {
      const [first] = screen
        .getByRole('checkbox')
        .children.flatMap((c) => (typeof c === 'string' ? [] : [c]));
      return flat(first?.props.style);
    };
    expect(box().borderColor).toBe(r.edge.color);
    expect(box().backgroundColor).not.toBe(r.on.fill);
    await rerender(tree(true));
    await rerender(tree(true));
    expect(box()).toMatchObject({ borderColor: r.on.fill, backgroundColor: r.on.fill });
  });

  it('a chip paints its selected fill on a layer that does not take touches', async () => {
    const chip = resolveWorld('kandyan', 'morning', 'light').recipes.chip;
    const tree = (selected: boolean) => (
      <WorldScope world="kandyan" phase="morning" mode="light">
        <Chip kind="radio" label="Tamil" selected={selected} />
      </WorldScope>
    );
    const { rerender } = await render(tree(false));
    await rerender(tree(true));
    await rerender(tree(true));
    const layer = screen
      .getByRole('radio', { name: 'Tamil' })
      .children.flatMap((c) => (typeof c === 'string' ? [] : [c]))
      .find((c) => c.props.pointerEvents === 'none');
    expect(layer).toBeDefined();
    // Kandyan chips are outlined, so the selected state has a fill to glide to.
    expect(chip.selected.fill).toBeTruthy();
    expect(flat(layer?.props.style).backgroundColor).toBe(chip.selected.fill);
  });

  it('raised surfaces carry the material wash; a world with an even temperature does not', async () => {
    const w = resolveWorld('wewa', 'morning', 'light');
    await render(
      <WorldScope world="wewa" phase="morning" mode="light">
        <Surface testID="s" tone="raised" />
        <Surface testID="i" tone="inset" />
      </WorldScope>,
    );
    const wash = w.recipes.surface.raised.wash;
    expect(wash).toBeTruthy();
    expect(flat(screen.getByTestId('s').props.style).backgroundImage).toBe(
      `radial-gradient(120% 100% at 50% 35%, ${wash?.centre}, ${wash?.edge})`,
    );
    expect(flat(screen.getByTestId('i').props.style).backgroundImage).toBeUndefined();
  });
});
