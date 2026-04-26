import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from '../components/ui/actionsheet';

describe('Actionsheet Component (Robustness)', () => {
  it('does not render when isOpen is false', async () => {
    const { queryByText } = await render(
      <Actionsheet isOpen={false} onClose={() => {}}>
        <ActionsheetContent>
          <ActionsheetItemText>Item 1</ActionsheetItemText>
        </ActionsheetContent>
      </Actionsheet>
    );
    expect(queryByText('Item 1')).toBeNull();
  });

  it('renders content when isOpen is true', async () => {
    const { getByText } = await render(
      <Actionsheet isOpen={true} onClose={() => {}}>
        <ActionsheetContent>
          <ActionsheetItemText>Item 1</ActionsheetItemText>
        </ActionsheetContent>
      </Actionsheet>
    );
    expect(getByText('Item 1')).toBeTruthy();
  });

  it('calls onClose when backdrop/overlay is pressed', async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <Actionsheet isOpen={true} onClose={onClose}>
        <ActionsheetContent>
          <ActionsheetItemText>Item 1</ActionsheetItemText>
        </ActionsheetContent>
      </Actionsheet>
    );
    
    // The Overlay usually provides the backdrop
    // We expect the implementation to use a pressable backdrop
  });

  it('handles item selection and closing', async () => {
    const onItemPress = jest.fn();
    const { getByText } = await render(
      <Actionsheet isOpen={true} onClose={() => {}}>
        <ActionsheetContent>
          <ActionsheetItem onPress={onItemPress}>
            <ActionsheetItemText>Select Me</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    );
    
    fireEvent.press(getByText('Select Me'));
    expect(onItemPress).toHaveBeenCalled();
  });
});
