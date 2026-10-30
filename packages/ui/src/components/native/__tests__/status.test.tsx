import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { resolveWorld } from '../../../theme/resolve';
import { initialsOf } from '../../shared/initials';
import { IconButton } from '../IconButton/IconButton';
import { Link } from '../Link/Link';
import { EmptyState, ErrorState } from '../States/States';
import { Avatar, Badge, Divider, Progress } from '../Status/Status';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn() }));

function flat(style: unknown) {
  return StyleSheet.flatten(style as never) ?? {};
}

const Dot = (_props: { size?: number; color?: string }) => null;

describe('IconButton and Link', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('an icon button is named by its label, which is also its hint', async () => {
    const onPress = vi.fn();
    await render(<IconButton icon={Dot} label="Close" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.props.accessibilityHint).toBe('Close');
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('a link is a named link in the deep lamp, underlined', async () => {
    const onPress = vi.fn();
    await render(<Link label="Read the policy" onPress={onPress} />);
    const link = screen.getByRole('link', { name: 'Read the policy' });
    const t = resolveWorld('sanctuary', 'morning', 'light').tokens;
    expect(flat(link.props.style)).toMatchObject({ color: t.lampDeep, textDecorationLine: 'underline' });
    await fireEvent.press(link);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Progress, Badge, Avatar, Divider', { tags: ['a11y', 'unit'] }, () => {
  it('a known progress reports its value; an unknown one is busy', async () => {
    const { rerender } = await render(<Progress label="Uploading" value={0.42} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 42 });
    await rerender(<Progress label="Uploading" />);
    expect(screen.getByRole('progressbar').props['aria-busy']).toBe(true);
  });

  it('a badge wears its tone from the world', async () => {
    await render(<Badge label="New" tone="lamp" />);
    const b = resolveWorld('sanctuary', 'morning', 'light').recipes.status.badge.lamp;
    expect(flat(screen.getByText('New').props.style).color).toBe(b.ink);
  });

  it('an avatar is an image named for the person, with initials when there is no photo', async () => {
    await render(<Avatar name="Nimal Perera" />);
    expect(screen.getByRole('image', { name: 'Nimal Perera' })).toBeTruthy();
    expect(screen.getByText('NP')).toBeTruthy();
  });

  it('initials use the first and last words, in any script', () => {
    expect(initialsOf('  amara  ')).toBe('A');
    expect(initialsOf('Kamala Devi Silva')).toBe('KS');
    expect(initialsOf('நிலா ராஜ்')).toBe('நர');
    expect(initialsOf('')).toBe('');
  });

  it('a divider is a separator in the world’s line', async () => {
    const { toJSON } = await render(<Divider />);
    expect(JSON.stringify(toJSON())).toContain('"role":"separator"');
  });
});

describe('EmptyState and ErrorState', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('an empty state has a heading and its one action', async () => {
    const onPress = vi.fn();
    await render(<EmptyState title="No classes yet" message="Add your first class." action={{ label: 'Add a class', onPress }} />);
    expect(screen.getByRole('heading', { name: 'No classes yet' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Add a class' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('an error state is announced and offers to try again', async () => {
    const onPress = vi.fn();
    await render(<ErrorState title="Could not load" retry={{ label: 'Try again', onPress }} />);
    let node = screen.getByText('Could not load') as typeof screen.root | null;
    expect(node?.props.role).toBe('heading');
    node = node?.parent ?? null;
    while (node && node.props.role === undefined) node = node.parent;
    expect(node?.props.role).toBe('alert');
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
