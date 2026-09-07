import { fireEvent, render } from '@testing-library/react-native';
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
} from '../components/ui/checkbox';

describe('Checkbox Component (scenario contract)', { tags: ['interaction', 'a11y', 'scenario', 'boundary'] }, () => {
  it('renders correctly', async () => {
    const { getByText } = await render(
      <Checkbox value="test">
        <CheckboxIndicator />
        <CheckboxLabel>Accept Terms</CheckboxLabel>
      </Checkbox>,
    );
    expect(getByText('Accept Terms')).toBeTruthy();
  });

  it('toggles state on press', async () => {
    const onChange = vi.fn();
    const { getByText } = await render(
      <Checkbox value="test" onChange={onChange}>
        <CheckboxIndicator />
        <CheckboxLabel>Accept Terms</CheckboxLabel>
      </Checkbox>,
    );

    fireEvent.press(getByText('Accept Terms'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('works within a CheckboxGroup', async () => {
    const onChange = vi.fn();
    const { getByText } = await render(
      <CheckboxGroup value={['opt1']} onChange={onChange}>
        <Checkbox value="opt1">
          <CheckboxLabel>Option 1</CheckboxLabel>
        </Checkbox>
        <Checkbox value="opt2">
          <CheckboxLabel>Option 2</CheckboxLabel>
        </Checkbox>
      </CheckboxGroup>,
    );

    fireEvent.press(getByText('Option 2'));
    expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2']);
  });

  it('handles disabled state', async () => {
    const onChange = vi.fn();
    const { getByRole } = await render(
      <Checkbox value="test" isDisabled={true} onChange={onChange}>
        <CheckboxLabel>Disabled Checkbox</CheckboxLabel>
      </Checkbox>,
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });
});
