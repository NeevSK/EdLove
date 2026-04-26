import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckboxGroup,
} from '../components/ui/checkbox';

describe('Checkbox Component (Robustness)', () => {
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
    const onChange = jest.fn();
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
    const onChange = jest.fn();
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
    const onChange = jest.fn();
    const { getByText } = await render(
      <Checkbox value="test" isDisabled={true} onChange={onChange}>
        <CheckboxLabel>Disabled Checkbox</CheckboxLabel>
      </Checkbox>,
    );

    fireEvent.press(getByText('Disabled Checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
