import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '../components/ui/select';
import { ChevronDown } from 'lucide-react-native';

/**
 * Proactive Component Testing
 * Defines the contract for the hardened Select primitive.
 */

// Simple wrapper to handle state in tests
const SelectTest = ({ onValueChange }: { onValueChange?: (val: string) => void }) => {
  const [value, setValue] = React.useState('');

  const handleValueChange = (val: string) => {
    setValue(val);
    onValueChange?.(val);
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectInput placeholder="Select option" value={value} />
        <SelectIcon as={ChevronDown} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          <SelectItem label="Option 1" value="opt1" />
          <SelectItem label="Option 2" value="opt2" />
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

describe('Select Component (Robustness)', () => {
  it('renders trigger with placeholder initially', async () => {
    const { getByText } = await render(<SelectTest />);
    expect(getByText('Select option')).toBeTruthy();
  });

  it('opens content when trigger is pressed', async () => {
    const { getByText } = await render(<SelectTest />);
    
    fireEvent.press(getByText('Select option'));
    
    await waitFor(() => {
      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
    });
  });

  it('selects an option and updates the trigger text', async () => {
    const onValueChange = jest.fn();
    const { getByText } = await render(<SelectTest onValueChange={onValueChange} />);
    
    fireEvent.press(getByText('Select option'));
    fireEvent.press(getByText('Option 1'));
    
    expect(onValueChange).toHaveBeenCalledWith('opt1');
    expect(getByText('Option 1')).toBeTruthy();
  });

  it('closes the content after selection', async () => {
    const { getByText, queryByText } = await render(<SelectTest />);
    
    fireEvent.press(getByText('Select option'));
    fireEvent.press(getByText('Option 1'));
    
    await waitFor(() => {
      expect(queryByText('Option 2')).toBeNull();
    });
  });

  it('handles disabled state', async () => {
    const { getByText, queryByText } = await render(
      <Select isDisabled={true}>
        <SelectTrigger>
          <SelectInput placeholder="Select option" />
        </SelectTrigger>
        <SelectPortal>
           <SelectItem label="Option 1" value="opt1" />
        </SelectPortal>
      </Select>
    );

    fireEvent.press(getByText('Select option'));
    expect(queryByText('Option 1')).toBeNull();
  });
});
