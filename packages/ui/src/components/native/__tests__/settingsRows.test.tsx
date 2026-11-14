import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic } from '../../../utils/haptics';
import { safeLinkUrl } from '../../shared/basics';
import { ChoiceRow, DangerRow, LinkRow } from '../Settings/SettingsRows';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
beforeEach(() => vi.mocked(haptic).mockClear());

describe('settings links', { tags: ['unit'] }, () => {
  it('opens web, mail and phone addresses only', () => {
    expect(safeLinkUrl('https://gurudevi.app/help')).toBe('https://gurudevi.app/help');
    expect(safeLinkUrl('mailto:support@gurudevi.lk')).toBe('mailto:support@gurudevi.lk');
    expect(safeLinkUrl('tel:+94112345678')).toBe('tel:+94112345678');
    expect(safeLinkUrl('javascript:alert(1)')).toBeNull();
    expect(safeLinkUrl('mailto:a b@x')).toBeNull();
    expect(safeLinkUrl('//evil.example')).toBeNull();
  });
});

describe('ChoiceRow', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('says the choice and changes it from a sheet', async () => {
    const onChange = vi.fn();
    await render(
      <ChoiceRow
        label="Language"
        value="en"
        onChange={onChange}
        options={[
          { value: 'en', label: 'English' },
          { value: 'si', label: 'සිංහල' },
        ]}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Language, English' }));
    await act(async () => {});
    await fireEvent.press(screen.getByRole('radio', { name: 'සිංහල' }));
    expect(onChange).toHaveBeenCalledWith('si');
  });

  it('says Not set when nothing is chosen', async () => {
    await render(
      <ChoiceRow
        label="Grade"
        value={null}
        onChange={() => {}}
        options={[{ value: '7', label: '7' }]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Grade, Not set' })).toBeTruthy();
  });
});

describe('LinkRow', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('an outside link says so and opens with the system', async () => {
    const open = vi.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<LinkRow label="Help centre" href="https://gurudevi.app/help" external />);
    const row = screen.getByRole('button', { name: 'Help centre' });
    expect(row.props.accessibilityHint).toBe('Opens outside the app');
    await fireEvent.press(row);
    expect(open).toHaveBeenCalledWith('https://gurudevi.app/help');
  });

  it('refuses an unsafe address with error feedback instead of opening it', async () => {
    const open = vi.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    open.mockClear();
    await render(<LinkRow label="Bad" href="javascript:alert(1)" external />);
    await fireEvent.press(screen.getByRole('button', { name: 'Bad' }));
    expect(open).not.toHaveBeenCalled();
    expect(haptic).toHaveBeenCalled();
  });
});

describe('DangerRow', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('asks first, runs only on the danger button, and says when it is working', async () => {
    const onConfirm = vi.fn();
    const { rerender } = await render(
      <DangerRow
        label="Sign out of all devices"
        onConfirm={onConfirm}
        confirm={{ title: 'Sign out everywhere?', confirmLabel: 'Sign out' }}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await act(async () => {});
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await act(async () => {});
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await rerender(<DangerRow label="Sign out of all devices" onConfirm={onConfirm} busy />);
    expect(screen.getByText('Working…')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).toBeNull();
  });
});
