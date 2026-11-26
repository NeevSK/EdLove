import { showToast } from '@repo/core/lib/feedback.adapter';
import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import { act, render } from '@testing-library/react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastHost } from '../components/native/Toast/ToastHost';
import { resetToasts } from '../components/shared/toasts';
import { ToastProvider } from '../providers/ToastProvider';

vi.mock('../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
vi.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));


afterEach(async () => {
  await act(() => resetToasts());
  vi.useRealTimers();
});
describe('canonical feedback host', () => {
  it('clears outgoing account feedback when scoped state is reset', async () => {
    vi.useFakeTimers();
    const view = await render(<ToastProvider><ToastHost /></ToastProvider>);
    await act(async () => {
      showToast('Outgoing account', 'info');
    });
    expect(view.getByText('Outgoing account')).toBeTruthy();
    await act(async () => {
      sovereignBus.emit('feedback:clear', {});
    });
    expect(view.queryByText('Outgoing account')).toBeNull();
    await view.unmount();
  });
  it('renders imperative requests without auth state and retains the requested duration', async () => {
    vi.useFakeTimers();
    const view = await render(<ToastProvider><ToastHost /></ToastProvider>);
    await act(async () => {
      showToast('Saved offline', 'info', 5000);
    });
    expect(view.getByText('Saved offline')).toBeTruthy();
    await act(async () => {
      vi.advanceTimersByTime(4999);
    });
    expect(view.getByText('Saved offline')).toBeTruthy();
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(view.queryByText('Saved offline')).toBeNull();
    await view.unmount();
  });
  it('releases its bus listener before a replacement host mounts', async () => {
    vi.useFakeTimers();
    const first = await render(<ToastProvider><ToastHost /></ToastProvider>);
    await act(async () => {
      showToast('Outgoing', 'success');
    });
    expect(first.getByText('Outgoing')).toBeTruthy();
    await first.unmount();
    await act(async () => {
      showToast('No host', 'error');
    });
    const replacement = await render(<ToastProvider><ToastHost /></ToastProvider>);
    expect(replacement.queryByText('No host')).toBeNull();
    await act(async () => {
      showToast('Incoming', 'info');
    });
    expect(replacement.getAllByText('Incoming')).toHaveLength(1);
    await replacement.unmount();
  });
});
