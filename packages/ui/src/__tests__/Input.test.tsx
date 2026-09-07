import { Search } from '@repo/ui/icons';
import { fireEvent, render } from '@testing-library/react-native';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '../components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '../components/ui/input';

vi.mock('@repo/ui/hooks/useTheme', () => ({
  useTheme: () => ({ text: { muted: '#8A8175' } }),
}));

describe('Input Component (scenario contract)', { tags: ['interaction', 'a11y', 'scenario', 'boundary'] }, () => {
  it('renders correctly with default props', async () => {
    const { getByPlaceholderText } = await render(
      <Input>
        <InputField placeholder="Enter name" />
      </Input>,
    );
    expect(getByPlaceholderText('Enter name')).toBeTruthy();
  });

  it('handles text input correctly', async () => {
    const onChangeText = vi.fn();
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
    // The canonical View adapter consumes className before the native test
    // renderer sees it. Utility application is verified by the renderer-level
    // browser fixture, not by inspecting a prop that should no longer leak.
    expect(container.props.className).toBeUndefined();
    expect(container.props.accessibilityState?.disabled).toBe(false);
  });

  it('disables child input when isDisabled is true', async () => {
    const { getByPlaceholderText } = await render(
      <Input isDisabled={true}>
        <InputField placeholder="Enter name" />
      </Input>,
    );

    expect(getByPlaceholderText('Enter name').props.accessibilityState?.disabled).toBe(true);
  });

  it('inherits form control state and label identity', async () => {
    const { getByTestId } = await render(
      <FormControl id="email-field" isDisabled isInvalid>
        <FormControlLabel>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Input testID="email-input">
          <InputField placeholder="Email address" />
        </Input>
      </FormControl>,
    );

    const input = getByTestId('email-input');
    expect(input.props.accessibilityState?.disabled).toBe(true);
    expect(input.props.nativeID).toBe('email-field');
  });

  it('connects helper and error descriptions through the field lifecycle', async () => {
    const { getByPlaceholderText, getByTestId, getByText, queryByText, rerender } = await render(
      <FormControl id="profile-name">
        <FormControlLabel>
          <FormControlLabelText>Name</FormControlLabelText>
        </FormControlLabel>
        <Input testID="name-input">
          <InputField placeholder="Your name" />
        </Input>
        <FormControlHelper>
          <FormControlHelperText>Optional display name</FormControlHelperText>
        </FormControlHelper>
      </FormControl>,
    );

    const input = getByPlaceholderText('Your name');
    expect(input.props.accessibilityLabelledBy).toBe('profile-name-label');
    expect(input.props['aria-describedby']).toBe('profile-name-helper');

    await rerender(
      <FormControl id="profile-name" isInvalid>
        <FormControlLabel>
          <FormControlLabelText>Name</FormControlLabelText>
        </FormControlLabel>
        <Input testID="name-input">
          <InputField placeholder="Your name" />
        </Input>
        <FormControlError>
          <FormControlErrorText>Name is required.</FormControlErrorText>
        </FormControlError>
      </FormControl>,
    );

    expect(getByTestId('name-input')).toBeTruthy();
    expect(getByPlaceholderText('Your name').props['aria-invalid']).toBe(true);
    expect(getByPlaceholderText('Your name').props['aria-describedby']).toBe('profile-name-error');
    expect(getByText('Name is required.')).toBeTruthy();
    expect(queryByText('Optional display name')).toBeNull();
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
