import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input, InputField, InputSlot, InputIcon } from '../components/ui/input';
import { Eye, Search } from 'lucide-react-native';

describe('Input Component (Robustness)', () => {
  it('renders correctly with default props', async () => {
    const { getByPlaceholderText } = await render(
      <Input>
        <InputField placeholder="Enter name" />
      </Input>
    );
    expect(getByPlaceholderText('Enter name')).toBeTruthy();
  });

  it('handles text input correctly', async () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = await render(
      <Input>
        <InputField placeholder="Enter name" onChangeText={onChangeText} />
      </Input>
    );
    
    fireEvent.changeText(getByPlaceholderText('Enter name'), 'John Doe');
    expect(onChangeText).toHaveBeenCalledWith('John Doe');
  });

  it('displays invalid state correctly', async () => {
    const { getByTestId } = await render(
      <Input isInvalid={true} testID="input-container">
        <InputField placeholder="Enter name" />
      </Input>
    );
    
    // Check if it has the danger border class (simulation)
    const container = getByTestId('input-container');
    expect(container.props.className).toContain('border-phase-danger');
  });

  it('disables child input when isDisabled is true', async () => {
     const { getByPlaceholderText } = await render(
      <Input isDisabled={true}>
        <InputField placeholder="Enter name" />
      </Input>
    );
    
    expect(getByPlaceholderText('Enter name').props.editable).toBe(false);
  });

  it('supports icons in slots', async () => {
    const { getByTestId } = await render(
      <Input>
        <InputSlot testID="left-slot">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField placeholder="Search..." />
      </Input>
    );
    
    expect(getByTestId('left-slot')).toBeTruthy();
  });
});
