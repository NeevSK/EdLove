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

describe('Toast System Logic (scenario contract)', { tags: ['interaction', 'a11y', 'scenario', 'boundary', 'leaks'] }, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers and shows a toast message via hook', async () => {
    const { getByText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Test Success" duration={5000} />
      </ToastProvider>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(getByText(/Test Success/)).toBeTruthy();
  });

  it('keeps a readable minimum duration before removing a toast', async () => {
    const { getByText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Timed Toast" duration={100} />
      </ToastProvider>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(getByText(/Timed Toast/)).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(2499);
    });

    expect(queryByText(/Timed Toast/)).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(queryByText(/Timed Toast/)).toBeNull();
  });

  it('exposes status feedback as an alert without decorative emoji text', async () => {
    const { getByRole, getByText } = await render(
      <ToastProvider>
        <TestComponent message="Saved" type="success" />
      </ToastProvider>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Saved')).toBeTruthy();
    expect(getByText('Saved').props.children).toBe('Saved');
  });

  it('allows a queued toast to be dismissed before its timer expires', async () => {
    const { getByText, getByLabelText, queryByText } = await render(
      <ToastProvider>
        <TestComponent message="Dismiss me" duration={5000} />
      </ToastProvider>,
    );

    await fireEvent.press(getByText('Trigger Toast'));
    expect(getByText('Dismiss me')).toBeTruthy();

    await fireEvent.press(getByLabelText('Dismiss notification'));
    expect(queryByText('Dismiss me')).toBeNull();
  });
});
