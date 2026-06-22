import { fireEvent, render } from '@testing-library/react-native';
import { Search } from 'lucide-react-native';
import { Input, InputField, InputIcon, InputSlot } from '../components/ui/input';

describe('Input Component (Robustness)', () => {
  it('renders correctly with default props', async () => {
    const { getByPlaceholderText } = await render(
      <Input>
        <InputField placeholder="Enter name" />
      </Input>,
    );
    expect(getByPlaceholderText('Enter name')).toBeTruthy();
  });

  it('handles text input correctly', async () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = await render(
      <Input>
        <InputField placeholder="Enter name" onChangeText={onChangeText} />
      </Input>,
    );

    fireEvent.changeText(getByPlaceholderText('Enter name'), 'John Doe');
    expect(onChangeText).toHaveBeenCalledWith('John Doe');
  });

  it('displays invalid state correctly', async () => {
    const { getByTestId } = await render(
      <Input isInvalid={true} testID="input-container">
        <InputField placeholder="Enter name" />
      </Input>,
    );

    const container = getByTestId('input-container');
    expect(container.props.accessibilityState?.invalid).toBe(true);
  });

  it('disables child input when isDisabled is true', async () => {
    const { getByPlaceholderText } = await render(
      <Input isDisabled={true}>
        <InputField placeholder="Enter name" />
      </Input>,
    );

    expect(getByPlaceholderText('Enter name').props.accessibilityState?.disabled).toBe(true);
  });

  it('supports icons in slots', async () => {
    const { getByTestId } = await render(
      <Input>
        <InputSlot testID="left-slot">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField placeholder="Search..." />
      </Input>,
    );

    expect(getByTestId('left-slot')).toBeTruthy();
  });
});
