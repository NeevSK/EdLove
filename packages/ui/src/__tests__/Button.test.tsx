import { LogIn } from '@repo/ui/icons';
import { fireEvent, render } from '@testing-library/react-native';
import { vi } from 'vitest';
import { Button, ButtonIcon, ButtonText } from '../components/ui/button';

vi.mock('@repo/ui/utils/haptics', () => ({
  hapticImpact: vi.fn(),
}));

import { hapticImpact } from '@repo/ui/utils/haptics';

const mockedHapticImpact = vi.mocked(hapticImpact);

beforeEach(() => {
  mockedHapticImpact.mockClear();
});

describe('Button Component (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('exposes an accessible name and button role', async () => {
    const { getByRole } = await render(
      <Button>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );
    const button = getByRole('button', { name: 'Click Me' });
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('handles press events', async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(
      <Button onPress={onPress}>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('handles disabled state behaviorally', async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(
      <Button isDisabled={true} onPress={onPress}>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps the action blocked while loading and recovers to pressable content', async () => {
    const onPress = vi.fn();
    const { getByRole, queryByText, rerender } = await render(
      <Button isLoading onPress={onPress}>
        <ButtonText>Save changes</ButtonText>
      </Button>,
    );

    const loadingButton = getByRole('button');
    expect(loadingButton.props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
    expect(queryByText('Save changes')).toBeNull();

    fireEvent.press(loadingButton);
    expect(onPress).not.toHaveBeenCalled();

    await rerender(
      <Button isLoading={false} onPress={onPress}>
        <ButtonText>Save changes</ButtonText>
      </Button>,
    );

    expect(getByRole('button', { name: 'Save changes' })).toBeTruthy();
    expect(getByRole('button').props.accessibilityState).toMatchObject({
      busy: false,
      disabled: false,
    });
    fireEvent.press(getByRole('button', { name: 'Save changes' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports icons', async () => {
    const { getByRole, getByTestId } = await render(
      <Button>
        <ButtonIcon as={LogIn} testID="button-icon" />
        <ButtonText>Login</ButtonText>
      </Button>,
    );
    expect(getByRole('button')).toBeTruthy();
    expect(getByTestId('button-icon')).toBeTruthy();
  });

  it('fires a light haptic by default on press in', async () => {
    const { getByRole } = await render(
      <Button>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );

    fireEvent(getByRole('button'), 'pressIn');

    expect(mockedHapticImpact).toHaveBeenCalledWith('light');
  });

  it('supports custom haptic strength and opt-out', async () => {
    const { getByRole, rerender } = await render(
      <Button haptic="heavy">
        <ButtonText>Delete</ButtonText>
      </Button>,
    );

    fireEvent(getByRole('button'), 'pressIn');
    expect(mockedHapticImpact).toHaveBeenCalledWith('heavy');

    mockedHapticImpact.mockClear();
    await rerender(
      <Button haptic={false}>
        <ButtonText>Delete</ButtonText>
      </Button>,
    );
    fireEvent(getByRole('button'), 'pressIn');

    expect(mockedHapticImpact).not.toHaveBeenCalled();
  });
});
