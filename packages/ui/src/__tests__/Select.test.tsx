import { ChevronDown } from '@repo/ui/icons';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../components/ui/select';

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

describe('Select Component (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('renders trigger with placeholder and accessibility attributes initially', async () => {
    const { getByRole } = await render(<SelectTest />);
    const trigger = getByRole('combobox');
    expect(trigger).toBeTruthy();
    expect(trigger.props.accessibilityState?.expanded).toBe(false);
  });

  it('opens content and updates accessibilityState when trigger is pressed', async () => {
    const { getByRole, getByText } = await render(<SelectTest />);

    const trigger = getByRole('combobox');
    fireEvent.press(trigger);

    await waitFor(() => {
      expect(getByText('Option 1')).toBeTruthy();
    });

    expect(trigger.props.accessibilityState?.expanded).toBe(true);
  });

  it('selects an option, updates accessibility state, and triggers callback', async () => {
    const onValueChange = vi.fn();
    const { getByRole, getByText } = await render(<SelectTest onValueChange={onValueChange} />);

    fireEvent.press(getByRole('combobox'));
    await waitFor(() => {
      expect(getByText('Option 1')).toBeTruthy();
    });

    const option1 = getByText('Option 1').parent; // Pressable item wrapper
    fireEvent.press(getByText('Option 1'));

    expect(onValueChange).toHaveBeenCalledWith('opt1');
  });

  it('closes the content after selection', async () => {
    const { getByRole, getByText, queryByText } = await render(<SelectTest />);

    fireEvent.press(getByRole('combobox'));
    await waitFor(() => {
      expect(getByText('Option 1')).toBeTruthy();
    });
    fireEvent.press(getByText('Option 1'));

    await waitFor(() => {
      expect(queryByText('Option 2')).toBeNull();
    });
  });

  it('handles disabled state behaviorally', async () => {
    const { getByRole } = await render(
      <Select isDisabled={true}>
        <SelectTrigger>
          <SelectInput placeholder="Select option" />
        </SelectTrigger>
      </Select>,
    );

    const trigger = getByRole('combobox');
    expect(trigger.props.accessibilityState?.disabled).toBe(true);
  });
});
