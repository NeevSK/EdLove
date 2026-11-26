import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { ToastHost } from '../components/native/Toast/ToastHost';
import { resetToasts } from '../components/shared/toasts';
import { ToastProvider, type ToastType, useToast } from '../providers/ToastProvider';

const TestComponent = ({
  message = 'Hello',
  type = 'info' as ToastType,
  duration = 3000,
}) => {
  const { showToast } = useToast();
  return (
    <Pressable accessibilityRole="button" onPress={() => showToast({ message, type, duration })}>
      <Text>Trigger Toast</Text>
    </Pressable>
  );
};

vi.mock('../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

/** The older toast API, drawn by the world's own host. */
const App = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    {children}
    <ToastHost />
  </ToastProvider>
);

describe('Toast System Logic (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary', 'leaks'],
}, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await act(() => resetToasts());
    vi.useRealTimers();
  });

  it('triggers and shows a toast message via hook', async () => {
    const { getByText } = await render(
      <App>
        <TestComponent message="Test Success" duration={5000} />
      </App>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    expect(getByText(/Test Success/)).toBeTruthy();
  });

  it('keeps a readable minimum duration before removing a toast', async () => {
    const { getByText, queryByText } = await render(
      <App>
        <TestComponent message="Timed Toast" duration={100} />
      </App>,
    );

    await fireEvent.press(getByText('Trigger Toast'));
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

  it('announces an error as an alert without decorative emoji text', async () => {
    const { getByText } = await render(
      <App>
        <TestComponent message="Could not save" type="error" />
      </App>,
    );

    await fireEvent.press(getByText('Trigger Toast'));

    let node = getByText('Could not save').parent;
    while (node && node.props.role === undefined) node = node.parent;
    expect(node?.props.role).toBe('alert');
    expect(getByText('Could not save').props.children).toBe('Could not save');
  });

  it('allows a toast to be dismissed before its timer expires', async () => {
    const { getByText, getByTestId, queryByText } = await render(
      <App>
        <TestComponent message="Dismiss me" duration={5000} />
      </App>,
    );

    await fireEvent.press(getByText('Trigger Toast'));
    expect(getByText('Dismiss me')).toBeTruthy();

    await fireEvent(getByTestId('toast-pill'), 'accessibilityAction', {
      nativeEvent: { actionName: 'dismiss' },
    });
    expect(queryByText('Dismiss me')).toBeNull();
  });

  it('carries core feedback from the bus and clears it', async () => {
    const { getByText, queryByText } = await render(<App>{null}</App>);

    await act(() => {
      sovereignBus.emit('feedback:toast', { message: 'Saved offline', type: 'success', duration: 3000 });
    });
    expect(getByText('Saved offline')).toBeTruthy();

    await act(() => {
      sovereignBus.emit('feedback:clear', {});
    });
    expect(queryByText('Saved offline')).toBeNull();
  });
});
