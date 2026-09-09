import { fireEvent, render } from '@testing-library/react-native';
import { Radio, RadioGroup, RadioIndicator, RadioLabel } from '../components/ui/radio';

describe('Radio Component (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('renders correctly', async () => {
    const { getByText } = await render(
      <Radio value="opt1">
        <RadioIndicator />
        <RadioLabel>Option 1</RadioLabel>
      </Radio>,
    );
    expect(getByText('Option 1')).toBeTruthy();
  });

  it('works within a RadioGroup', async () => {
    const onChange = vi.fn();
    const { getByText } = await render(
      <RadioGroup value="opt1" onChange={onChange}>
        <Radio value="opt1">
          <RadioLabel>Option 1</RadioLabel>
        </Radio>
        <Radio value="opt2">
          <RadioLabel>Option 2</RadioLabel>
        </Radio>
      </RadioGroup>,
    );

    fireEvent.press(getByText('Option 2'));
    expect(onChange).toHaveBeenCalledWith('opt2');
  });

  it('handles disabled state', async () => {
    const onChange = vi.fn();
    const { getByRole } = await render(
      <RadioGroup onChange={onChange}>
        <Radio value="test" isDisabled={true}>
          <RadioLabel>Disabled Radio</RadioLabel>
        </Radio>
      </RadioGroup>,
    );

    const radio = getByRole('radio');
    expect(radio.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(radio);
    expect(onChange).not.toHaveBeenCalled();
  });
});
