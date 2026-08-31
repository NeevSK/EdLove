import { LogIn } from '@repo/ui/icons';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, ButtonIcon, ButtonText } from '../components/ui/button';

jest.mock('@repo/ui/utils/haptics', () => ({
  hapticImpact: jest.fn(),
}));

import { hapticImpact } from '@repo/ui/utils/haptics';

const mockedHapticImpact = hapticImpact as jest.MockedFunction<typeof hapticImpact>;

beforeEach(() => {
  mockedHapticImpact.mockClear();
});

describe('Button Component (Robustness)', () => {
  it('renders correctly with text and accessibility role', async () => {
    const { getByRole } = await render(
      <Button>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('handles press events', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Button onPress={onPress}>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('handles disabled state behaviorally', async () => {
    const onPress = jest.fn();
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
