import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { vi } from 'vitest';
import { resolveWorld } from '../resolve';
import { Button, Chip, Chips, Row, Section, Surface, Text, TextField, WorldScope } from '../native';
import type { WorldId } from '../types';
import { WORLD_IDS } from '../worlds';

vi.mock('@repo/ui/utils/haptics', () => ({ hapticImpact: vi.fn() }));
vi.mock('../../utils/haptics', () => ({ hapticImpact: vi.fn() }));
vi.mock('../../components/BrandPulse', () => ({ BrandPulse: () => null }));

function flat(style: unknown) {
  return StyleSheet.flatten(style as never) ?? {};
}

function inWorld(world: WorldId, node: React.ReactNode) {
  return (
    <WorldScope world={world} phase="morning" mode="light">
      {node}
    </WorldScope>
  );
}

describe('world primitives (contract)', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('Button exposes its label as the accessible name in every world', async () => {
    for (const id of WORLD_IDS) {
      const onPress = vi.fn();
      const { getByRole, unmount } = await render(
        inWorld(id, <Button label="Take attendance" onPress={onPress} />),
      );
      const button = getByRole('button', { name: 'Take attendance' });
      await fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
      await unmount();
    }
  });

  it('Button paints the primary action with the world lamp', async () => {
    const { getByRole } = await render(inWorld('kandyan', <Button label="Begin" />));
    const style = flat(getByRole('button').props.style);
    expect(style.backgroundColor).toBe(resolveWorld('kandyan').tokens.lamp);
  });

  it('a disabled or loading Button does not fire and reports its state', async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(<Button label="Save" loading onPress={onPress} />);
    const button = getByRole('button');
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  });

  it('Text takes its look from the world kind and can switch tone', async () => {
    const w = resolveWorld('wewa', 'morning', 'light');
    const { getByText } = await render(
      inWorld(
        'wewa',
        <>
          <Text kind="title">Grade 7B</Text>
          <Text kind="body" tone="soft">
            Quiet note
          </Text>
        </>,
      ),
    );
    expect(flat(getByText('Grade 7B').props.style)).toMatchObject({
      fontSize: w.recipes.text.title.size,
      color: w.tokens.ink,
    });
    expect(flat(getByText('Quiet note').props.style).color).toBe(w.tokens.inkSoft);
  });

  it('TextField names the input by its label and announces errors', async () => {
    const { getByLabelText, getByRole } = await render(
      <TextField label="Student index" value="20231" error="Index numbers have six digits." />,
    );
    expect(getByLabelText('Student index').props.accessibilityHint).toBe(
      'Index numbers have six digits.',
    );
    expect(getByRole('alert').props.children).toBe('Index numbers have six digits.');
  });

  it('Chip reports selection for toggles and radios', async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(
      <Chips label="Language" single>
        <Chip kind="radio" label="English" selected onPress={onPress} />
        <Chip kind="radio" label="Tamil" />
      </Chips>,
    );
    const english = getByRole('radio', { name: 'English' });
    expect(english.props.accessibilityState).toMatchObject({ checked: true });
    await fireEvent.press(english);
    expect(onPress).toHaveBeenCalled();
  });

  it('Row combines label, value and signal words into one accessible name', async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(
      <Row label="Backup" detail="Off" signal signalLabel="needs you" onPress={onPress} />,
    );
    const row = getByRole('button', { name: 'Backup, Off, needs you' });
    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalled();
  });

  it('Section keeps one heading and the same reading order in every world and density', async () => {
    for (const id of WORLD_IDS) {
      for (const density of ['dense', 'calm'] as const) {
        const { getAllByRole, getByText, unmount } = await render(
          inWorld(
            id,
            <Section title="Look and light" density={density}>
              <Row label="World" detail="Sanctuary" />
              <Row label="Text size" detail="Comfortable" />
            </Section>,
          ),
        );
        expect(getAllByRole('header')).toHaveLength(1);
        expect(getByText('World')).toBeTruthy();
        expect(getByText('Text size')).toBeTruthy();
        await unmount();
      }
    }
  });

  it('Surface tones follow the world', async () => {
    const w = resolveWorld('ratna');
    const { getByTestId } = await render(inWorld('ratna', <Surface testID="s" tone="inset" />));
    expect(flat(getByTestId('s').props.style).backgroundColor).toBe(w.tokens.sunken);
  });
});
