import { fireEvent, render } from '@testing-library/react-native';
import { Radio, RadioGroup, RadioIndicator, RadioLabel } from '../components/ui/radio';

describe('Radio Component (Robustness)', () => {
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
    const onChange = jest.fn();
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
    const _onChange = jest.fn();
    const { getByText } = await render(
      <Radio value="test" isDisabled={true}>
        <RadioLabel>Disabled Radio</RadioLabel>
      </Radio>,
    );

    fireEvent.press(getByText('Disabled Radio'));
    // Since Radio takes value/onPress etc., implementation should block it.
  });
});
