import { fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KitIconProps } from '../../../theme/contracts';
import { haptic } from '../../../utils/haptics';
import { AppHeader } from '../Shell/AppHeader';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
beforeEach(() => vi.mocked(haptic).mockClear());

function Glyph(_: KitIconProps) {
  return <View />;
}

describe('AppHeader', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('keeps the usual places: leading, identity, then actions; one header', async () => {
    const onBack = vi.fn();
    await render(
      <AppHeader
        title="Grade 7B"
        eyebrow="Good morning"
        leading={{ kind: 'back', label: 'Go back', onPress: onBack }}
        actions={[{ key: 'search', label: 'Search', icon: Glyph, onPress: () => {} }]}
      />,
    );
    expect(screen.getAllByRole('header')).toHaveLength(1);
    expect(screen.getByText('Good morning')).toBeTruthy();
    expect(screen.getByText('Grade 7B')).toBeTruthy();
    await fireEvent(screen.getByRole('button', { name: 'Go back' }), 'pressIn');
    await fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalled();
    expect(haptic).toHaveBeenCalled();
  });

  it('a count is said as part of the name, never only shown', async () => {
    await render(
      <AppHeader
        title="Self"
        actions={[
          {
            key: 'bell',
            label: 'Notifications',
            icon: Glyph,
            onPress: () => {},
            badge: 12,
            badgeLabel: '12 unread',
          },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Notifications, 12 unread' })).toBeTruthy();
    expect(screen.getByText('9+')).toBeTruthy();
  });

  it('a toggle says whether it is open; search opens underneath and is named', async () => {
    const onChange = vi.fn();
    const { rerender } = await render(
      <AppHeader
        title="Library"
        actions={[
          { key: 'search', label: 'Search', icon: Glyph, onPress: () => {}, expanded: false },
        ]}
        search={{ open: false, value: '', onChange, label: 'Search the library' }}
      />,
    );
    expect(screen.queryByLabelText('Search the library')).toBeNull();
    await rerender(
      <AppHeader
        title="Library"
        actions={[
          { key: 'search', label: 'Close search', icon: Glyph, onPress: () => {}, expanded: true },
        ]}
        search={{ open: true, value: '', onChange, label: 'Search the library' }}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Close search' }).props.accessibilityState,
    ).toMatchObject({ expanded: true });
    await fireEvent.changeText(screen.getByLabelText('Search the library'), 'leaf');
    expect(onChange).toHaveBeenCalledWith('leaf');
  });

  it('the person and the perspective are named buttons', async () => {
    const onProfile = vi.fn();
    const onSwitch = vi.fn();
    await render(
      <AppHeader
        title="ignored while acting as"
        avatar={{ name: 'Nimal Perera', label: 'Open profile', onPress: onProfile }}
        perspective={{
          label: 'Royal College',
          onPress: onSwitch,
          switchLabel: 'Switch perspective',
        }}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Open profile' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Royal College' }));
    expect(onProfile).toHaveBeenCalled();
    expect(onSwitch).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Royal College' }).props.accessibilityHint).toBe(
      'Switch perspective',
    );
  });
});

describe('AppHeader connection status', { tags: ['a11y', 'unit'] }, () => {
  it('says the connection on the top line, politely, in place of the greeting', async () => {
    await render(<AppHeader title="Self" eyebrow="Good morning" status={{ tone: 'offline', label: 'Offline · 3 waiting' }} />);
    const status = screen.getByLabelText('Offline · 3 waiting');
    expect(status.props.accessibilityLiveRegion).toBe('polite');
    expect(screen.queryByText('Good morning')).toBeNull();
  });
});
