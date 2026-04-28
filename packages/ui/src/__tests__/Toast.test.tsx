import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { ToastProvider, useToast } from '../providers/ToastProvider';

const TestComponent = ({ message = 'Hello', type = 'info' as any }) => {
  const { showToast } = useToast();
  return (
    <Pressable onPress={() => showToast({ message, type, duration: 100 })}>
      <Text>Trigger Toast</Text>
    </Pressable>
  );
};

describe('Toast System Logic (2026 Standard)', () => {
  it('triggers and shows a toast message via hook', async () => {
    const { getByText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Test Success" />
      </ToastProvider>,
    );

    expect(queryByText('Test Success')).toBeNull();

    fireEvent.press(getByText('Trigger Toast'));

    expect(getByText('Test Success')).toBeTruthy();
  });

  it('automatically removes toast after duration', async () => {
    jest.useFakeTimers();
    const { getByText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Timed Toast" />
      </ToastProvider>,
    );

    fireEvent.press(getByText('Trigger Toast'));
    expect(getByText('Timed Toast')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(queryByText('Timed Toast')).toBeNull();
    jest.useRealTimers();
  });
});
