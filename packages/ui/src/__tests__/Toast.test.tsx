import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { ToastProvider, useToast } from '../providers/ToastProvider';

const TestComponent = ({ message = 'Hello', type = 'info' as any, duration = 3000 }) => {
  const { showToast } = useToast();
  return (
    <Pressable accessibilityRole="button" onPress={() => showToast({ message, type, duration })}>
      <Text>Trigger Toast</Text>
    </Pressable>
  );
};

describe('Toast System Logic (2026 Standard)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('triggers and shows a toast message via hook', async () => {
    const { getByText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Test Success" duration={5000} />
      </ToastProvider>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(getByText(/Test Success/)).toBeTruthy();
  });

  it('automatically removes toast after duration', async () => {
    const { getByText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Timed Toast" duration={100} />
      </ToastProvider>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(getByText(/Timed Toast/)).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(queryByText(/Timed Toast/)).toBeNull();
  });
});
