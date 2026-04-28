import { fireEvent, render } from '@testing-library/react-native';
import { LogIn } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '../components/ui/button';

describe('Button Component (Robustness)', () => {
  it('renders correctly with text', async () => {
    const { getByText } = await render(
      <Button>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('handles press events', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button onPress={onPress}>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('handles disabled state', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button isDisabled={true} onPress={onPress}>
        <ButtonText>Click Me</ButtonText>
      </Button>,
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports icons', async () => {
    const { getByTestId } = await render(
      <Button>
        <ButtonIcon as={LogIn} testID="button-icon" />
        <ButtonText>Login</ButtonText>
      </Button>,
    );
    expect(getByTestId('button-icon')).toBeTruthy();
  });
});
