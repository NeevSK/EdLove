import { fireEvent, render } from '@testing-library/react-native';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from '../components/ui/actionsheet';

describe('Actionsheet Component (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('does not render when isOpen is false', async () => {
    const { queryByText } = await render(
      <Actionsheet isOpen={false} onClose={() => {}}>
        <ActionsheetContent>
          <ActionsheetItemText>Item 1</ActionsheetItemText>
        </ActionsheetContent>
      </Actionsheet>,
    );
    expect(queryByText('Item 1')).toBeNull();
  });

  it('renders content when isOpen is true', async () => {
    const { getByText } = await render(
      <Actionsheet isOpen={true} onClose={() => {}}>
        <ActionsheetContent>
          <ActionsheetItemText>Item 1</ActionsheetItemText>
        </ActionsheetContent>
      </Actionsheet>,
    );
    expect(getByText('Item 1')).toBeTruthy();
  });

  it('calls onClose when backdrop/overlay is pressed', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = await render(
      <Actionsheet isOpen={true} onClose={onClose}>
        <ActionsheetContent>
          <ActionsheetItemText>Item 1</ActionsheetItemText>
        </ActionsheetContent>
      </Actionsheet>,
    );

    fireEvent.press(getByLabelText('backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles item selection and closing', async () => {
    const onItemPress = vi.fn();
    const { getByText } = await render(
      <Actionsheet isOpen={true} onClose={() => {}}>
        <ActionsheetContent>
          <ActionsheetItem onPress={onItemPress}>
            <ActionsheetItemText>Select Me</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>,
    );

    fireEvent.press(getByText('Select Me'));
    expect(onItemPress).toHaveBeenCalled();
  });
});
