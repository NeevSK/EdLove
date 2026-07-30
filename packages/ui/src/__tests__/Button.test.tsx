import { LogIn } from '@repo/ui/icons';
import { fireEvent, render } from '@testing-library/react-native';
import { Button, ButtonIcon, ButtonText } from '../components/ui/button';

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
});
